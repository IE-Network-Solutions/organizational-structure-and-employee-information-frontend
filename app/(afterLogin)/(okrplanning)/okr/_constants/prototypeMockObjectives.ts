import type {
  KeyResult,
  Objective,
} from '@/store/uistate/features/okrplanning/okr/interface';
import type { ObjectiveType } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';

const DEADLINE = '2026-12-31';

const metric = (name: string, id: string) => ({
  id,
  name,
  description: 0 as unknown as number,
});

function krBase(
  partial: Partial<KeyResult> &
    Pick<KeyResult, 'id' | 'title' | 'key_type' | 'metricTypeId'>,
): KeyResult {
  return {
    weight: 0,
    deadline: DEADLINE,
    progress: 0,
    initialValue: 0,
    targetValue: 0,
    milestones: [],
    threshold: null,
    stretch: null,
    dataSourceUrl: null,
    krKind: null,
    ...partial,
    metricType:
      partial.metricType ||
      metric(partial.key_type, String(partial.metricTypeId)),
  };
}

/**
 * Prototype My OKR demo data — Business + Strategic objectives with KR
 * combinations (metric types × committed/aspirational). Not an API mock.
 * Progress stays at 0 so Plan & Report Quarterly starts clean.
 */
export function buildPrototypeMockObjectives(params: {
  userId: string;
  types: ObjectiveType[];
}): Objective[] {
  const { userId, types } = params;

  const businessType =
    types.find(
      (t) =>
        !t.isStrategic &&
        String(t.name || '')
          .toLowerCase()
          .includes('business'),
    ) || types.find((t) => !t.isStrategic);

  const strategicType =
    types.find((t) => t.isStrategic) ||
    types.find((t) =>
      String(t.name || '')
        .toLowerCase()
        .includes('strategic'),
    );

  const businessTypeId = businessType?.id || 'proto-type-business';
  const strategicTypeId = strategicType?.id || 'proto-type-strategic';

  const businessObjective: Objective = {
    id: 'proto-obj-business-1',
    title: 'Grow core business revenue this year',
    deadline: DEADLINE,
    userId,
    isClosed: false,
    objectiveTypeId: businessTypeId,
    weight: 80,
    bscPillarId: 'financial',
    objectiveProgress: 0,
    completedKeyResults: 0,
    daysLeft: 90,
    keyResults: [
      krBase({
        id: 'proto-kr-biz-numeric',
        title: 'Increase paid customers',
        key_type: 'Numeric',
        metricTypeId: 'proto-metric-numeric',
        weight: 25,
        initialValue: 100,
        currentValue: 100,
        targetValue: 200,
        threshold: 120,
        stretch: 250,
        dataSourceUrl: 'https://analytics.example.com/customers',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-biz-percentage',
        title: 'Improve conversion rate',
        key_type: 'Percentage',
        metricTypeId: 'proto-metric-percentage',
        weight: 20,
        initialValue: 8,
        currentValue: 8,
        targetValue: 15,
        threshold: 10,
        stretch: 18,
        dataSourceUrl: 'https://analytics.example.com/funnel',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-biz-currency',
        title: 'Hit ARR target',
        key_type: 'Currency',
        metricTypeId: 'proto-metric-currency',
        weight: 25,
        initialValue: 500000,
        currentValue: 500000,
        targetValue: 1000000,
        threshold: 600000,
        stretch: 1200000,
        dataSourceUrl: 'https://finance.example.com/arr',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-biz-milestone',
        title: 'Launch pricing package',
        key_type: 'Milestone',
        metricTypeId: 'proto-metric-milestone',
        weight: 15,
        progress: 0,
        threshold: null,
        stretch: null,
        dataSourceUrl: 'https://wiki.example.com/pricing',
        milestones: [
          {
            id: 'proto-ms-1',
            title: 'Research competitors',
            weight: 30,
            status: 'Pending',
          },
          {
            id: 'proto-ms-2',
            title: 'Draft package tiers',
            weight: 40,
            status: 'Pending',
          },
          {
            id: 'proto-ms-3',
            title: 'Ship to production',
            weight: 30,
            status: 'Pending',
          },
        ],
      }),
      krBase({
        id: 'proto-kr-biz-achieve',
        title: 'Complete Q3 board review',
        key_type: 'Achieved',
        metricTypeId: 'proto-metric-achieve',
        weight: 15,
        progress: 0,
        dataSourceUrl: 'https://docs.example.com/board-q3',
      }),
    ],
  };

  const strategicObjective: Objective = {
    id: 'proto-obj-strategic-1',
    title: 'Advance multi-year strategic platform bets',
    deadline: DEADLINE,
    userId,
    isClosed: false,
    objectiveTypeId: strategicTypeId,
    weight: 20,
    bscPillarId: 'learning-growth',
    objectiveProgress: 0,
    completedKeyResults: 0,
    daysLeft: 90,
    keyResults: [
      krBase({
        id: 'proto-kr-str-numeric-committed',
        title: 'Ship platform API v2 endpoints',
        key_type: 'Numeric',
        metricTypeId: 'proto-metric-numeric',
        weight: 0,
        krKind: 'committed',
        initialValue: 0,
        currentValue: 0,
        targetValue: 12,
        threshold: 6,
        stretch: 16,
        dataSourceUrl: 'https://eng.example.com/api-v2',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-str-pct-aspirational',
        title: 'Reach automation coverage',
        key_type: 'Percentage',
        metricTypeId: 'proto-metric-percentage',
        weight: 0,
        krKind: 'aspirational',
        initialValue: 40,
        currentValue: 40,
        targetValue: 85,
        threshold: 60,
        stretch: 95,
        dataSourceUrl: 'https://eng.example.com/coverage',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-str-currency-committed',
        title: 'Secure strategic partnership pipeline',
        key_type: 'Currency',
        metricTypeId: 'proto-metric-currency',
        weight: 0,
        krKind: 'committed',
        initialValue: 0,
        currentValue: 0,
        targetValue: 500000,
        threshold: 200000,
        stretch: 750000,
        dataSourceUrl: 'https://bizdev.example.com/pipeline',
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-str-milestone-aspirational',
        title: 'Stand up regional hub',
        key_type: 'Milestone',
        metricTypeId: 'proto-metric-milestone',
        weight: 0,
        krKind: 'aspirational',
        progress: 0,
        dataSourceUrl: 'https://ops.example.com/hub',
        milestones: [
          { id: 'proto-ms-s1', title: 'Site selection', weight: 25 },
          { id: 'proto-ms-s2', title: 'Hire founding team', weight: 35 },
          { id: 'proto-ms-s3', title: 'Go-live operations', weight: 40 },
        ],
      }),
      krBase({
        id: 'proto-kr-str-achieve-committed',
        title: 'Board approves 3-year roadmap',
        key_type: 'Achieved',
        metricTypeId: 'proto-metric-achieve',
        weight: 0,
        krKind: 'committed',
        progress: 0,
        dataSourceUrl: 'https://docs.example.com/roadmap',
      }),
    ],
  };

  const businessMixed: Objective = {
    id: 'proto-obj-business-2',
    title: 'Improve customer experience quality',
    deadline: DEADLINE,
    userId,
    isClosed: false,
    objectiveTypeId: businessTypeId,
    weight: 80,
    bscPillarId: 'customer',
    objectiveProgress: 0,
    completedKeyResults: 0,
    daysLeft: 60,
    keyResults: [
      krBase({
        id: 'proto-kr-biz2-pct',
        title: 'NPS score',
        key_type: 'Percentage',
        metricTypeId: 'proto-metric-percentage',
        weight: 50,
        initialValue: 30,
        currentValue: 30,
        targetValue: 50,
        threshold: 35,
        stretch: 60,
        progress: 0,
      }),
      krBase({
        id: 'proto-kr-biz2-numeric',
        title: 'Reduce support ticket backlog',
        key_type: 'Numeric',
        metricTypeId: 'proto-metric-numeric',
        weight: 50,
        initialValue: 200,
        currentValue: 200,
        targetValue: 50,
        threshold: 150,
        stretch: 30,
        progress: 0,
      }),
    ],
  };

  return [businessObjective, strategicObjective, businessMixed];
}

