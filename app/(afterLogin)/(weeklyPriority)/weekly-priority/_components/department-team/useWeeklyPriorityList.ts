import {
  useGetDepartmentChild,
  useGetWeeklyPriorities,
} from '@/store/server/features/okrplanning/weeklyPriority/queries';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';

export function useWeeklyPriorityList() {
  const {
    departmentId,
    weekIds,
    activeTab,
    pageSize,
    currentPage,
  } = useWeeklyPriorityStore();
  const { data: departmentChild } = useGetDepartmentChild(departmentId || '');
  const departmentIds = Array.isArray(departmentChild)
    ? departmentChild.map((item) => item.id)
    : [];
  const departIds =
    !departmentIds?.length || activeTab === 2
      ? departmentId
        ? [departmentId]
        : []
      : departmentIds;

  return useGetWeeklyPriorities(
    departIds || [],
    weekIds || [],
    pageSize,
    currentPage,
  );
}
