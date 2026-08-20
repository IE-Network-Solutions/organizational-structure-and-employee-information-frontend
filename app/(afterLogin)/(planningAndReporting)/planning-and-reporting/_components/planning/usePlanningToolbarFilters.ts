import { useCallback, useMemo } from 'react';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { resolveEmployeeAndPlanType } from './resolveFilterDraft';
import { getEmployeeDepartmentId, getEmployeeItems, getSubordinateIds } from './departmentUsers';

export const planTypeOptions = [
  { label: 'All Plans', value: 'all' },
  { label: 'My Plans', value: 'myPlan' },
  { label: 'Subordinate Plans', value: 'subordinatePlan' },
];

export type PlanningFilterDraft = {
  employeeSelect: string;
  planType: string;
  /** 'all' or department id */
  department: string;
  fiscalYearId: string | null;
  sessionIds: string[];
};

type EmployeeItem = { label: string; value: string };

function collectDepartmentUserIds(
  departmentId: string,
  employeeData: any,
  departmentData: any,
  allLevelDepartmentUserIds?: string[],
) {
  const department = departmentData?.find(
    (dep: any) => dep.id === departmentId,
  );
  const fromDepartmentEntity =
    department?.users?.map((user: any) => String(user.id)) ?? [];
  const fromEmployees = getEmployeeItems(employeeData)
    .filter((emp: any) => getEmployeeDepartmentId(emp) === departmentId)
    .map((emp: any) => String(emp.id));

  return Array.from(
    new Set([
      ...(allLevelDepartmentUserIds ?? []),
      ...fromDepartmentEntity,
      ...fromEmployees,
    ]),
  ).filter((id) => id);
}

