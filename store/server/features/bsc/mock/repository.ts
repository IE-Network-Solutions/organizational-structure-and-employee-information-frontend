import {
  AssignScorecardInput,
  BscPerspectiveDefinition,
  CreateEvaluationConfigInput,
  CreateKpiLibraryInput,
  CreatePerspectiveInput,
  CycleStatus,
  EmployeeScorecard,
  EvaluationCycle,
  KpiApprovalStatus,
  KpiLibraryItem,
  ReportKpiInput,
  AdjustReportedKpiInput,
  RolePerspectiveAllocation,
  SaveRolePerspectiveInput,
  ScorecardAuditEvent,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import { hasEvidenceArtifact } from '@/utils/bsc/evidence';
import {
  computeCompositeScore,
  validateKpisMatchPerspectiveAllocation,
  validatePerspectiveWeights,
  validateWeights,
} from '@/utils/bsc/scoring';
import { assertTransition } from '@/utils/bsc/stateMachine';
import {
  SEED_CYCLES,
  SEED_KPI_LIBRARY,
  SEED_PAST_CYCLES,
  SEED_PERSPECTIVES,
  SEED_ROLE_PERSPECTIVES,
  SEED_SCORECARDS,
} from './seed';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  const wait = process.env.NODE_ENV === 'test' ? 0 : ms;
  return new Promise((resolve) => setTimeout(() => resolve(value), wait));
}

export class BscMockRepository {
  private kpiLibrary: KpiLibraryItem[] = SEED_KPI_LIBRARY.map((k) => ({
    ...k,
  }));
  private cycles: EvaluationCycle[] = [
    ...SEED_CYCLES.map((c) => ({ ...c })),
    ...SEED_PAST_CYCLES.map((c) => ({ ...c })),
  ];
  private scorecards: EmployeeScorecard[] = SEED_SCORECARDS.map((s) => ({
    ...s,
    targets: s.targets.map((t) => ({ ...t })),
    finalEvaluation: s.finalEvaluation ? { ...s.finalEvaluation } : null,
  }));
  private hrisOutbox: Array<{
    scorecardId: string;
    score: number;
    at: string;
  }> = [];
  private auditLog: ScorecardAuditEvent[] = [];
  private rolePerspectives: RolePerspectiveAllocation[] =
    SEED_ROLE_PERSPECTIVES.map((row) => ({
      ...row,
      weights: { ...row.weights },
    }));
  private perspectives: BscPerspectiveDefinition[] = SEED_PERSPECTIVES.map(
    (row) => ({ ...row }),
  );

  listKpis(filters?: {
    evaluationConfigId?: string;
    departmentName?: string;
    positionTitle?: string;
    search?: string;
  }): Promise<KpiLibraryItem[]> {
    let items = [...this.kpiLibrary];
    if (filters?.evaluationConfigId) {
      items = items.filter(
        (k) => k.evaluationConfigId === filters.evaluationConfigId,
      );
    }
    if (filters?.departmentName) {
      items = items.filter(
        (k) =>
          (k.departmentName || '')
            .toLowerCase()
            .includes(filters.departmentName!.toLowerCase()) ||
          !k.departmentName,
      );
    }
    if (filters?.positionTitle) {
      items = items.filter(
        (k) =>
          (k.positionTitle || '')
            .toLowerCase()
            .includes(filters.positionTitle!.toLowerCase()) || !k.positionTitle,
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          (k.departmentName || '').toLowerCase().includes(q) ||
          (k.positionTitle || '').toLowerCase().includes(q),
      );
    }
    return delay(items);
  }

  async createKpi(input: CreateKpiLibraryInput): Promise<KpiLibraryItem> {
    if (!input.evaluationConfigId) {
      throw new Error('evaluationConfigId is required');
    }
    if (!input.name?.trim()) {
      throw new Error('Name is required');
    }
    if (input.weight === undefined || input.weight === null) {
      throw new Error('Weight is required');
    }
    if (!input.perspective?.trim()) {
      throw new Error('Select a perspective');
    }
    const item: KpiLibraryItem = {
      id: uid('kpi'),
      targetLogic: TargetLogic.HigherBetter,
      measurementUnit: '%',
      ...input,
      weight: Number(input.weight),
      suggestedWeight: Number(input.weight),
      description: input.description ?? null,
      createdAt: new Date().toISOString(),
    };
    this.kpiLibrary.unshift(item);
    return delay(item);
  }