/** Flat key results from prototype objectives (for Plan & Report Quarterly panel). */
export function flattenPrototypeMockKeyResults(params: {
  userId: string;
  types?: ObjectiveType[];
}): KeyResult[] {
  const objectives = buildPrototypeMockObjectives({
    userId: params.userId,
    types: params.types ?? [],
  });
  const out: KeyResult[] = [];
  for (const obj of objectives) {
    for (const kr of obj.keyResults ?? []) {
      if (!kr) continue;
      out.push({
        ...kr,
        objectiveId: obj.id,
      } as KeyResult);
    }
  }
  return out;
}

export const PROTOTYPE_MOCK_OBJECTIVE_IDS = [
  'proto-obj-business-1',
  'proto-obj-strategic-1',
  'proto-obj-business-2',
] as const;

/** Synthetic planning period for prototype Quarterly cadence (not from API). */
export const PROTOTYPE_QUARTERLY_PERIOD_ID = 'proto-planning-period-quarterly';

export const PROTOTYPE_QUARTERLY_PLAN_ID = 'proto-plan-quarterly-1';

export function isPrototypeQuarterlyPeriodId(id?: string | null): boolean {
  return String(id || '') === PROTOTYPE_QUARTERLY_PERIOD_ID;
}

function buildPlanTaskFromKr(params: {
  objective: Objective;
  kr: KeyResult;
  taskIndex: number;
  weight: number;
  milestone?: { id: string; title: string; weight?: number; status?: string };
}) {
  const { objective, kr, taskIndex, weight, milestone } = params;
  const taskLabel = milestone ? milestone.title : `Advance: ${kr.title}`;

  return {
    id: milestone
      ? `proto-task-${kr.id}-${milestone.id}`
      : `proto-task-${kr.id}-${taskIndex}`,
    task: taskLabel,
    taskName: taskLabel,
    priority:
      taskIndex % 3 === 0 ? 'High' : taskIndex % 3 === 1 ? 'Medium' : 'Low',
    weight,
    targetValue: 1,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    achieveMK: false,
    milestone: milestone
      ? {
          id: milestone.id,
          title: milestone.title,
          name: milestone.title,
          status: milestone.status || 'Pending',
          weight: milestone.weight,
        }
      : undefined,
    keyResult: {
      id: kr.id,
      title: kr.title,
      name: kr.title,
      progress: 0,
      initialValue: kr.initialValue ?? 0,
      currentValue: kr.initialValue ?? 0,
      targetValue: kr.targetValue ?? 0,
      threshold: kr.threshold ?? null,
      stretch: kr.stretch ?? null,
      dataSourceUrl: kr.dataSourceUrl ?? null,
      metricType: kr.metricType,
      metricTypeId: kr.metricTypeId,
      key_type: kr.key_type,
      krKind: kr.krKind ?? null,
      milestones: kr.milestones ?? [],
      deletedAt: null,
      objective: {
        id: objective.id,
        title: objective.title,
        deletedAt: null,
      },
    },
    keyResultId: kr.id,
  };
}