export function buildEmployeeOptions(
  department: string | undefined,
  employeeData: ReturnType<typeof useGetAllUsers>['data'],
  departmentData: ReturnType<typeof useGetDepartmentsWithUsers>['data'],
  allLevelDepartmentUserIds?: string[],
): EmployeeItem[] {
  const options: EmployeeItem[] = [{ label: 'All employees', value: 'all' }];
  const employees = getEmployeeItems(employeeData);
  if (employees.length === 0) return options;

  let employeesToShow = employees;
  if (department && department !== 'all') {
    const departmentUserIds = collectDepartmentUserIds(
      department,
      employeeData,
      departmentData,
      allLevelDepartmentUserIds,
    );
    employeesToShow = employees.filter((emp: any) =>
      departmentUserIds.includes(emp.id),
    );
  }

  employeesToShow.forEach((emp: any) => {
    const name =
      `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
    if (name) {
      options.push({ label: name, value: emp.id });
    }
  });
  return options;
}

export function initPlanningFilterDraftFromStore(): PlanningFilterDraft {
  const s = PlanningAndReportingStore.getState();
  const { employeeSelect, planType } = resolveEmployeeAndPlanType({
    planningFilterPlanType: s.planningFilterPlanType,
    planningFilterEmployee: s.planningFilterEmployee,
    selectedUser: s.selectedUser,
  });

  return {
    employeeSelect,
    planType,
    department: s.planningFilterDepartment ?? 'all',
    fiscalYearId: s.selectedFiscalYearId,
    sessionIds: [...s.selectedSessionIds],
  };
}

export function commitPlanningDraft(
  draft: PlanningFilterDraft,
  deps: {
    userId: string;
    employeeData: ReturnType<typeof useGetAllUsers>['data'];
    departmentData: ReturnType<typeof useGetDepartmentsWithUsers>['data'];
    allLevelDepartmentUserIds?: string[];
  },
) {
  const getUserIdsByDepartmentId = (departmentId: string) => {
    return collectDepartmentUserIds(
      departmentId,
      deps.employeeData,
      deps.departmentData,
      deps.allLevelDepartmentUserIds,
    );
  };

  const {
    setPlanningFilterPlanType,
    setPlanningFilterDepartment,
    setPlanningFilterEmployee,
    setSelectedUser,
    setSelectedFiscalYearId,
    setSelectedSessionIds,
    setAllSessionsOfYear,
    setPage,
    setPageReporting,
    setPlanningDefaultFilterApplied,
  } = PlanningAndReportingStore.getState();

  const appliedEmployee =
    draft.planType === 'all' &&
    draft.employeeSelect !== 'all' &&
    draft.employeeSelect !== 'subordinate'
      ? draft.employeeSelect
      : 'all';

  setPlanningFilterPlanType(draft.planType);
  setPlanningFilterEmployee(appliedEmployee);
  setPlanningFilterDepartment(
    draft.department === 'all' ? undefined : draft.department,
  );

  const planType = draft.planType;
  const value = draft.department === 'all' ? 'all' : draft.department;
  const selectedDepartmentUserIds =
    value === 'all' ? [] : getUserIdsByDepartmentId(value);

  if (value === 'all') {
    if (planType === 'all') {
      setSelectedUser(['all']);
    } else if (planType === 'myPlan') {
      setSelectedUser([deps.userId]);
    } else if (planType === 'subordinatePlan') {
      const subordinates = getSubordinateIds(deps.employeeData, deps.userId);
      setSelectedUser(
        subordinates.length > 0
          ? ['subordinate', ...subordinates]
          : ['subordinate'],
      );
    }
  } else {
    const departmentUserIds = selectedDepartmentUserIds;

    if (planType === 'all') {
      setSelectedUser(departmentUserIds.length > 0 ? departmentUserIds : []);
    } else if (planType === 'myPlan') {
      const userInDepartment = departmentUserIds.includes(deps.userId);
      setSelectedUser(userInDepartment ? [deps.userId] : []);
    } else if (planType === 'subordinatePlan') {
      const subordinates = getSubordinateIds(
        deps.employeeData,
        deps.userId,
      ).filter((id) => departmentUserIds.includes(id));
      setSelectedUser(
        subordinates.length > 0
          ? ['subordinate', ...subordinates]
          : ['subordinate'],
      );
    }
  }

  if (
    draft.planType === 'all' &&
    draft.employeeSelect !== 'all' &&
    draft.employeeSelect !== 'subordinate'
  ) {
    if (
      value === 'all' ||
      selectedDepartmentUserIds.includes(draft.employeeSelect)
    ) {
      setSelectedUser([draft.employeeSelect]);
    } else {
      setSelectedUser([]);
    }
  }

  if (!draft.fiscalYearId) {
    setSelectedFiscalYearId(null);
    setSelectedSessionIds([]);
    setAllSessionsOfYear([]);
  } else {
    setSelectedFiscalYearId(draft.fiscalYearId);
    setSelectedSessionIds([...draft.sessionIds]);
  }
  setPage(1);
  setPageReporting(1);
  setPlanningDefaultFilterApplied(true);
}

export function usePlanningToolbarFilters() {
  const { data: allEmployeesRaw, isLoading: isEmployeesLoading } =
    useGetAllUsersData();
  const employeeData = useMemo(
    () => ({ items: getEmployeeItems(allEmployeesRaw) }),
    [allEmployeesRaw],
  );
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { userId } = useAuthenticationStore();
  const {
    selectedUser,
    setSelectedUser,
    planningFilterDepartment,
    setPlanningFilterDepartment,
    planningFilterPlanType,
    setPlanningFilterPlanType,
    setPlanningFilterEmployee,
  } = PlanningAndReportingStore();

  const getUserIdsByDepartmentId = useCallback(
    (departmentId: string) =>
      collectDepartmentUserIds(departmentId, employeeData, departmentData),
    [departmentData, employeeData],
  );

  const employeeOptions = useMemo(() => {
    return buildEmployeeOptions(
      planningFilterDepartment,
      employeeData,
      departmentData,
    );
  }, [employeeData, planningFilterDepartment, departmentData]);

  const getSelectedEmployeeValue = () => {
    const currentValue = selectedUser?.[0];
    if (
      !currentValue ||
      currentValue === 'all' ||
      currentValue === 'subordinate'
    ) {
      return 'all';
    }
    const optionExists = employeeOptions.some(
      (opt) => opt.value === currentValue,
    );
    return optionExists ? currentValue : undefined;
  };

  const departmentOptions = useMemo(() => {
    const options = [{ label: 'All Departments', value: 'all' }];
    if (departmentData) {
      departmentData.forEach((dept: any) => {
        if (dept.name) {
          options.push({ label: dept.name, value: dept.id });
        }
      });
    }
    return options;
  }, [departmentData]);

  const handleEmployeeChange = (value: string) => {
    setPlanningFilterDepartment(undefined);
    setPlanningFilterPlanType('all');
    setPlanningFilterEmployee(value === 'all' ? 'all' : value);
    if (value === 'all') {
      setSelectedUser(['all']);
    } else {
      setSelectedUser([value]);
    }
  };

  const handlePlanTypeChange = (value: string) => {
    setPlanningFilterDepartment(undefined);
    setPlanningFilterPlanType(value);
    setPlanningFilterEmployee('all');

    if (value === 'all') {
      setSelectedUser(['all']);
    } else if (value === 'myPlan') {
      setSelectedUser([userId]);
    } else if (value === 'subordinatePlan') {
      const subordinates = getSubordinateIds(employeeData, userId);
      setSelectedUser(
        subordinates.length > 0
          ? ['subordinate', ...subordinates]
          : ['subordinate'],
      );
    }
  };

  const handleDepartmentChange = (value: string) => {
    setPlanningFilterDepartment(value === 'all' ? undefined : value);

    const planType =
      PlanningAndReportingStore.getState().planningFilterPlanType;

    if (value === 'all') {
      if (planType === 'all') {
        setSelectedUser(['all']);
      } else if (planType === 'myPlan') {
        setSelectedUser([userId]);
      } else if (planType === 'subordinatePlan') {
        const subordinates = getSubordinateIds(employeeData, userId);
        setSelectedUser(
          subordinates.length > 0
            ? ['subordinate', ...subordinates]
            : ['subordinate'],
        );
      }
    } else {
      const departmentUserIds = getUserIdsByDepartmentId(value);

      if (planType === 'all') {
        setSelectedUser(departmentUserIds.length > 0 ? departmentUserIds : []);
      } else if (planType === 'myPlan') {
        const userInDepartment = departmentUserIds.includes(userId);
        setSelectedUser(userInDepartment ? [userId] : []);
      } else if (planType === 'subordinatePlan') {
        const subordinates = getSubordinateIds(employeeData, userId).filter(
          (id) => departmentUserIds.includes(id),
        );
        setSelectedUser(
          subordinates.length > 0
            ? ['subordinate', ...subordinates]
            : ['subordinate'],
        );
      }
    }
  };

  return {
    employeeData,
    isEmployeesLoading,
    departmentData,
    employeeOptions,
    departmentOptions,
    planningFilterPlanType,
    planningFilterDepartment,
    getSelectedEmployeeValue,
    handleEmployeeChange,
    handlePlanTypeChange,
    handleDepartmentChange,
  };
}
