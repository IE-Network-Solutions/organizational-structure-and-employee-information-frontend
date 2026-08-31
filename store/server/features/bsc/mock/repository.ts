import {
  AssignScorecardInput,
  BscPerspective,
  CreateEvaluationConfigInput,
  CreateKpiLibraryInput,
  CycleStatus,
  EmployeeScorecard,
  EvaluationCycle,
  KpiApprovalStatus,
  KpiLibraryItem,
  ReportKpiInput,
  ScorecardKpiTarget,
  ScorecardStatus,
  TargetLogic,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import { computeCompositeScore, validateWeights } from '@/utils/bsc/scoring';
import { assertTransition } from '@/utils/bsc/stateMachine';
import { SEED_CYCLES, SEED_KPI_LIBRARY, SEED_PAST_CYCLES, SEED_SCORECARDS } from './seed';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class BscMockRepository {
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
  private hrisOutbox: Array<{ scorecardId: string; score: number; at: string }> =
    [];

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

  createKpi(input: CreateKpiLibraryInput): Promise<KpiLibraryItem> {
    if (!input.evaluationConfigId) {
      throw new Error('evaluationConfigId is required');
    }
    if (!input.name?.trim()) {
      throw new Error('Name is required');
    }
    if (input.weight === undefined || input.weight === null) {
      throw new Error('Weight is required');
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

  updateKpi(
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
  syncRoleKpis(input: {
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
    const total = input.rows.reduce((s, r) => s + Number(r.weight || 0), 0);
    if (Math.round(total) !== 100) {
      throw new Error('KPI weights must sum to exactly 100%');
    }
    if (!input.rows.length) {
      throw new Error('Add at least one KPI');
    }
    for (const row of input.rows) {
      if (!row.name?.trim()) throw new Error('Each KPI needs a name');
      if (!row.weight || row.weight <= 0) {
        throw new Error('Each KPI weight must be greater than 0');
      }
    }

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
      if (row.id) {
        const idx = this.kpiLibrary.findIndex((k) => k.id === row.id);
        if (idx < 0) throw new Error(`KPI ${row.id} not found`);
        this.kpiLibrary[idx] = {
          ...this.kpiLibrary[idx],
          name: row.name.trim(),
          description: row.description?.trim() || null,
          weight: Number(row.weight),
          suggestedWeight: Number(row.weight),
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
          perspective: row.perspective || BscPerspective.InternalProcess,
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

  listCycles(): Promise<EvaluationCycle[]> {
    return delay(
      [...this.cycles].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    );
  }

  getCycle(id: string): Promise<EvaluationCycle | undefined> {
    const found = this.cycles.find((c) => c.id === id);
    return delay(found ? { ...found } : undefined);
  }

  createCycle(input: CreateEvaluationConfigInput): Promise<EvaluationCycle> {
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
    this.cycles.unshift(cycle);
    return delay({ ...cycle });
  }

  updateCycle(
    id: string,
    input: UpdateEvaluationConfigInput,
  ): Promise<EvaluationCycle> {
    const idx = this.cycles.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Evaluation config not found');
    this.cycles[idx] = { ...this.cycles[idx], ...input };
    return delay({ ...this.cycles[idx] });
  }

  lockCycle(id: string): Promise<EvaluationCycle> {
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

  createScorecard(input: AssignScorecardInput): Promise<EmployeeScorecard> {
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
    return delay(this.cloneScorecard(scorecard));
  }

  submitForAck(scorecardId: string): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(sc.status, ScorecardStatus.PendingAck);
    const validation = validateWeights(
      sc.targets.map((t) => t.weightPercentage),
      sc.targets.map((t) => t.perspective),
    );
    if (!validation.valid) throw new Error(validation.message);
    sc.status = ScorecardStatus.PendingAck;
    sc.updatedAt = new Date().toISOString();
    return delay(this.cloneScorecard(sc));
  }

  acknowledge(scorecardId: string): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    assertTransition(sc.status, ScorecardStatus.Active);
    sc.status = ScorecardStatus.Active;
    sc.acknowledgedAt = new Date().toISOString();
    sc.updatedAt = sc.acknowledgedAt;
    return delay(this.cloneScorecard(sc));
  }

  reportKpis(
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
      const target = sc.targets.find((t) => t.id === report.targetId);
      if (!target) throw new Error(`Target ${report.targetId} not found`);
      if (
        sc.status === ScorecardStatus.NeedsResubmit &&
        target.approvalStatus === KpiApprovalStatus.Approved
      ) {
        continue;
      }
      if (!report.evidenceUrl?.trim()) {
        throw new Error(`Evidence is required for ${target.kpiName}`);
      }
      target.actualValue = report.actualValue;
      target.evidenceUrl = report.evidenceUrl;
      target.evidenceFileName = report.evidenceFileName || null;
      target.evidenceHash = `hash-${uid('ev')}`;
      target.submittedAt = new Date().toISOString();
      target.approvalStatus = KpiApprovalStatus.Pending;
      target.rejectionReason = null;
    }

    return delay(this.cloneScorecard(sc));
  }

  submitFinal(scorecardId: string): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    const next =
      sc.status === ScorecardStatus.NeedsResubmit
        ? ScorecardStatus.PendingEval
        : ScorecardStatus.PendingEval;
    assertTransition(
      sc.status === ScorecardStatus.NeedsResubmit
        ? ScorecardStatus.NeedsResubmit
        : ScorecardStatus.Active,
      next,
    );

    const editable = sc.targets.filter(
      (t) =>
        sc.status === ScorecardStatus.Active ||
        t.approvalStatus !== KpiApprovalStatus.Approved,
    );
    for (const t of editable) {
      if (t.actualValue === null || t.actualValue === undefined) {
        throw new Error(`Missing actual value for ${t.kpiName}`);
      }
      if (!t.evidenceUrl) {
        throw new Error(`Missing evidence for ${t.kpiName}`);
      }
    }

    sc.status = ScorecardStatus.PendingEval;
    sc.updatedAt = new Date().toISOString();
    return delay(this.cloneScorecard(sc));
  }

  setKpiApproval(
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

  finalizeApprovals(scorecardId: string): Promise<EmployeeScorecard> {
    const sc = this.requireScorecard(scorecardId);
    if (sc.status !== ScorecardStatus.PendingEval) {
      throw new Error('Scorecard is not pending evaluation');
    }
    const rejected = sc.targets.filter(
      (t) => t.approvalStatus === KpiApprovalStatus.Rejected,
    );
    if (rejected.length > 0) {
      assertTransition(sc.status, ScorecardStatus.NeedsResubmit);
      sc.status = ScorecardStatus.NeedsResubmit;
      sc.updatedAt = new Date().toISOString();
      return delay(this.cloneScorecard(sc));
    }
    const pending = sc.targets.filter(
      (t) => t.approvalStatus === KpiApprovalStatus.Pending,
    );
    if (pending.length > 0) {
      throw new Error('All KPIs must be approved or rejected first');
    }
    assertTransition(sc.status, ScorecardStatus.Scored);
    const { compositeScore } = computeCompositeScore(sc.targets);
    sc.status = ScorecardStatus.Scored;
    sc.finalEvaluation = {
      compositeScore,
      managerNote: '',
      evaluatedAt: new Date().toISOString(),
      evaluatorUserId: sc.managerId,
    };
    sc.updatedAt = new Date().toISOString();
    return delay(this.cloneScorecard(sc));
  }

  lockEvaluation(
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
    return delay(this.cloneScorecard(sc));
  }

  getHrisOutbox() {
    return delay([...this.hrisOutbox]);
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
      finalEvaluation: sc.finalEvaluation
        ? { ...sc.finalEvaluation }
        : null,
    };
  }
}

export const bscMockRepo = new BscMockRepository();