  async updateKpi(
    id: string,
    input: Partial<CreateKpiLibraryInput>,
  ): Promise<KpiLibraryItem> {
    const idx = this.kpiLibrary.findIndex((k) => k.id === id);
    if (idx < 0) throw new Error('KPI not found');
    this.kpiLibrary[idx] = { ...this.kpiLibrary[idx], ...input };
    return delay(this.kpiLibrary[idx]);
  }

  deleteKpi(id: string): Promise<void> {
    this.kpiLibrary = this.kpiLibrary.filter((k) => k.id !== id);
    return delay(undefined);
  }

  /** Replace a role's KPI set in one shot (create / update / delete). Weights must sum to 100. */
  async syncRoleKpis(input: {
    evaluationConfigId: string;
    positionId: string | null;
    positionTitle: string;
    departmentName?: string | null;
    rows: Array<{
      id?: string | null;
      name: string;
      description?: string | null;
      weight: number;
      perspective?: CreateKpiLibraryInput['perspective'];
      targetLogic?: CreateKpiLibraryInput['targetLogic'];
      measurementUnit?: string;
    }>;
    existingIds: string[];
  }): Promise<KpiLibraryItem[]> {
    if (!input.rows.length) {
      throw new Error('Add at least one KPI');
    }
    for (const row of input.rows) {
      if (!row.name?.trim()) throw new Error('Each KPI needs a name');
      if (!row.weight || row.weight <= 0) {
        throw new Error('Each KPI weight must be greater than 0');
      }
      if (!row.perspective?.trim()) {
        throw new Error('Each KPI needs a perspective');
      }
    }
    const allocation = this.findRolePerspective(
      input.evaluationConfigId,
      input.positionId,
      input.positionTitle,
    );
    if (!allocation) {
      throw new Error('Assign perspectives to this role before adding KPIs');
    }
    const weightCheck = validateWeights(
      input.rows.map((r) => Number(r.weight || 0)),
      input.rows.map((r) => r.perspective as string),
    );
    if (!weightCheck.valid) {
      throw new Error(weightCheck.message);
    }
    const match = validateKpisMatchPerspectiveAllocation(
      input.rows.map((r) => Number(r.weight || 0)),
      input.rows.map((r) => r.perspective as string),
      allocation.weights,
    );
    if (!match.valid) throw new Error(match.message);

    const keepIds = new Set(
      input.rows.map((r) => r.id).filter((id): id is string => Boolean(id)),
    );
    for (const id of input.existingIds) {
      if (!keepIds.has(id)) {
        this.kpiLibrary = this.kpiLibrary.filter((k) => k.id !== id);
      }
    }

    const result: KpiLibraryItem[] = [];
    for (const row of input.rows) {
      const perspective = row.perspective?.trim();
      if (!perspective) {
        throw new Error('Each KPI needs a perspective');
      }
      if (row.id) {
        const idx = this.kpiLibrary.findIndex((k) => k.id === row.id);
        if (idx < 0) throw new Error(`KPI ${row.id} not found`);
        this.kpiLibrary[idx] = {
          ...this.kpiLibrary[idx],
          name: row.name.trim(),
          description: row.description?.trim() || null,
          weight: Number(row.weight),
          suggestedWeight: Number(row.weight),
          perspective,
          positionId: input.positionId,
          positionTitle: input.positionTitle,
          departmentName:
            input.departmentName ?? this.kpiLibrary[idx].departmentName,
          evaluationConfigId: input.evaluationConfigId,
        };
        result.push(this.kpiLibrary[idx]);
      } else {
        const item: KpiLibraryItem = {
          id: uid('kpi'),
          evaluationConfigId: input.evaluationConfigId,
          name: row.name.trim(),
          description: row.description?.trim() || null,
          perspective,
          targetLogic: row.targetLogic || TargetLogic.HigherBetter,
          measurementUnit: row.measurementUnit || '%',
          departmentName: input.departmentName || null,
          positionId: input.positionId,
          positionTitle: input.positionTitle,
          weight: Number(row.weight),
          suggestedWeight: Number(row.weight),
          createdAt: new Date().toISOString(),
        };
        this.kpiLibrary.unshift(item);
        result.push(item);
      }
    }
    return delay(result);
  }

