/** Prototype VP criteria until backend registers them on /vp-criteria. */
export const EMPLOYEE_SCORECARD_VP_CRITERION = {
  id: 'prototype-employee-scorecard',
  name: 'Employee Scorecard',
} as const;

export type VpCriterionItem = {
  id: string;
  name: string;
};

export function mergeVpCriteriaWithPrototype(
  apiResponse: { items?: VpCriterionItem[] } | undefined,
) {
  const items = apiResponse?.items ?? [];
  const scorecardName = EMPLOYEE_SCORECARD_VP_CRITERION.name.toLowerCase();
  const alreadyPresent = items.some(
    (item) => item.name?.trim().toLowerCase() === scorecardName,
  );

  if (alreadyPresent) {
    return { ...apiResponse, items };
  }

  return {
    ...apiResponse,
    items: [...items, { ...EMPLOYEE_SCORECARD_VP_CRITERION }],
  };
}

export function findVpCriterionByName(
  items: VpCriterionItem[] | undefined,
  name: string,
): VpCriterionItem | undefined {
  return items?.find((item) => item.name === name);
}

export function findVpCriterionById(
  items: VpCriterionItem[] | undefined,
  id: string,
): VpCriterionItem | undefined {
  return items?.find((item) => item.id === id);
}
