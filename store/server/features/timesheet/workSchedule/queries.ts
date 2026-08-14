import { useQuery } from 'react-query';
import { InstanceFilters, SwapFilters } from '@/types/timesheet/workSchedule';
import {
  getBlueprint,
  getMockEmployee,
  listAssignments,
  listAssignmentsForUser,
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
  userAssignments: (userId: string) =>
    ['workScheduleUserAssignments', userId] as const,
  instances: (filters: InstanceFilters) =>
    ['workScheduleInstances', filters] as const,
  baselineBands: (filters: InstanceFilters) =>
    ['workScheduleBaselineBands', filters] as const,
  swaps: (filters: SwapFilters) => ['workScheduleSwaps', filters] as const,
  eligibleTargets: (requesterShiftId: string) =>
    ['workScheduleEligibleTargets', requesterShiftId] as const,
};

export const useGetMockEmployees = () =>
  useQuery(workScheduleQueryKeys.employees, async () => listMockEmployees());

export const useGetMockEmployee = (id: string) =>
  useQuery(
    workScheduleQueryKeys.employee(id),
    async () => getMockEmployee(id),
    {
      enabled: Boolean(id),
    },
  );

export const useGetBlueprints = () =>
  useQuery(workScheduleQueryKeys.blueprints, async () => listBlueprints());

export const useGetBlueprint = (id: string | null) =>
  useQuery(
    workScheduleQueryKeys.blueprint(id ?? ''),
    async () => getBlueprint(id!),
    {
      enabled: Boolean(id),
    },
  );

export const useGetAssignments = (blueprintId?: string) =>
  useQuery(workScheduleQueryKeys.assignments(blueprintId), async () =>
    listAssignments(blueprintId),
  );

export const useGetUserShiftAssignments = (userId: string | null) =>
  useQuery(
    workScheduleQueryKeys.userAssignments(userId ?? ''),
    async () => listAssignmentsForUser(userId!),
    { enabled: Boolean(userId) },
  );

export const useGetShiftInstances = (filters: InstanceFilters = {}) =>
  useQuery(workScheduleQueryKeys.instances(filters), async () =>
    listInstances(filters),
  );

export const useGetBaselineBands = (filters: InstanceFilters = {}) =>
  useQuery(workScheduleQueryKeys.baselineBands(filters), async () =>
    listBaselineBands(filters),
  );

export const useGetSwapRequests = (filters: SwapFilters = {}) =>
  useQuery(workScheduleQueryKeys.swaps(filters), async () =>
    listSwaps(filters),
  );

export const useGetEligibleSwapTargets = (requesterShiftId: string | null) =>
  useQuery(
    workScheduleQueryKeys.eligibleTargets(requesterShiftId ?? ''),
    async () => listEligibleSwapTargets(requesterShiftId!),
    { enabled: Boolean(requesterShiftId) },
  );
