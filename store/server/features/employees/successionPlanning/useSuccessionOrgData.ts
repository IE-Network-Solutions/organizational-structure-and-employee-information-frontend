'use client';
import { useMemo } from 'react';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import type { MockOrgPosition } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepRoleSelection';
import type { SuccessorCandidate } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEmployeeSelection';

/**
 * Real org data for the succession-planning pickers — positions, departments
 * and employees — replacing the prototype's `MOCK_POSITIONS`,
 * `MOCK_DEPARTMENTS` and `MOCK_EMPLOYEES`.
 *
 * `JobPosition` carries no department of its own, so a position's department
 * and current holder are derived from whoever currently occupies it (their
 * active `employeeJobInformation`). That reproduces what the mock catalog
 * hard-coded, from live data.
 */

/** Response lists come back either bare or wrapped in `{ items }`. */
const asArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const activeJobOf = (user: any) =>
  user?.employeeJobInformation?.find((job: any) => job?.isPositionActive) ??
  user?.employeeJobInformation?.[0];

const fullName = (user: any): string =>
  `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`
    .replace(/\s+/g, ' ')
    .trim() || 'Employee';

export const useSuccessionOrgData = () => {
  const positionsQuery = useGetAllPositions();
  // `/users` — the same endpoint every other employee picker in the app uses,
  // and the one proven to return Core-resolved names plus HR job info.
  const usersQuery = useGetAllUsers();

  const users = useMemo(() => asArray(usersQuery.data), [usersQuery.data]);

  /** positionId → department + current holder, derived from live job info. */
  const positionContext = useMemo(() => {
    const context = new Map<
      string,
      { department?: string; departmentId?: string; currentEmployee?: string }
    >();
    for (const user of users) {
      const job = activeJobOf(user);
      if (!job?.positionId) continue;
      if (context.has(job.positionId)) continue;
      context.set(job.positionId, {
        department: job?.department?.name,
        departmentId: job?.department?.id ?? job?.departmentId,
        currentEmployee: fullName(user),
      });
    }
    return context;
  }, [users]);

  const positions: MockOrgPosition[] = useMemo(
    () =>
      asArray(positionsQuery.data).map((position: any) => {
        const context = positionContext.get(position.id);
        return {
          id: position.id,
          title: position.name,
          department: context?.department ?? '—',
          departmentId: context?.departmentId,
          currentEmployee: context?.currentEmployee ?? null,
          reportingTo: null,
        };
      }),
    [positionsQuery.data, positionContext],
  );

  const employees: SuccessorCandidate[] = useMemo(
    () =>
      users.map((user: any) => {
        const job = activeJobOf(user);
        return {
          id: user.id,
          userId: user.id,
          name: fullName(user),
          jobTitle: job?.position?.name ?? '—',
          department: job?.department?.name ?? '—',
          departmentId: job?.department?.id ?? job?.departmentId ?? undefined,
          currentPositionId: job?.positionId ?? undefined,
          currentPosition: job?.position?.name ?? undefined,
          // Education and relevant experience are deliberately absent here.
          // `EmployeeInformation` has no educationalLevel / fieldOfStudy /
          // yearsOfExperience columns, so there is nothing to read. That data is
          // owned per-nomination and captured on the successor's Edit
          // assessment screen, which persists it via PATCH /successors/:id.
        };
      }),
    [users],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          positions
            .map((position) => position.department)
            .filter((name): name is string => Boolean(name) && name !== '—'),
        ),
      ).sort(),
    [positions],
  );

  const positionById = useMemo(
    () => new Map(positions.map((position) => [position.id, position])),
    [positions],
  );

  return {
    positions,
    departments,
    employees,
    isLoading: positionsQuery.isLoading || usersQuery.isLoading,

    resolvePositionTitle: (positionId?: string | null) =>
      positionId ? positionById.get(positionId)?.title : undefined,

    resolvePositionTitles: (positionIds?: string[] | null) =>
      (positionIds ?? [])
        .map((id) => positionById.get(id)?.title)
        .filter((title): title is string => Boolean(title)),

    findPositionByTitle: (title?: string | null) =>
      title
        ? positions.find(
            (position) =>
              position.title.trim().toLowerCase() ===
              title.trim().toLowerCase(),
          )
        : undefined,

    findEmployeeById: (id?: string | null) =>
      id ? employees.find((employee) => employee.id === id) : undefined,
  };
};
