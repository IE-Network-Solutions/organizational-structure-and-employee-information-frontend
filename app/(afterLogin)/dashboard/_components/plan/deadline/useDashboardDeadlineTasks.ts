'use client';

import { useEffect, useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import type { DeadlineTask } from './types';

export function useDashboardDeadlineTasks(): {
  tasks: DeadlineTask[];
  isLoading: boolean;
} {
  const { userId } = useAuthenticationStore();
  const ensurePlan = useUserPlanRepositoryMock((s) => s.ensurePlan);
  const mockTasks = useUserPlanRepositoryMock((s) => {
    if (!userId) return [];
    const plan = s.plansByUserId[userId];
    return (plan?.activeTasks ?? []).filter((t) => !t.isReported);
  });

  useEffect(() => {
    if (!userId) return;
    ensurePlan(userId, 'My');
  }, [userId, ensurePlan]);

  const tasks = useMemo(() => {
    if (!userId) return [];
    return mockTasks.map((t) => ({
      ...t,
      sourceStatus: t.done ? 'pre_achieved' : 'pre_pending',
    }));
  }, [mockTasks, userId]);

  return {
    tasks,
    isLoading: false,
  };
}
