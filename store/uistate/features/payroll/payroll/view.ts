export type PayrollView =
  | 'payroll'
  | 'vp'
  | 'incentive'
  | 'vp_incentive'
  | 'all';

export const PAYROLL_VIEW_OPTIONS: { value: PayrollView; label: string }[] = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'vp', label: 'VP' },
  { value: 'incentive', label: 'Incentive' },
  { value: 'vp_incentive', label: 'VP + Incentive' },
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

/** Prefill generate/regenerate include switches from the active list view. */
export function payrollViewToIncludeFlags(view: PayrollView): {
  includePayroll: boolean;
  includeVariablePay: boolean;
  includeIncentive: boolean;
} {
  switch (view) {
    case 'vp':
      return {
        includePayroll: false,
        includeVariablePay: true,
        includeIncentive: false,
      };
    case 'incentive':
      return {
        includePayroll: false,
        includeVariablePay: false,
        includeIncentive: true,
      };
    case 'vp_incentive':
      return {
        includePayroll: false,
        includeVariablePay: true,
        includeIncentive: true,
      };
    case 'all':
      return {
        includePayroll: true,
        includeVariablePay: true,
        includeIncentive: true,
      };
    case 'payroll':
    default:
      return {
        includePayroll: true,
        includeVariablePay: false,
        includeIncentive: false,
      };
  }
}

/** After generate, switch list view to match what was just created. */
export function includeFlagsToPayrollView(flags: {
  includePayroll: boolean;
  includeVariablePay: boolean;
  includeIncentive: boolean;
}): PayrollView {
  const { includePayroll, includeVariablePay, includeIncentive } = flags;
  if (includePayroll && includeVariablePay && includeIncentive) return 'all';
  if (!includePayroll && includeVariablePay && includeIncentive)
    return 'vp_incentive';
  if (!includePayroll && includeVariablePay && !includeIncentive) return 'vp';
  if (!includePayroll && !includeVariablePay && includeIncentive)
    return 'incentive';
  if (includePayroll && !includeVariablePay && !includeIncentive)
    return 'payroll';
  // Payroll + VP or Payroll + Incentive → show All so both row types appear
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