  listRolePerspectives(filters?: {
    evaluationConfigId?: string;
    positionTitle?: string;
  }): Promise<RolePerspectiveAllocation[]> {
    let items = this.rolePerspectives.map((row) =>
      this.cloneRolePerspective(row),
    );
    if (filters?.evaluationConfigId) {
      items = items.filter(
        (row) => row.evaluationConfigId === filters.evaluationConfigId,
      );
    }
    if (filters?.positionTitle) {
      const q = filters.positionTitle.toLowerCase();
      items = items.filter((row) => row.positionTitle.toLowerCase() === q);
    }
    return delay(items);
  }

  getRolePerspectives(
    evaluationConfigId: string,
    positionId: string | null,
    positionTitle: string,
  ): Promise<RolePerspectiveAllocation | undefined> {
    const found = this.findRolePerspective(
      evaluationConfigId,
      positionId,
      positionTitle,
    );
    return delay(found ? this.cloneRolePerspective(found) : undefined);
  }

  async saveRolePerspectives(
    input: SaveRolePerspectiveInput,
  ): Promise<RolePerspectiveAllocation> {
    if (!input.evaluationConfigId) {
      throw new Error('evaluationConfigId is required');
    }
    if (!input.positionTitle?.trim()) {
      throw new Error('Role is required');
    }
    const check = validatePerspectiveWeights(input.weights);
    if (!check.valid) throw new Error(check.message);

    const existing = this.findRolePerspective(
      input.evaluationConfigId,
      input.positionId,
      input.positionTitle,
    );
    const saved: RolePerspectiveAllocation = {
      id: existing?.id || uid('rp'),
      evaluationConfigId: input.evaluationConfigId,
      positionId: input.positionId,
      positionTitle: input.positionTitle.trim(),
      departmentName: input.departmentName ?? existing?.departmentName ?? null,
      weights: { ...input.weights },
      updatedAt: new Date().toISOString(),
    };
    if (existing) {
      const idx = this.rolePerspectives.findIndex(
        (row) => row.id === existing.id,
      );
      this.rolePerspectives[idx] = saved;
    } else {
      this.rolePerspectives.unshift(saved);
    }
    return delay(this.cloneRolePerspective(saved));
  }

  listPerspectives(): Promise<BscPerspectiveDefinition[]> {
    return delay(this.perspectives.map((row) => ({ ...row })));
  }

  async createPerspective(
    input: CreatePerspectiveInput,
  ): Promise<BscPerspectiveDefinition> {
    const name = input.name?.trim();
    if (!name) throw new Error('Perspective name is required');
    if (name.toLowerCase() === 'financial') {
      throw new Error('Financial perspective is not used in this scorecard');
    }
    if (
      this.perspectives.some((p) => p.name.toLowerCase() === name.toLowerCase())
    ) {
      throw new Error('A perspective with this name already exists');
    }
    const item: BscPerspectiveDefinition = {
      id: uid('perspective'),
      name,
      description: input.description?.trim() || null,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };
    this.perspectives.push(item);
    return delay({ ...item });
  }

  async updatePerspective(
    id: string,
    input: Partial<CreatePerspectiveInput>,
  ): Promise<BscPerspectiveDefinition> {
    const idx = this.perspectives.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Perspective not found');
    const current = this.perspectives[idx];
    const nextName = input.name?.trim() || current.name;
    if (nextName.toLowerCase() === 'financial') {
      throw new Error('Financial perspective is not used in this scorecard');
    }
    if (
      this.perspectives.some(
        (p) => p.id !== id && p.name.toLowerCase() === nextName.toLowerCase(),
      )
    ) {
      throw new Error('A perspective with this name already exists');
    }
    if (nextName !== current.name) {
      this.renamePerspectiveUsage(current.name, nextName);
    }
    this.perspectives[idx] = {
      ...current,
      name: nextName,
      description:
        input.description !== undefined
          ? input.description?.trim() || null
          : current.description,
    };
    return delay({ ...this.perspectives[idx] });
  }

