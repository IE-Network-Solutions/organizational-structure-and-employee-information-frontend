export type PayrollView =
  | 'payroll'
  | 'vp'
  | 'incentive'
  | 'vp_incentive'
  | 'all';

export const PAYROLL_VIEW_OPTIONS: { value: PayrollView; label: string }[] = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'vp', label: 'PP' },
  { value: 'incentive', label: 'Incentive' },
  { value: 'vp_incentive', label: 'PP + Incentive' },
  { value: 'all', label: 'All' },
];

/** Query flags for list / status APIs. `all` omits both flags. */
export function payrollViewToQueryParams(
  view: PayrollView,
): Record<string, string> {
  switch (view) {
    case 'vp':
      return { isPerformancePay: 'true', isIncentivePay: 'false' };
    case 'incentive':
      return { isPerformancePay: 'false', isIncentivePay: 'true' };
    case 'vp_incentive':
      return { isPerformancePay: 'true', isIncentivePay: 'true' };
    case 'all':
      return {};
    case 'payroll':
    default:
      return { isPerformancePay: 'false', isIncentivePay: 'false' };
  }
}

export type PayrollIncludeFlags = {
  includePayroll: boolean;
  includeMonthlyVariablePay: boolean;
  includeSessionVariablePay: boolean;
  includeIncentive: boolean;
};

/** True when any PP track is included (new flags or legacy includeVariablePay). */
export function hasAnyVariablePayInclude(flags: {
  includeMonthlyVariablePay?: boolean;
  includeSessionVariablePay?: boolean;
  /** Legacy: treat as monthly-only when new flags are absent. */
  includeVariablePay?: boolean;
}): boolean {
  const hasNewFlags =
    flags.includeMonthlyVariablePay !== undefined ||
    flags.includeSessionVariablePay !== undefined;
  if (hasNewFlags) {
    return (
      Boolean(flags.includeMonthlyVariablePay) ||
      Boolean(flags.includeSessionVariablePay)
    );
  }
  return Boolean(flags.includeVariablePay);
}

/** Prefill generate/regenerate include switches from the active list view. */
export function payrollViewToIncludeFlags(
  view: PayrollView,
): PayrollIncludeFlags {
  switch (view) {
    case 'vp':
      return {
        includePayroll: false,
        includeMonthlyVariablePay: true,
        includeSessionVariablePay: true,
        includeIncentive: false,
      };
    case 'incentive':
      return {
        includePayroll: false,
        includeMonthlyVariablePay: false,
        includeSessionVariablePay: false,
        includeIncentive: true,
      };
    case 'vp_incentive':
      return {
        includePayroll: false,
        includeMonthlyVariablePay: true,
        includeSessionVariablePay: true,
        includeIncentive: true,
      };
    case 'all':
      return {
        includePayroll: true,
        includeMonthlyVariablePay: true,
        includeSessionVariablePay: true,
        includeIncentive: true,
      };
    case 'payroll':
    default:
      return {
        includePayroll: true,
        includeMonthlyVariablePay: false,
        includeSessionVariablePay: false,
        includeIncentive: false,
      };
  }
}

/** After generate, switch list view to match what was just created. */
export function includeFlagsToPayrollView(flags: {
  includePayroll: boolean;
  includeIncentive: boolean;
  includeMonthlyVariablePay?: boolean;
  includeSessionVariablePay?: boolean;
  includeVariablePay?: boolean;
}): PayrollView {
  const { includePayroll, includeIncentive } = flags;
  const includeVariablePay = hasAnyVariablePayInclude(flags);
  if (includePayroll && includeVariablePay && includeIncentive) return 'all';
  if (!includePayroll && includeVariablePay && includeIncentive)
    return 'vp_incentive';
  if (!includePayroll && includeVariablePay && !includeIncentive) return 'vp';
  if (!includePayroll && !includeVariablePay && includeIncentive)
    return 'incentive';
  if (includePayroll && !includeVariablePay && !includeIncentive)
    return 'payroll';
  // Payroll + PP or Payroll + Incentive → show All so both row types appear
  if (includePayroll && (includeVariablePay || includeIncentive)) return 'all';
  return 'payroll';
}

export function appendPayrollViewParams(
  queryParams: URLSearchParams,
  view: PayrollView,
) {
  const flags = payrollViewToQueryParams(view);
  Object.entries(flags).forEach(([key, value]) => {
    queryParams.set(key, value);
  });
}
