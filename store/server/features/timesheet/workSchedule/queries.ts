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

const isBrowser = typeof window !== 'undefined';

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
  useQuery(workScheduleQueryKeys.employees, async () => listMockEmployees(), {
    enabled: isBrowser,
  });

export const useGetMockEmployee = (id: string) =>
  useQuery(
    workScheduleQueryKeys.employee(id),
    async () => getMockEmployee(id),
    {
      enabled: isBrowser && Boolean(id),
    },
  );

export const useGetBlueprints = () =>
  useQuery(workScheduleQueryKeys.blueprints, async () => listBlueprints(), {
    enabled: isBrowser,
  });

export const useGetBlueprint = (id: string | null) =>
  useQuery(
    workScheduleQueryKeys.blueprint(id ?? ''),
    async () => getBlueprint(id!),
    {
      enabled: isBrowser && Boolean(id),
    },
  );

export const useGetAssignments = (blueprintId?: string) =>
  useQuery(
    workScheduleQueryKeys.assignments(blueprintId),
    async () => listAssignments(blueprintId),
    { enabled: isBrowser },
  );

export const useGetUserShiftAssignments = (userId: string | null) =>
  useQuery(
    workScheduleQueryKeys.userAssignments(userId ?? ''),
    async () => listAssignmentsForUser(userId!),
    { enabled: isBrowser && Boolean(userId) },
  );

export const useGetShiftInstances = (filters: InstanceFilters = {}) =>
  useQuery(
    workScheduleQueryKeys.instances(filters),
    async () => listInstances(filters),
    { enabled: isBrowser },
  );

export const useGetBaselineBands = (filters: InstanceFilters = {}) =>
  useQuery(
    workScheduleQueryKeys.baselineBands(filters),
    async () => listBaselineBands(filters),
    { enabled: isBrowser },
  );

export const useGetSwapRequests = (filters: SwapFilters = {}) =>
  useQuery(
    workScheduleQueryKeys.swaps(filters),
    async () => listSwaps(filters),
    { enabled: isBrowser },
  );

export const useGetEligibleSwapTargets = (requesterShiftId: string | null) =>
  useQuery(
    workScheduleQueryKeys.eligibleTargets(requesterShiftId ?? ''),
    async () => listEligibleSwapTargets(requesterShiftId!),
    { enabled: isBrowser && Boolean(requesterShiftId) },
  );