  async deletePerspective(id: string): Promise<void> {
    const item = this.perspectives.find((p) => p.id === id);
    if (!item) throw new Error('Perspective not found');
    if (item.isSystem) {
      throw new Error('Default perspectives cannot be deleted');
    }
    const inUse =
      this.kpiLibrary.some((k) => k.perspective === item.name) ||
      this.scorecards.some((s) =>
        s.targets.some((t) => t.perspective === item.name),
      );
    if (inUse) {
      throw new Error('This perspective is used by KPIs and cannot be deleted');
    }
    this.perspectives = this.perspectives.filter((p) => p.id !== id);
    this.rolePerspectives = this.rolePerspectives.map((row) => {
      const nextWeights = { ...row.weights };
      delete nextWeights[item.name];
      return { ...row, weights: nextWeights };
    });
    return delay(undefined);
  }

  listCycles(): Promise<EvaluationCycle[]> {
    return delay(
      [...this.cycles].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    );
  }

  getCycle(id: string): Promise<EvaluationCycle | undefined> {
    const found = this.cycles.find((c) => c.id === id);
    return delay(found ? { ...found } : undefined);
  }

  async createCycle(
    input: CreateEvaluationConfigInput,
  ): Promise<EvaluationCycle> {
    const hasPeriods = !!input.periodIds?.length;
    const hasDates = !!(input.startDate && input.endDate);
    if (!hasPeriods && !hasDates) {
      throw new Error('Select a fiscal period or set a custom date range');
    }
    if (!input.departmentIds?.length && !input.positionIds?.length) {
      throw new Error('Select at least one department or role');
    }
    const cycle: EvaluationCycle = {
      id: uid('config'),
      ...input,
      isRecurring: Boolean(input.isRecurring),
      useCustomDates: Boolean(input.useCustomDates),
      periodIds: input.periodIds || [],
      periodLabels: input.periodLabels || [],
      status: CycleStatus.Open,
    };
    // Recurring configs stamp cadence only; do not auto-spawn extra scorecards.
    this.cycles.unshift(cycle);
    return delay({ ...cycle });
  }

  async updateCycle(
    id: string,
    input: UpdateEvaluationConfigInput,
  ): Promise<EvaluationCycle> {
    const idx = this.cycles.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Evaluation config not found');
    this.cycles[idx] = { ...this.cycles[idx], ...input };
    return delay({ ...this.cycles[idx] });
  }

  async lockCycle(id: string): Promise<EvaluationCycle> {
    const cycle = this.cycles.find((c) => c.id === id);
    if (!cycle) throw new Error('Cycle not found');
    cycle.status = CycleStatus.Locked;
    return delay({ ...cycle });
  }

  deleteCycle(id: string): Promise<void> {
    this.cycles = this.cycles.filter((c) => c.id !== id);
    this.kpiLibrary = this.kpiLibrary.filter(
      (k) => k.evaluationConfigId !== id,
    );
    return delay(undefined);
  }

  listScorecards(filters?: {
    userId?: string;
    managerId?: string;
    cycleId?: string;
    status?: ScorecardStatus | ScorecardStatus[];
  }): Promise<EmployeeScorecard[]> {
    let items = this.scorecards.map((s) => this.cloneScorecard(s));
    if (filters?.userId) {
      items = items.filter((s) => s.userId === filters.userId);
    }
    if (filters?.managerId) {
      items = items.filter((s) => s.managerId === filters.managerId);
    }
    if (filters?.cycleId) {
      items = items.filter((s) => s.cycleId === filters.cycleId);
    }
    if (filters?.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      items = items.filter((s) => statuses.includes(s.status));
    }
    return delay(items);
  }

  getScorecard(id: string): Promise<EmployeeScorecard | undefined> {
    const found = this.scorecards.find((s) => s.id === id);
    return delay(found ? this.cloneScorecard(found) : undefined);
  }

