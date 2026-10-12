import { useCallback, useMemo } from 'react';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  getDepartmentUserIds,
  getEmployeeDepartment,
  getEmployeeItems,
  getEmployeeName,
  getSubordinateIds,
  TaskViewer,
} from './utils';

export interface PersonOption {
  id: string;
  name: string;
  departmentName?: string;
}

/**
 * Employees, departments and what the signed-in user may see and manage.
 * Without the "view all employee plan" permission the scope is the user and
 * their direct reports.
 */
export function useDeadlinePeople() {
  const userId = useAuthenticationStore((state) => state.userId);
  const userData = useAuthenticationStore((state) => state.userData);
  const { data: employeesRaw, isLoading } = useGetAllUsersData();
  const { data: departments } = useGetDepartmentsWithUsers();

  const canSeeAll = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllEmployeePlan],
  });
  const canManageAll = AccessGuard.checkAccess({
    permissions: [Permissions.approveAndRejectPlan],
  });

  const employees = useMemo(
    () => getEmployeeItems(employeesRaw),
    [employeesRaw],
  );

  const employeeById = useMemo(
    () =>
      new Map<string, any>(
        employees.map((employee) => [String(employee.id), employee]),
      ),
    [employees],
  );

  const subordinateIds = useMemo(
    () => getSubordinateIds(employees, userId),
    [employees, userId],
  );

  const getPerson = useCallback(
    (id: string | null | undefined): PersonOption | null => {
      if (!id) return null;
      // The signed-in user's own profile covers the gap while the employee
      // list is loading (or when it does not include them).
      const employee =
        employeeById.get(String(id)) ??
        (String(id) === userId ? userData : undefined);
      const name = employee ? getEmployeeName(employee) : '';
      return {
        id: String(id),
        name: name || 'Unknown user',
        departmentName: employee
          ? getEmployeeDepartment(employee).name
          : undefined,
      };
    },
    [employeeById, userId, userData],
  );

  /** Everyone the user may pick as an assignee or filter by; self first. */
  const selectablePeople = useMemo<PersonOption[]>(() => {
    const ids = canSeeAll
      ? employees.map((employee) => String(employee.id))
      : subordinateIds;
    const others = ids
      .filter((id) => id !== userId)
      .map((id) => getPerson(id))
      .filter((person): person is PersonOption => !!person)
      .sort((a, b) => a.name.localeCompare(b.name));
    const self = getPerson(userId);
    return self ? [self, ...others] : others;
  }, [canSeeAll, employees, subordinateIds, userId, getPerson]);

  const departmentOptions = useMemo(() => {
    const options = [{ label: 'All Departments', value: 'all' }];
    (Array.isArray(departments) ? departments : []).forEach((department) => {
      if (department?.name) {
        options.push({ label: department.name, value: department.id });
      }
    });
    return options;
  }, [departments]);

  const getDepartmentMemberIds = useCallback(
    (departmentId: string) =>
      getDepartmentUserIds(
        departmentId,
        employees,
        Array.isArray(departments) ? departments : undefined,
      ),
    [employees, departments],
  );

  const viewer = useMemo<TaskViewer>(
    () => ({ userId, subordinateIds, canManageAll }),
    [userId, subordinateIds, canManageAll],
  );

  return {
    userId,
    isLoading,
    viewer,
    subordinateIds,
    selectablePeople,
    departmentOptions,
    getPerson,
    getDepartmentMemberIds,
  };
}
