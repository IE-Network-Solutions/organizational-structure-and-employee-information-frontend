export function resolveEmployeeAndPlanType(state: {
  planningFilterPlanType?: string;
  planningFilterEmployee?: string;
  selectedUser?: string[];
}): { employeeSelect: string; planType: string } {
  const planType = state.planningFilterPlanType || 'myPlan';
  const storedEmployee = state.planningFilterEmployee;
  const selectedUser = state.selectedUser ?? [];

  if (
    storedEmployee &&
    storedEmployee !== 'all' &&
    storedEmployee !== 'subordinate'
  ) {
    return { employeeSelect: storedEmployee, planType };
  }

  if (
    planType === 'all' &&
    selectedUser.length === 1 &&
    selectedUser[0] !== 'all' &&
    selectedUser[0] !== 'subordinate'
  ) {
    return { employeeSelect: selectedUser[0], planType: 'all' };
  }

  return { employeeSelect: 'all', planType };
}
