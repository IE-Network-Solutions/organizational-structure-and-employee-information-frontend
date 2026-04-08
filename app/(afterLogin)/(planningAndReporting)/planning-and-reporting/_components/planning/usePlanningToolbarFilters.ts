import { useCallback, useMemo } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

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

export function buildEmployeeOptions(
  department: string | undefined,
  employeeData: ReturnType<typeof useGetAllUsers>['data'],
  departmentData: ReturnType<typeof useGetDepartmentsWithUsers>['data'],
): EmployeeItem[] {
  const getUserIdsByDepartmentId = (departmentId: string) => {
    const department = departmentData?.find(
      (dep: any) => dep.id === departmentId,
    );
    if (department && department.users) {
      return department.users.map((user: any) => user.id);
    }
    return [];
  };

  const options: EmployeeItem[] = [{ label: 'All employees', value: 'all' }];
  if (employeeData?.items) {
    let employeesToShow = employeeData.items;

    if (department && department !== 'all') {
      const departmentUserIds = getUserIdsByDepartmentId(department);
      employeesToShow = employeeData.items.filter((emp: any) =>
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
  }
  return options;
}

export function initPlanningFilterDraftFromStore(): PlanningFilterDraft {
  const s = PlanningAndReportingStore.getState();
  const employeeSelect = 'all';

  return {
    employeeSelect,
    planType: s.planningFilterPlanType,
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
  },
) {
  const getUserIdsByDepartmentId = (departmentId: string) => {
    const department = deps.departmentData?.find(
      (dep: any) => dep.id === departmentId,
    );
    if (department && department.users) {
      return department.users.map((user: any) => user.id);
    }
    return [];
  };

  const {
    setPlanningFilterPlanType,
    setPlanningFilterDepartment,
    setSelectedUser,
    setSelectedFiscalYearId,
    setSelectedSessionIds,
    setAllSessionsOfYear,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore.getState();

  setPlanningFilterPlanType(draft.planType);
  setPlanningFilterDepartment(
    draft.department === 'all' ? undefined : draft.department,
  );

  const planType = draft.planType;
  const value = draft.department === 'all' ? 'all' : draft.department;

  if (value === 'all') {
    if (planType === 'all') {
      setSelectedUser(['all']);
    } else if (planType === 'myPlan') {
      setSelectedUser([deps.userId]);
    } else if (planType === 'subordinatePlan') {
      const subordinates =
        deps.employeeData?.items
          ?.filter(
            (employee: any) =>
              (employee?.delegatedTo?.id || employee.reportingTo?.id) ===
              deps.userId,
          )
          .map((employee: any) => employee.id) || [];
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
      const userInDepartment = departmentUserIds.includes(deps.userId);
      setSelectedUser(userInDepartment ? [deps.userId] : []);
    } else if (planType === 'subordinatePlan') {
      const subordinates =
        deps.employeeData?.items
          ?.filter(
            (employee: any) =>
              (employee?.delegatedTo?.id || employee.reportingTo?.id) ===
                deps.userId && departmentUserIds.includes(employee.id),
          )
          .map((employee: any) => employee.id) || [];
      setSelectedUser(
        subordinates.length > 0
          ? ['subordinate', ...subordinates]
          : ['subordinate'],
      );
    }
  }

  if (
    draft.planType === 'all' &&
    draft.department === 'all' &&
    draft.employeeSelect !== 'all' &&
    draft.employeeSelect !== 'subordinate'
  ) {
    setSelectedUser([draft.employeeSelect]);
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
}

export function usePlanningToolbarFilters() {
  const { data: employeeData, isLoading: isEmployeesLoading } =
    useGetAllUsers();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { userId } = useAuthenticationStore();
  const {
    selectedUser,
    setSelectedUser,
    planningFilterDepartment,
    setPlanningFilterDepartment,
    planningFilterPlanType,
    setPlanningFilterPlanType,
  } = PlanningAndReportingStore();

  const getUserIdsByDepartmentId = useCallback(
    (departmentId: string) => {
      const department = departmentData?.find(
        (dep: any) => dep.id === departmentId,
      );
      if (department && department.users) {
        return department.users.map((user: any) => user.id);
      }
      return [];
    },
    [departmentData],
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
    if (value === 'all') {
      setSelectedUser(['all']);
    } else {
      setSelectedUser([value]);
    }
  };

  const handlePlanTypeChange = (value: string) => {
    setPlanningFilterDepartment(undefined);
    setPlanningFilterPlanType(value);

    if (value === 'all') {
      setSelectedUser(['all']);
    } else if (value === 'myPlan') {
      setSelectedUser([userId]);
    } else if (value === 'subordinatePlan') {
      const subordinates =
        employeeData?.items
          ?.filter(
            (employee: any) =>
              (employee?.delegatedTo?.id || employee.reportingTo?.id) ===
              userId,
          )
          .map((employee: any) => employee.id) || [];
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
        const subordinates =
          employeeData?.items
            ?.filter(
              (employee: any) =>
                (employee?.delegatedTo?.id || employee.reportingTo?.id) ===
                userId,
            )
            .map((employee: any) => employee.id) || [];
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
        const subordinates =
          employeeData?.items
            ?.filter(
              (employee: any) =>
                (employee?.delegatedTo?.id || employee.reportingTo?.id) ===
                  userId && departmentUserIds.includes(employee.id),
            )
            .map((employee: any) => employee.id) || [];
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
