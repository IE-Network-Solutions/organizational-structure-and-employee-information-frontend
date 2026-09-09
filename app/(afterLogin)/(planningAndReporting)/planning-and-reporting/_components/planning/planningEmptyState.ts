export type PlanningEmptyStateCopy = {
  title: string;
  description: string;
  hint?: string;
};

export function buildPlanningEmptyStateCopy(params: {
  selectedAssigneeCount: number;
  onlySelfSelected: boolean;
  periodLabel?: string;
  departmentName?: string;
  sessionNames?: string[];
  hasTeam: boolean;
}): PlanningEmptyStateCopy {
  const {
    selectedAssigneeCount,
    onlySelfSelected,
    periodLabel,
    departmentName,
    sessionNames,
    hasTeam,
  } = params;

  const period = periodLabel ? ` for ${periodLabel}` : '';
  const dept = departmentName ? ` in ${departmentName}` : '';
  const session =
    sessionNames && sessionNames.length > 0
      ? ` (${sessionNames.join(', ')})`
      : '';

  const filterContext = `${period}${dept}${session}`.trim();

  if (onlySelfSelected || selectedAssigneeCount <= 1) {
    return {
      title: 'No plans yet',
      description: filterContext
        ? `You have no planned tasks${filterContext}.`
        : 'You have no planned tasks with the current filters.',
      hint: 'Use Add Plan, then pick a key result — or tap + to plan without one.',
    };
  }

  if (!hasTeam) {
    return {
      title: 'No plans found',
      description: filterContext
        ? `No plans match${filterContext}.`
        : 'No plans match the current assignee and session filters.',
      hint: 'Select another assignee chip or adjust advanced filters.',
    };
  }

  return {
    title: 'No team plans',
    description: filterContext
      ? `No plans match the selected assignees${filterContext}.`
      : 'No plans match the selected assignees and current filters.',
    hint: 'Select more assignee chips or use Select all, then adjust department or session filters.',
  };
}
