import { useQuery } from 'react-query';
import { InstanceFilters, SwapFilters } from '@/types/timesheet/workSchedule';
import {
  getBlueprint,
  getMockEmployee,
  listAssignments,
  listBaselineBands,
  listBlueprints,
  listEligibleSwapTargets,
  listInstances,
  listMockEmployees,
  listSwaps,
} from './mockService';

export const workScheduleQueryKeys = {
  employees: ['workScheduleMockEmployees'] as const,
  employee: (id: string) => ['workScheduleMockEmployee', id] as const,
  blueprints: ['workScheduleBlueprints'] as const,
  blueprint: (id: string) => ['workScheduleBlueprint', id] as const,
  assignments: (blueprintId?: string) =>
    ['workScheduleAssignments', blueprintId ?? 'all'] as const,
  instances: (filters: InstanceFilters) =>
    ['workScheduleInstances', filters] as const,
  baselineBands: (filters: InstanceFilters) =>
    ['workScheduleBaselineBands', filters] as const,
  swaps: (filters: SwapFilters) => ['workScheduleSwaps', filters] as const,
  eligibleTargets: (requesterShiftId: string) =>
    ['workScheduleEligibleTargets', requesterShiftId] as const,
};

export const useGetMockEmployees = () =>
  useQuery(workScheduleQueryKeys.employees, () => listMockEmployees());

export const useGetMockEmployee = (id: string) =>
  useQuery(workScheduleQueryKeys.employee(id), () => getMockEmployee(id), {
    enabled: Boolean(id),
  });

export const useGetBlueprints = () =>
  useQuery(workScheduleQueryKeys.blueprints, () => listBlueprints());

export const useGetBlueprint = (id: string | null) =>
  useQuery(workScheduleQueryKeys.blueprint(id ?? ''), () => getBlueprint(id!), {
    enabled: Boolean(id),
  });

export const useGetAssignments = (blueprintId?: string) =>
  useQuery(workScheduleQueryKeys.assignments(blueprintId), () =>
    listAssignments(blueprintId),
  );

export const useGetShiftInstances = (filters: InstanceFilters = {}) =>
  useQuery(workScheduleQueryKeys.instances(filters), () =>
    listInstances(filters),
  );

export const useGetBaselineBands = (filters: InstanceFilters = {}) =>
  useQuery(workScheduleQueryKeys.baselineBands(filters), () =>
    listBaselineBands(filters),
  );

export const useGetSwapRequests = (filters: SwapFilters = {}) =>
  useQuery(workScheduleQueryKeys.swaps(filters), () => listSwaps(filters));

export const useGetEligibleSwapTargets = (requesterShiftId: string | null) =>
  useQuery(
    workScheduleQueryKeys.eligibleTargets(requesterShiftId ?? ''),
    () => listEligibleSwapTargets(requesterShiftId!),
    { enabled: Boolean(requesterShiftId) },
  );