  async createScorecard(
    input: AssignScorecardInput,
  ): Promise<EmployeeScorecard> {
    const cycle = this.cycles.find((c) => c.id === input.cycleId);
    if (!cycle) throw new Error('Cycle not found');
    if (cycle.status !== CycleStatus.Open) {
      throw new Error('Cycle is not open for new scorecards');
    }

    const libraryMap = new Map(this.kpiLibrary.map((k) => [k.id, k]));
    const targets: ScorecardKpiTarget[] = input.targets.map((t) => {
      const kpi = libraryMap.get(t.kpiLibraryId);
      if (!kpi) throw new Error(`KPI ${t.kpiLibraryId} not found in library`);
      return {
        id: uid('target'),
        scorecardId: '',
        kpiLibraryId: kpi.id,
        kpiName: kpi.name,
        perspective: kpi.perspective,
        targetLogic: kpi.targetLogic,
        measurementUnit: kpi.measurementUnit,
        weightPercentage: t.weightPercentage,
        targetValue: t.targetValue,
        worstCase: t.worstCase ?? kpi.worstCase,
        bestCase: t.bestCase ?? kpi.bestCase,
        approvalStatus: KpiApprovalStatus.Pending,
      };
    });

    const validation = validateWeights(
      targets.map((t) => t.weightPercentage),
      targets.map((t) => t.perspective),
    );
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const scorecardId = uid('sc');
    targets.forEach((t) => {
      t.scorecardId = scorecardId;
    });

    const scorecard: EmployeeScorecard = {
      id: scorecardId,
      userId: input.userId,
      userName: input.userName,
      managerId: input.managerId,
      departmentId: input.departmentId,
      positionId: input.positionId,
      cycleId: cycle.id,
      cycleLabel: cycle.label,
      status: ScorecardStatus.Draft,
      targets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.scorecards.unshift(scorecard);
    this.recordTransition(
      scorecard,
      null,
      ScorecardStatus.Draft,
      input.managerId,
    );
    return delay(this.cloneScorecard(scorecard));
  }

  async submitForAck(
    scorecardId: string,
    actorId?: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(sc.status, ScorecardStatus.PendingAck);
    const validation = validateWeights(
      sc.targets.map((t) => t.weightPercentage),
      sc.targets.map((t) => t.perspective),
    );
    if (!validation.valid) throw new Error(validation.message);
    const from = sc.status;
    sc.status = ScorecardStatus.PendingAck;
    sc.updatedAt = new Date().toISOString();
    this.recordTransition(
      sc,
      from,
      ScorecardStatus.PendingAck,
      actorId || sc.managerId,
    );
    return delay(this.cloneScorecard(sc));
  }

  async acknowledge(
    scorecardId: string,
    actorUserId?: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(sc.status, ScorecardStatus.Active);
    const actorId = actorUserId || sc.userId;
    const from = sc.status;
    sc.status = ScorecardStatus.Active;
    sc.acknowledgedAt = new Date().toISOString();
    sc.acknowledgedBy = actorId;
    sc.acknowledgmentSignature = `sig-${scorecardId}-${actorId}-${uid('ack')}`;
    sc.updatedAt = sc.acknowledgedAt;
    this.recordTransition(sc, from, ScorecardStatus.Active, actorId);
    return delay(this.cloneScorecard(sc));
  }

  async reportKpis(
    scorecardId: string,
    reports: ReportKpiInput[],
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    if (
      sc.status !== ScorecardStatus.Active &&
      sc.status !== ScorecardStatus.NeedsResubmit
    ) {
      throw new Error('Scorecard is not open for reporting');
    }

    for (const report of reports) {
      let target = sc.targets.find((t) => t.id === report.targetId);
      if (!target) {
        target = sc.targets.find((t) => t.kpiLibraryId === report.targetId);
      }
      if (!target) {
        const kpi = this.kpiLibrary.find((k) => k.id === report.targetId);
        if (!kpi) throw new Error(`Target ${report.targetId} not found`);
        target = {
          id: `${sc.id}-${kpi.id}`,
          scorecardId: sc.id,
          kpiLibraryId: kpi.id,
          kpiName: kpi.name,
          perspective: kpi.perspective,
          targetLogic: kpi.targetLogic,
          measurementUnit: kpi.measurementUnit,
          weightPercentage: kpi.weight,
          targetValue: kpi.defaultTarget ?? 0,
          actualValue: null,
          approvalStatus: KpiApprovalStatus.Pending,
        };
        sc.targets.push(target);
      }
      const mayEditActual =
        sc.status === ScorecardStatus.Active ||
        (sc.status === ScorecardStatus.NeedsResubmit &&
          target.approvalStatus === KpiApprovalStatus.Rejected);
      if (!mayEditActual) {
        throw new Error(`Actual value is locked for ${target.kpiName}`);
      }
      if (!hasEvidenceArtifact(report)) {
        throw new Error(`Evidence is required for ${target.kpiName}`);
      }
      target.actualValue = report.actualValue;
      target.evidenceUrl = report.evidenceUrl?.trim() || null;
      target.evidenceFileName = report.evidenceFileName?.trim() || null;
      target.evidenceHash = report.evidenceHash?.trim() || `hash-${uid('ev')}`;
      target.submittedAt = new Date().toISOString();
      target.approvalStatus = KpiApprovalStatus.Pending;
      target.rejectionReason = null;
    }

    return delay(this.cloneScorecard(sc));
  }

  async submitFinal(
    scorecardId: string,
    actorId?: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(
      sc.status === ScorecardStatus.NeedsResubmit
        ? ScorecardStatus.NeedsResubmit
        : ScorecardStatus.Active,
      ScorecardStatus.PendingEval,
    );

    const editable = sc.targets.filter(
      (t) =>
        sc.status === ScorecardStatus.Active ||
        t.approvalStatus === KpiApprovalStatus.Rejected,
    );
    for (const t of editable) {
      if (t.actualValue === null || t.actualValue === undefined) {
        throw new Error(`Missing actual value for ${t.kpiName}`);
      }
      if (!hasEvidenceArtifact(t)) {
        throw new Error(`Missing evidence for ${t.kpiName}`);
      }
    }

    const from = sc.status;
    sc.status = ScorecardStatus.PendingEval;
    sc.updatedAt = new Date().toISOString();
    this.recordTransition(
      sc,
      from,
      ScorecardStatus.PendingEval,
      actorId || sc.userId,
    );
    return delay(this.cloneScorecard(sc));
  }

  async adjustReportedKpis(
    scorecardId: string,
    adjustments: AdjustReportedKpiInput[],
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    if (sc.status !== ScorecardStatus.PendingEval) {
      throw new Error('Only reported KPIs pending evaluation can be edited');
    }
    if (!adjustments.length) {
      throw new Error('At least one KPI adjustment is required');
    }
    for (const row of adjustments) {
      const target = sc.targets.find((t) => t.id === row.targetId);
      if (!target) throw new Error(`Target ${row.targetId} not found`);
      if (!Number.isFinite(row.actualValue)) {
        throw new Error(`Invalid actual value for ${target.kpiName}`);
      }
      if (target.actualValue !== row.actualValue) {
        target.actualValue = row.actualValue;
        target.approvalStatus = KpiApprovalStatus.Pending;
        target.rejectionReason = null;
        target.submittedAt = new Date().toISOString();
      }
    }
    sc.updatedAt = new Date().toISOString();
    return delay(this.cloneScorecard(sc));
  }

  async setKpiApproval(
    scorecardId: string,
    targetId: string,
    approved: boolean,
    rejectionReason?: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    if (sc.status !== ScorecardStatus.PendingEval) {
      throw new Error('Scorecard is not pending evaluation');
    }
    const target = sc.targets.find((t) => t.id === targetId);
    if (!target) throw new Error('KPI target not found');
    target.approvalStatus = approved
      ? KpiApprovalStatus.Approved
      : KpiApprovalStatus.Rejected;
    target.rejectionReason = approved ? null : rejectionReason || 'Rejected';
    sc.updatedAt = new Date().toISOString();
    return delay(this.cloneScorecard(sc));
  }

  async finalizeApprovals(
    scorecardId: string,
    actorId?: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    if (sc.status !== ScorecardStatus.PendingEval) {
      throw new Error('Scorecard is not pending evaluation');
    }
    const actor = actorId || sc.managerId;
    const rejected = sc.targets.filter(
      (t) => t.approvalStatus === KpiApprovalStatus.Rejected,
    );
    if (rejected.length > 0) {
      assertTransition(sc.status, ScorecardStatus.NeedsResubmit);
      const from = sc.status;
      sc.status = ScorecardStatus.NeedsResubmit;
      sc.updatedAt = new Date().toISOString();
      this.recordTransition(sc, from, ScorecardStatus.NeedsResubmit, actor);
      return delay(this.cloneScorecard(sc));
    }
    const pending = sc.targets.filter(
      (t) => t.approvalStatus === KpiApprovalStatus.Pending,
    );
    if (pending.length > 0) {
      throw new Error('All KPIs must be approved or rejected first');
    }
    assertTransition(sc.status, ScorecardStatus.Scored);
    // SYSTEM_SCORING: synchronous auto-step; never persisted as a user-facing status.
    const { compositeScore } = computeCompositeScore(sc.targets);
    const from = sc.status;
    sc.status = ScorecardStatus.Scored;
    sc.finalEvaluation = {
      compositeScore,
      managerNote: '',
      evaluatedAt: new Date().toISOString(),
      evaluatorUserId: actor,
    };
    sc.updatedAt = new Date().toISOString();
    this.recordTransition(sc, from, ScorecardStatus.Scored, actor);
    return delay(this.cloneScorecard(sc));
  }

  async lockEvaluation(
    scorecardId: string,
    managerNote: string,
    evaluatorUserId: string,
  ): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(sc.status, ScorecardStatus.Completed);
    if (!sc.finalEvaluation) {
      throw new Error('Score not computed yet');
    }
    if (!managerNote?.trim()) {
      throw new Error('Evaluation note is required');
    }
    const from = sc.status;
    sc.finalEvaluation = {
      ...sc.finalEvaluation,
      managerNote: managerNote.trim(),
      evaluatorUserId,
      evaluatedAt: new Date().toISOString(),
    };
    sc.status = ScorecardStatus.Completed;
    sc.updatedAt = new Date().toISOString();
    this.hrisOutbox.push({
      scorecardId: sc.id,
      score: sc.finalEvaluation.compositeScore,
      at: sc.updatedAt,
    });
    this.recordTransition(sc, from, ScorecardStatus.Completed, evaluatorUserId);
    return delay(this.cloneScorecard(sc));
  }