/**
 * Prototype Quarterly plan — one Open plan with tasks for every mock KR
 * so Plan & Report mirrors Daily/Weekly/Monthly (list + Report).
 */
export function buildPrototypeQuarterlyPlans(params: {
  userId: string;
  types?: ObjectiveType[];
}): any[] {
  const objectives = buildPrototypeMockObjectives({
    userId: params.userId,
    types: params.types ?? [],
  });

  const tasks: any[] = [];
  let taskIndex = 0;

  for (const objective of objectives) {
    for (const kr of objective.keyResults ?? []) {
      if (!kr) continue;
      const isMilestone =
        String(kr.key_type || '').toLowerCase() === 'milestone' ||
        String(kr.metricType?.name || '').toLowerCase() === 'milestone';
      const milestones = Array.isArray(kr.milestones) ? kr.milestones : [];

      if (isMilestone && milestones.length > 0) {
        milestones.forEach((ms: any) => {
          tasks.push(
            buildPlanTaskFromKr({
              objective,
              kr,
              taskIndex: taskIndex++,
              weight: 0,
              milestone: {
                id: String(ms.id),
                title: String(ms.title || ms.name || 'Milestone'),
                weight: ms.weight,
                status: ms.status || 'Pending',
              },
            }),
          );
        });
      } else {
        tasks.push(
          buildPlanTaskFromKr({
            objective,
            kr,
            taskIndex: taskIndex++,
            weight: 0,
          }),
        );
      }
    }
  }

  // Equal weights across the plan (sum = 100), matching Weekly/Monthly plans
  if (tasks.length > 0) {
    const each = Math.floor(100 / tasks.length);
    const remainder = 100 - each * tasks.length;
    tasks.forEach((t, i) => {
      t.weight = each + (i === tasks.length - 1 ? remainder : 0);
    });
  }

  const now = new Date().toISOString();

  return [
    {
      id: PROTOTYPE_QUARTERLY_PLAN_ID,
      userId: params.userId,
      isReported: false,
      isValidated: false,
      createdAt: now,
      updatedAt: now,
      comments: [],
      reprimandCount: 0,
      appreciationCount: 0,
      planningPeriodId: PROTOTYPE_QUARTERLY_PERIOD_ID,
      tasks,
    },
  ];
}
