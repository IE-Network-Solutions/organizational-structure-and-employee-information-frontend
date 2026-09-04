import {
  BscCadence,
  BscPerspective,
  BscPerspectiveDefinition,
  BscSetupKind,
  CycleStatus,
  EmployeeScorecard,
  EvaluationCycle,
  KpiApprovalStatus,
  KpiLibraryItem,
  RolePerspectiveAllocation,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';

const now = new Date().toISOString();

export const SEED_PERSPECTIVES: BscPerspectiveDefinition[] = [
  {
    id: 'perspective-customer',
    name: BscPerspective.Customer,
    description: 'Outcomes for the people you serve.',
    isSystem: true,
    createdAt: now,
  },
  {
    id: 'perspective-internal-process',
    name: BscPerspective.InternalProcess,
    description: 'How work gets done across the role.',
    isSystem: true,
    createdAt: now,
  },
  {
    id: 'perspective-learning-growth',
    name: BscPerspective.LearningGrowth,
    description: 'Capability, skills, and development.',
    isSystem: true,
    createdAt: now,
  },
];

/** Seeded positional KPI library from the non-financial BSC research matrices */
export const SEED_KPI_LIBRARY: KpiLibraryItem[] = [
  {
    id: 'kpi-hr-dir-enps',
    evaluationConfigId: 'config-seed-current',
    name: 'Enterprise Employee Net Promoter Score (eNPS)',
    description:
      'Measures enterprise employee net promoter score (enps) for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Currency',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 40,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-hr-dir-ttf',
    evaluationConfigId: 'config-seed-current',
    name: 'Enterprise Average Time-to-Fill Open Roles',
    description:
      'Measures enterprise average time-to-fill open roles for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: 'Days',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 30,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-hr-dir-succession',
    evaluationConfigId: 'config-seed-current',
    name: 'Leadership Succession Readiness Rate',
    description: 'Measures leadership succession readiness rate for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 80,
    weight: 30,
    createdAt: now,
  },
  {
    id: 'kpi-ta-hm-sat',
    evaluationConfigId: 'config-seed-current',
    name: 'Hiring Manager Satisfaction Score',
    description: 'Measures hiring manager satisfaction score for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Rating (1.0 - 5.0)',
    departmentName: 'Human Resources',
    positionTitle: 'Talent Acquisition Specialist',
    defaultTarget: 4.5,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-ta-yield',
    evaluationConfigId: 'config-seed-current',
    name: 'Candidate Yield Ratio (Interview to Offer)',
    description:
      'Measures candidate yield ratio (interview to offer) for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Human Resources',
    positionTitle: 'Talent Acquisition Specialist',
    defaultTarget: 40,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-ta-cert',
    evaluationConfigId: 'config-seed-current',
    name: 'Advanced Sourcing Certification Completion',
    description:
      'Measures advanced sourcing certification completion for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Boolean (1 or 0)',
    departmentName: 'Human Resources',
    positionTitle: 'Talent Acquisition Specialist',
    defaultTarget: 1,
    weight: 20,
    createdAt: now,
  },
  {
    id: 'kpi-sup-lead-csat',
    evaluationConfigId: 'config-seed-current',
    name: 'Aggregate Team Customer Satisfaction (CSAT)',
    description:
      'Measures aggregate team customer satisfaction (csat) for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Customer Support',
    positionTitle: 'Support Team Lead',
    defaultTarget: 90,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-sup-lead-fcr',
    evaluationConfigId: 'config-seed-current',
    name: 'Team First Contact Resolution (FCR) Rate',
    description:
      'Measures team first contact resolution (fcr) rate for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Customer Support',
    positionTitle: 'Support Team Lead',
    defaultTarget: 75,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-sup-lead-kb',
    evaluationConfigId: 'config-seed-current',
    name: 'Team Knowledge Base Contribution Volume',
    description:
      'Measures team knowledge base contribution volume for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Document Count',
    departmentName: 'Customer Support',
    positionTitle: 'Support Team Lead',
    defaultTarget: 10,
    weight: 25,
    createdAt: now,
  },
  {
    id: 'kpi-t1-csat',
    evaluationConfigId: 'config-seed-current',
    name: 'Individual Customer Satisfaction (CSAT)',
    description:
      'Measures individual customer satisfaction (csat) for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Customer Support',
    positionTitle: 'Tier 1 Support Agent',
    defaultTarget: 90,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-t1-asa',
    evaluationConfigId: 'config-seed-current',
    name: 'Average Speed of Answer (ASA)',
    description: 'Measures average speed of answer (asa) for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: 'Seconds',
    departmentName: 'Customer Support',
    positionTitle: 'Tier 1 Support Agent',
    defaultTarget: 30,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-t1-training',
    evaluationConfigId: 'config-seed-current',
    name: 'Technical Product Update Training Hours',
    description:
      'Measures technical product update training hours for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Hours',
    departmentName: 'Customer Support',
    positionTitle: 'Tier 1 Support Agent',
    defaultTarget: 10,
    weight: 20,
    createdAt: now,
  },
  {
    id: 'kpi-lead-slo',
    evaluationConfigId: 'config-seed-current',
    name: 'System Uptime / Service Level Objective (SLO)',
    description:
      'Measures system uptime / service level objective (slo) for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Information Technology',
    positionTitle: 'Lead Software Engineer',
    defaultTarget: 99.9,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-lead-cicd',
    evaluationConfigId: 'config-seed-current',
    name: 'CI/CD Deployment Frequency',
    description: 'Measures ci/cd deployment frequency for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Count per Month',
    departmentName: 'Information Technology',
    positionTitle: 'Lead Software Engineer',
    defaultTarget: 20,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-lead-mentor',
    evaluationConfigId: 'config-seed-current',
    name: 'Junior Engineer Mentorship Hours',
    description: 'Measures junior engineer mentorship hours for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Hours',
    departmentName: 'Information Technology',
    positionTitle: 'Lead Software Engineer',
    defaultTarget: 8,
    weight: 25,
    createdAt: now,
  },
  {
    id: 'kpi-qa-escape',
    evaluationConfigId: 'config-seed-current',
    name: 'Post-Release Defect Escape Rate',
    description: 'Measures post-release defect escape rate for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: 'Defect Count',
    departmentName: 'Information Technology',
    positionTitle: 'QA Automation Engineer',
    defaultTarget: 3,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-qa-coverage',
    evaluationConfigId: 'config-seed-current',
    name: 'Automated Test Suite Coverage',
    description: 'Measures automated test suite coverage for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Information Technology',
    positionTitle: 'QA Automation Engineer',
    defaultTarget: 80,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-qa-training',
    evaluationConfigId: 'config-seed-current',
    name: 'New Testing Framework Architecture Training',
    description:
      'Measures new testing framework architecture training for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Boolean (1 or 0)',
    departmentName: 'Information Technology',
    positionTitle: 'QA Automation Engineer',
    defaultTarget: 1,
    weight: 20,
    createdAt: now,
  },
  {
    id: 'kpi-ae-churn',
    evaluationConfigId: 'config-seed-current',
    name: 'Client Retention / Account Churn Rate',
    description:
      'Measures client retention / account churn rate for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: '%',
    departmentName: 'Sales Operations',
    positionTitle: 'Account Executive',
    defaultTarget: 5,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-ae-crm',
    evaluationConfigId: 'config-seed-current',
    name: 'CRM Data Accuracy and Pipeline Compliance',
    description:
      'Measures crm data accuracy and pipeline compliance for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Audit Score (0-100)',
    departmentName: 'Sales Operations',
    positionTitle: 'Account Executive',
    defaultTarget: 95,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-ae-nego',
    evaluationConfigId: 'config-seed-current',
    name: 'Advanced Negotiation Tactics Masterclass',
    description:
      'Measures advanced negotiation tactics masterclass for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Boolean (1 or 0)',
    departmentName: 'Sales Operations',
    positionTitle: 'Account Executive',
    defaultTarget: 1,
    weight: 20,
    createdAt: now,
  },
  {
    id: 'kpi-se-sat',
    evaluationConfigId: 'config-seed-current',
    name: 'Sales Team Satisfaction with Collateral',
    description:
      'Measures sales team satisfaction with collateral for this role.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Rating (1.0 - 5.0)',
    departmentName: 'Sales Operations',
    positionTitle: 'Sales Enablement Lead',
    defaultTarget: 4.5,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-se-ttp',
    evaluationConfigId: 'config-seed-current',
    name: 'Average Time-to-Productivity for New Reps',
    description:
      'Measures average time-to-productivity for new reps for this role.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: 'Days',
    departmentName: 'Sales Operations',
    positionTitle: 'Sales Enablement Lead',
    defaultTarget: 45,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-se-workshops',
    evaluationConfigId: 'config-seed-current',
    name: 'Competitor Analysis Workshops Delivered',
    description:
      'Measures competitor analysis workshops delivered for this role.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Event Count',
    departmentName: 'Sales Operations',
    positionTitle: 'Sales Enablement Lead',
    defaultTarget: 2,
    weight: 25,
    createdAt: now,
  },
  // Quarterly-scoped KPIs for HR Director (visible under "This Quarter" filter)
  {
    id: 'kpi-hr-dir-q-retention',
    evaluationConfigId: 'config-seed-quarterly',
    name: 'Quarterly Voluntary Attrition Rate',
    description:
      'Tracks voluntary attrition across the quarter for the HR Director scorecard.',
    perspective: BscPerspective.InternalProcess,
    targetLogic: TargetLogic.LowerBetter,
    measurementUnit: '%',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 5,
    weight: 40,
    createdAt: now,
  },
  {
    id: 'kpi-hr-dir-q-engagement',
    evaluationConfigId: 'config-seed-quarterly',
    name: 'Quarterly Engagement Pulse Score',
    description:
      'Aggregated engagement pulse for the quarter across the organization.',
    perspective: BscPerspective.Customer,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: 'Index (0–100)',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 75,
    weight: 35,
    createdAt: now,
  },
  {
    id: 'kpi-hr-dir-q-capability',
    evaluationConfigId: 'config-seed-quarterly',
    name: 'Critical Role Capability Coverage',
    description:
      'Share of critical roles with ready-now successors at quarter close.',
    perspective: BscPerspective.LearningGrowth,
    targetLogic: TargetLogic.HigherBetter,
    measurementUnit: '%',
    departmentName: 'Human Resources',
    positionTitle: 'HR Director',
    defaultTarget: 85,
    weight: 25,
    createdAt: now,
  },
];

function emptySeedWeights(): Record<BscPerspective, number> {
  return {
    [BscPerspective.Customer]: 0,
    [BscPerspective.InternalProcess]: 0,
    [BscPerspective.LearningGrowth]: 0,
  };
}

/** Role perspective allocations derived from seeded KPI weights */
export const SEED_ROLE_PERSPECTIVES: RolePerspectiveAllocation[] = (() => {
  const map = new Map<string, RolePerspectiveAllocation>();
  for (const kpi of SEED_KPI_LIBRARY) {
    const title = kpi.positionTitle;
    if (!title) continue;
    const key = `${kpi.evaluationConfigId}::${(
      kpi.positionId || title
    ).toLowerCase()}`;
    let row = map.get(key);
    if (!row) {
      row = {
        id: `rp-${key.replace(/[^a-z0-9]+/gi, '-')}`,
        evaluationConfigId: kpi.evaluationConfigId,
        positionId: kpi.positionId || null,
        positionTitle: title,
        departmentName: kpi.departmentName || null,
        weights: emptySeedWeights(),
        updatedAt: now,
      };
      map.set(key, row);
    }
    row.weights[kpi.perspective] += kpi.weight;
  }
  return Array.from(map.values()).filter((row) => {
    const sum = Object.values(row.weights).reduce((a, b) => a + b, 0);
    return Math.round(sum) === 100;
  });
})();

function seedEvaluationConfig(): EvaluationCycle {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const start = new Date(year, month - 1, 1);
  const label = start.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return {
    id: 'config-seed-current',
    label: 'Enterprise Non-Financial Scorecard',
    description:
      'Cascade customer, process, and learning outcomes across core roles.',
    status: CycleStatus.Open,
    cadence: BscCadence.Monthly,
    setupKind: BscSetupKind.Permanent,
    fiscalYearId: 'permanent',
    fiscalYearName: 'Permanent',
    periodIds: [`month-${year}-${String(month).padStart(2, '0')}`],
    periodLabels: [label],
    startDate: start.toISOString().slice(0, 10),
    endDate: '2099-12-31',
    isRecurring: true,
    useCustomDates: false,
    departmentIds: ['dept-hr', 'dept-cs', 'dept-it', 'dept-sales'],
    departmentNames: [
      'Human Resources',
      'Customer Support',
      'Information Technology',
      'Sales Operations',
    ],
    positionIds: [
      'pos-hr-dir',
      'pos-ta',
      'pos-stl',
      'pos-t1',
      'pos-lse',
      'pos-qa',
      'pos-ae',
      'pos-sel',
    ],
    positionTitles: [
      'HR Director',
      'Talent Acquisition Specialist',
      'Support Team Lead',
      'Tier 1 Support Agent',
      'Lead Software Engineer',
      'QA Automation Engineer',
      'Account Executive',
      'Sales Enablement Lead',
    ],
    employeeIds: [],
    employeeNames: [],
    year,
    month,
  };
}

export const SEED_CYCLES: EvaluationCycle[] = [
  seedEvaluationConfig(),
  (() => {
    const d = new Date();
    const year = d.getFullYear();
    const q = Math.floor(d.getMonth() / 3) + 1;
    const start = new Date(year, (q - 1) * 3, 1);
    const end = new Date(year, q * 3, 0);
    return {
      id: 'config-seed-quarterly',
      label: 'HR Q Scorecard',
      description:
        'Temporary quarterly HR cascade for director-level outcomes.',
      status: CycleStatus.Open,
      cadence: BscCadence.Quarterly,
      setupKind: BscSetupKind.Temporary,
      fiscalYearId: 'temporary',
      fiscalYearName: 'Temporary',
      periodIds: [`session-q${q}-${year}`],
      periodLabels: [`Q${q} ${year}`],
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isRecurring: true,
      useCustomDates: true,
      departmentIds: ['dept-hr'],
      departmentNames: ['Human Resources'],
      positionIds: ['pos-hr-dir'],
      positionTitles: ['HR Director'],
      employeeIds: [],
      employeeNames: [],
      year,
      month: d.getMonth() + 1,
    } as EvaluationCycle;
  })(),
  (() => {
    const d = new Date();
    const year = d.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 2, 31);
    return {
      id: 'config-seed-individuals',
      label: 'Leadership Pilot Scorecard',
      description: 'One-time individual assignments for selected leaders.',
      status: CycleStatus.Open,
      cadence: BscCadence.Custom,
      setupKind: BscSetupKind.Temporary,
      fiscalYearId: 'temporary',
      fiscalYearName: 'Temporary',
      periodIds: [],
      periodLabels: [
        `${start.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      ],
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      isRecurring: false,
      useCustomDates: true,
      departmentIds: [],
      departmentNames: [],
      positionIds: [],
      positionTitles: [],
      employeeIds: ['emp-1', 'emp-2'],
      employeeNames: ['Pat Lee', 'Sam Rivera'],
      year,
      month: 1,
    } as EvaluationCycle;
  })(),
];

function monthMeta(offsetMonths: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMonths);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const monthName = start.toLocaleString('en-US', { month: 'long' });
  const label = `${monthName} ${year}`;
  return { year, month, monthName, label, start, end };
}

function buildRoleTargets(
  scorecardId: string,
  positionTitle: string,
  actuals: Array<number | null>,
  status: ScorecardStatus,
): EmployeeScorecard['targets'] {
  const kpis = SEED_KPI_LIBRARY.filter(
    (k) =>
      k.positionTitle === positionTitle &&
      k.evaluationConfigId === 'config-seed-current',
  );
  const scored =
    status === ScorecardStatus.Scored || status === ScorecardStatus.Completed;
  return kpis.map((kpi, i) => ({
    id: `${scorecardId}-t${i + 1}`,
    scorecardId,
    kpiLibraryId: kpi.id,
    kpiName: kpi.name,
    perspective: kpi.perspective,
    targetLogic: kpi.targetLogic,
    measurementUnit: kpi.measurementUnit,
    weightPercentage: kpi.weight,
    targetValue: kpi.defaultTarget ?? 0,
    actualValue: actuals[i] ?? null,
    assignmentSource: 'shared' as const,
    evaluationFlow: [{ kind: 'self' as const }, { kind: 'directManager' as const }],
    evaluationStepIndex: scored ? 1 : 0,
    approvalStatus:
      actuals[i] == null
        ? KpiApprovalStatus.Pending
        : scored
          ? KpiApprovalStatus.Approved
          : KpiApprovalStatus.Pending,
    submittedAt: actuals[i] == null ? null : now,
    evidenceUrl:
      actuals[i] == null
        ? null
        : `https://mock.evidence/${scorecardId}/${kpi.id}`,
    evidenceFileName: actuals[i] == null ? null : `${kpi.id}.pdf`,
    evidenceHash: actuals[i] == null ? null : `hash-${scorecardId}-${i}`,
  }));
}

function seedScorecardForMonth(opts: {
  id: string;
  offsetMonths: number;
  status: ScorecardStatus;
  actuals: Array<number | null>;
  compositeScore?: number;
  managerNote?: string;
  userId?: string;
  userName?: string;
  positionTitle?: string;
  departmentName?: string;
  managerId?: string;
}): EmployeeScorecard {
  const meta = monthMeta(opts.offsetMonths);
  const cycleId =
    opts.offsetMonths === 0
      ? 'config-seed-current'
      : `config-seed-${meta.year}-${String(meta.month).padStart(2, '0')}`;
  const positionTitle = opts.positionTitle || 'HR Director';
  const status = opts.status;
  const ownerId = opts.userId || 'demo-user';
  const managerId =
    opts.managerId ||
    (ownerId === 'demo-user' ? 'demo-manager' : 'demo-user');
  const targets = buildRoleTargets(
    opts.id,
    positionTitle,
    opts.actuals,
    opts.status,
  );
  // Pending evaluation = self already submitted; waiting on manager (step 1).
  if (status === ScorecardStatus.PendingEval) {
    for (const t of targets) {
      t.evaluationStepIndex = 1;
      t.approvalStatus = KpiApprovalStatus.Pending;
    }
  }
  // Needs resubmit = manager sent back; owner acts again at self step.
  if (status === ScorecardStatus.NeedsResubmit) {
    for (const t of targets) {
      t.evaluationStepIndex = 0;
      t.approvalStatus = KpiApprovalStatus.Rejected;
      t.rejectionReason = t.rejectionReason || 'Please revise actuals for this period';
    }
  }
  return {
    id: opts.id,
    userId: ownerId,
    userName: opts.userName || 'Alex Morgan',
    managerId,
    departmentId: null,
    departmentName: opts.departmentName || 'Human Resources',
    positionId: null,
    positionTitle,
    cycleId,
    cycleLabel: `${meta.label} (Monthly)`,
    periodMonthName: meta.monthName,
    periodYear: meta.year,
    status: opts.status,
    targets,
    acknowledgedAt: now,
    acknowledgedBy: ownerId,
    acknowledgmentSignature: `sig-${opts.id}`,
    finalEvaluation:
      opts.compositeScore != null
        ? {
            compositeScore: opts.compositeScore,
            managerNote: opts.managerNote || 'Solid delivery against targets.',
            evaluatedAt: now,
            evaluatorUserId: managerId,
          }
        : null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Past locked cycles for mock history (current month stays on SEED_CYCLES[0]) */
export const SEED_PAST_CYCLES: EvaluationCycle[] = [-1, -2].map((offset) => {
  const meta = monthMeta(offset);
  return {
    id: `config-seed-${meta.year}-${String(meta.month).padStart(2, '0')}`,
    label: `Enterprise Non-Financial Scorecard · ${meta.label}`,
    description: 'Closed monthly cascade archive.',
    status: CycleStatus.Closed,
    cadence: BscCadence.Monthly,
    setupKind: BscSetupKind.Temporary,
    fiscalYearId: 'temporary',
    fiscalYearName: 'Temporary',
    periodIds: [`month-${meta.year}-${String(meta.month).padStart(2, '0')}`],
    periodLabels: [meta.label],
    startDate: meta.start.toISOString().slice(0, 10),
    endDate: meta.end.toISOString().slice(0, 10),
    isRecurring: false,
    useCustomDates: true,
    departmentIds: ['dept-hr'],
    departmentNames: ['Human Resources'],
    positionIds: ['pos-hr-dir'],
    positionTitles: ['HR Director'],
    employeeIds: [],
    employeeNames: [],
    year: meta.year,
    month: meta.month,
  };
});

export const SEED_SCORECARDS: EmployeeScorecard[] = [
  seedScorecardForMonth({
    id: 'sc-demo-current',
    offsetMonths: 0,
    status: ScorecardStatus.Active,
    actuals: [null, null, null],
  }),
  seedScorecardForMonth({
    id: 'sc-demo-prev-1',
    offsetMonths: -1,
    status: ScorecardStatus.Completed,
    actuals: [38, 32, 75],
    compositeScore: 86.4,
    managerNote: 'Strong eNPS; succession readiness slightly below target.',
  }),
  seedScorecardForMonth({
    id: 'sc-demo-prev-2',
    offsetMonths: -2,
    status: ScorecardStatus.Completed,
    actuals: [35, 34, 70],
    compositeScore: 79.2,
    managerNote: 'Time-to-fill improved; keep focus on leadership pipeline.',
  }),
  seedScorecardForMonth({
    id: 'sc-ta-current',
    offsetMonths: 0,
    status: ScorecardStatus.Active,
    actuals: [4.3, 38, null],
    userId: 'emp-ta-jordan',
    userName: 'Jordan Hale',
    positionTitle: 'Talent Acquisition Specialist',
    departmentName: 'Human Resources',
  }),
  seedScorecardForMonth({
    id: 'sc-sup-current',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [92, 71, 8],
    userId: 'emp-sup-sam',
    userName: 'Sam Rivera',
    positionTitle: 'Support Team Lead',
    departmentName: 'Customer Support',
  }),
  seedScorecardForMonth({
    id: 'sc-sup-prev-1',
    offsetMonths: -1,
    status: ScorecardStatus.Completed,
    actuals: [88, 68, 7],
    compositeScore: 84.1,
    userId: 'emp-sup-sam',
    userName: 'Sam Rivera',
    positionTitle: 'Support Team Lead',
    departmentName: 'Customer Support',
  }),
  seedScorecardForMonth({
    id: 'sc-sup-morgan',
    offsetMonths: 0,
    status: ScorecardStatus.Scored,
    actuals: [95, 78, 12],
    compositeScore: 93.5,
    userId: 'emp-sup-morgan',
    userName: 'Morgan Blake',
    positionTitle: 'Support Team Lead',
    departmentName: 'Customer Support',
  }),
  seedScorecardForMonth({
    id: 'sc-sup-avery',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [87, 74, 9],
    userId: 'emp-sup-avery',
    userName: 'Avery Quinn',
    positionTitle: 'Support Team Lead',
    departmentName: 'Enterprise Support',
  }),
  seedScorecardForMonth({
    id: 'sc-sup-avery-prev',
    offsetMonths: -1,
    status: ScorecardStatus.Completed,
    actuals: [84, 70, 6],
    compositeScore: 81.0,
    userId: 'emp-sup-avery',
    userName: 'Avery Quinn',
    positionTitle: 'Support Team Lead',
    departmentName: 'Enterprise Support',
  }),
  seedScorecardForMonth({
    id: 'sc-t1-jamie',
    offsetMonths: 0,
    status: ScorecardStatus.Active,
    actuals: [91, 28, 8],
    userId: 'emp-t1-jamie',
    userName: 'Jamie Ortiz',
    positionTitle: 'Tier 1 Support Agent',
    departmentName: 'Customer Support',
  }),
  seedScorecardForMonth({
    id: 'sc-t1-drew',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [86, 35, 11],
    userId: 'emp-t1-drew',
    userName: 'Drew Patel',
    positionTitle: 'Tier 1 Support Agent',
    departmentName: 'Field Services',
  }),
  seedScorecardForMonth({
    id: 'sc-eng-current',
    offsetMonths: 0,
    status: ScorecardStatus.Scored,
    actuals: [99.7, 18, 9],
    compositeScore: 91.2,
    userId: 'emp-eng-riley',
    userName: 'Riley Chen',
    positionTitle: 'Lead Software Engineer',
    departmentName: 'Information Technology',
  }),
  seedScorecardForMonth({
    id: 'sc-eng-taylor',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [99.2, 22, 7],
    userId: 'emp-eng-taylor',
    userName: 'Taylor Ng',
    positionTitle: 'Lead Software Engineer',
    departmentName: 'Platform Engineering',
  }),
  seedScorecardForMonth({
    id: 'sc-eng-taylor-prev',
    offsetMonths: -1,
    status: ScorecardStatus.Completed,
    actuals: [98.8, 25, 5],
    compositeScore: 88.4,
    userId: 'emp-eng-taylor',
    userName: 'Taylor Ng',
    positionTitle: 'Lead Software Engineer',
    departmentName: 'Platform Engineering',
  }),
  seedScorecardForMonth({
    id: 'sc-ae-current',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [4, 96, 1],
    userId: 'emp-ae-casey',
    userName: 'Casey Brooks',
    positionTitle: 'Account Executive',
    departmentName: 'Sales Operations',
  }),
  seedScorecardForMonth({
    id: 'sc-ae-skyler',
    offsetMonths: 0,
    status: ScorecardStatus.Scored,
    actuals: [5, 102, 1],
    compositeScore: 94.0,
    userId: 'emp-ae-skyler',
    userName: 'Skyler Amin',
    positionTitle: 'Account Executive',
    departmentName: 'Commercial Sales',
  }),
  /** Dedicated Check-in mocks for demo-user inbox */
  seedScorecardForMonth({
    id: 'sc-checkin-self',
    offsetMonths: 0,
    status: ScorecardStatus.Active,
    actuals: [null, null, null],
    userId: 'demo-user',
    userName: 'Alex Morgan',
    positionTitle: 'HR Director',
    departmentName: 'Human Resources',
    managerId: 'demo-manager',
  }),
  seedScorecardForMonth({
    id: 'sc-checkin-self-resubmit',
    offsetMonths: 0,
    status: ScorecardStatus.NeedsResubmit,
    actuals: [36, 28, 70],
    userId: 'demo-user',
    userName: 'Alex Morgan',
    positionTitle: 'HR Director',
    departmentName: 'Human Resources',
    managerId: 'demo-manager',
  }),
  seedScorecardForMonth({
    id: 'sc-checkin-review-sam',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [94, 76, 10],
    userId: 'emp-checkin-sam',
    userName: 'Sam Rivera',
    positionTitle: 'Support Team Lead',
    departmentName: 'Customer Support',
    managerId: 'demo-user',
  }),
  seedScorecardForMonth({
    id: 'sc-checkin-review-jordan',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [4.5, 36, 1],
    userId: 'emp-checkin-jordan',
    userName: 'Jordan Hale',
    positionTitle: 'Talent Acquisition Specialist',
    departmentName: 'Human Resources',
    managerId: 'demo-user',
  }),
  seedScorecardForMonth({
    id: 'sc-checkin-review-avery',
    offsetMonths: 0,
    status: ScorecardStatus.PendingEval,
    actuals: [89, 72, 9],
    userId: 'emp-checkin-avery',
    userName: 'Avery Quinn',
    positionTitle: 'Support Team Lead',
    departmentName: 'Enterprise Support',
    managerId: 'demo-user',
  }),
  seedScorecardForMonth({
    id: 'sc-ta-priya',
    offsetMonths: 0,
    status: ScorecardStatus.Active,
    actuals: [4.6, 35, 1],
    userId: 'emp-ta-priya',
    userName: 'Priya Nair',
    positionTitle: 'Talent Acquisition Specialist',
    departmentName: 'People Operations',
  }),
  seedScorecardForMonth({
    id: 'sc-ta-priya-prev',
    offsetMonths: -1,
    status: ScorecardStatus.Completed,
    actuals: [4.4, 40, 1],
    compositeScore: 82.5,
    userId: 'emp-ta-priya',
    userName: 'Priya Nair',
    positionTitle: 'Talent Acquisition Specialist',
    departmentName: 'People Operations',
  }),
].map((sc) => {
  // Demo: Alex Morgan has one person-only KPI on the current scorecard
  if (sc.id !== 'sc-demo-current') return sc;
  const sharedScaled = sc.targets.map((t) => {
    const scaled = Math.round(t.weightPercentage * 0.8 * 100) / 100;
    return {
      ...t,
      weightPercentage: scaled,
      assignmentSource: 'shared' as const,
    };
  });
  const sharedSum = sharedScaled.reduce((s, t) => s + t.weightPercentage, 0);
  if (sharedScaled.length) {
    sharedScaled[sharedScaled.length - 1] = {
      ...sharedScaled[sharedScaled.length - 1],
      weightPercentage:
        Math.round(
          (sharedScaled[sharedScaled.length - 1].weightPercentage +
            (80 - sharedSum)) *
            100,
        ) / 100,
    };
  }
  const taKpi = SEED_KPI_LIBRARY.find((k) => k.id === 'kpi-ta-hm-sat');
  return {
    ...sc,
    targets: [
      ...sharedScaled,
      {
        id: `${sc.id}-individual-1`,
        scorecardId: sc.id,
        kpiLibraryId: taKpi?.id || 'kpi-ta-hm-sat',
        kpiName: taKpi?.name || 'Hiring Manager Satisfaction Score',
        perspective: taKpi?.perspective || BscPerspective.Customer,
        targetLogic: taKpi?.targetLogic || TargetLogic.HigherBetter,
        measurementUnit: taKpi?.measurementUnit || 'Rating (1.0 - 5.0)',
        weightPercentage: 20,
        targetValue: taKpi?.defaultTarget ?? 4.5,
        actualValue: null,
        approvalStatus: KpiApprovalStatus.Pending,
        assignmentSource: 'individual' as const,
        evaluationFlow: [
          { kind: 'self' as const },
          { kind: 'directManager' as const },
        ],
        evaluationStepIndex: 0,
      },
    ],
  };
});
