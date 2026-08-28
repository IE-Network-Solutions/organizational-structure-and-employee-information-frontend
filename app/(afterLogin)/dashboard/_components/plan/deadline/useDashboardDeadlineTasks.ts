'use client';

import { useMemo } from 'react';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import {
  cadenceAssignmentByKind,
  collectDeadlineTasksFromPlans,
} from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/planning/durationFilter';
import { todayIso } from './bucket';
import type { DeadlineTask } from './types';

const DASHBOARD_PLAN_PAGE_SIZE = 100;

export function useDashboardDeadlineTasks(): {
  tasks: DeadlineTask[];
  isLoading: boolean;
} {
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();
  const overlay = usePlanTaskDatesStore((state) => state.datesByTaskId);

  const assignments = useMemo(
    () =>
      cadenceAssignmentByKind(
        planningPeriods?.items,
        Array.isArray(userPlanningPeriods) ? userPlanningPeriods : [],
      ),
    [planningPeriods?.items, userPlanningPeriods],
  );

  const userIds = userId ? [userId] : [];
  const listParams = {
    userId: userIds,
    page: 1,
    pageSize: DASHBOARD_PLAN_PAGE_SIZE,
    sessionId: [] as string[],
  };

  const dailyId = assignments.daily.periodId;
  const weeklyId = assignments.week.periodId;
  const monthlyId = assignments.month.periodId;

  const { data: dailyPlanning, isLoading: loadingDaily } = useGetPlanning(
    { ...listParams, planPeriodId: dailyId || '' },
    { enabled: !!userId && !!dailyId },
  );
  const { data: weeklyPlanning, isLoading: loadingWeekly } = useGetPlanning(
    { ...listParams, planPeriodId: weeklyId || '' },
    { enabled: !!userId && !!weeklyId },
  );
  const { data: monthlyPlanning, isLoading: loadingMonthly } = useGetPlanning(
    { ...listParams, planPeriodId: monthlyId || '' },
    { enabled: !!userId && !!monthlyId },
  );

  const tasks = useMemo(() => {
    const stamp = (items: any[] | undefined, periodName: string) =>
      (items ?? []).map((item) => ({ ...item, _periodName: periodName }));
    const combined = [
      ...stamp(dailyPlanning?.items, 'Daily'),
      ...stamp(weeklyPlanning?.items, 'Weekly'),
      ...stamp(monthlyPlanning?.items, 'Monthly'),
    ];
    const byId = new Map<string, any>();
    combined.forEach((item) => {
      const id = String(item?.id ?? '');
      if (!id || byId.has(id) || item?.isReported === true) return;
      byId.set(id, item);
    });
    return collectDeadlineTasksFromPlans(
      Array.from(byId.values()),
      overlay,
      todayIso(),
    );
  }, [
    dailyPlanning?.items,
    weeklyPlanning?.items,
    monthlyPlanning?.items,
    overlay,
  ]);

  return {
    tasks,
    isLoading: loadingDaily || loadingWeekly || loadingMonthly,
  };
}