  getHrisOutbox() {
    return delay([...this.hrisOutbox]);
  }

  listAudit(scorecardId?: string): Promise<ScorecardAuditEvent[]> {
    const items = scorecardId
      ? this.auditLog.filter((e) => e.scorecardId === scorecardId)
      : this.auditLog;
    return delay(items.map((e) => ({ ...e })));
  }

  private recordTransition(
    sc: EmployeeScorecard,
    from: ScorecardStatus | null,
    to: ScorecardStatus,
    actorId: string,
  ) {
    this.auditLog.push({
      id: uid('audit'),
      scorecardId: sc.id,
      from,
      to,
      actorId,
      at: sc.updatedAt,
    });
  }

  private requireScorecard(id: string): EmployeeScorecard {
    const sc = this.scorecards.find((s) => s.id === id);
    if (!sc) throw new Error('Scorecard not found');
    return sc;
  }

  private cloneScorecard(sc: EmployeeScorecard): EmployeeScorecard {
    return {
      ...sc,
      targets: sc.targets.map((t) => ({ ...t })),
      finalEvaluation: sc.finalEvaluation ? { ...sc.finalEvaluation } : null,
    };
  }

  private findRolePerspective(
    evaluationConfigId: string,
    positionId: string | null,
    positionTitle: string,
  ): RolePerspectiveAllocation | undefined {
    const title = positionTitle.trim().toLowerCase();
    return this.rolePerspectives.find((row) => {
      if (row.evaluationConfigId !== evaluationConfigId) return false;
      if (positionId && row.positionId) return row.positionId === positionId;
      return row.positionTitle.toLowerCase() === title;
    });
  }

  private cloneRolePerspective(
    row: RolePerspectiveAllocation,
  ): RolePerspectiveAllocation {
    return { ...row, weights: { ...row.weights } };
  }

  private renamePerspectiveUsage(from: string, to: string) {
    this.kpiLibrary = this.kpiLibrary.map((k) =>
      k.perspective === from
        ? { ...k, perspective: to as typeof k.perspective }
        : k,
    );
    this.scorecards = this.scorecards.map((s) => ({
      ...s,
      targets: s.targets.map((t) =>
        t.perspective === from
          ? { ...t, perspective: to as typeof t.perspective }
          : t,
      ),
    }));
    this.rolePerspectives = this.rolePerspectives.map((row) => {
      if (!(from in row.weights)) return row;
      const weights = { ...row.weights };
      weights[to] = weights[from];
      delete weights[from];
      return { ...row, weights };
    });
  }
}

export const bscMockRepo = new BscMockRepository();
