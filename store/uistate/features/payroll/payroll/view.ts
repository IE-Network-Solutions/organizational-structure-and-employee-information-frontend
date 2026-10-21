export type PayrollView =
  | 'payroll'
  | 'vp'
  | 'incentive'
  | 'vp_incentive'
  | 'all';

/** The pay period list shows every payment type until one is picked. */
export const DEFAULT_PAYROLL_VIEW: PayrollView = 'all';

/** Payment type of a row: a payroll run, or a standalone PP / incentive payment. */
export const PAYROLL_VIEW_OPTIONS: { value: PayrollView; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'payroll', label: 'Payroll run' },
  { value: 'vp', label: 'PP only (no payroll)' },
  { value: 'incentive', label: 'Incentive only (no payroll)' },
  { value: 'vp_incentive', label: 'PP + Incentive only (no payroll)' },
];

/** Narrows the list to rows that include a PP track or incentive. */
export type PayrollIncludes =
  | 'any'
  | 'pp_monthly'
  | 'pp_quarterly'
  | 'incentive';

export const DEFAULT_PAYROLL_INCLUDES: PayrollIncludes = 'any';

export const PAYROLL_INCLUDES_OPTIONS: {
  value: PayrollIncludes;
  label: string;
}[] = [
  { value: 'any', label: 'Any' },
  { value: 'pp_monthly', label: 'PP Monthly' },
  { value: 'pp_quarterly', label: 'PP Quarterly' },
  { value: 'incentive', label: 'Incentive' },
];

/** List / status API flags for an "includes" choice. */
export function payrollIncludesToQueryParams(
  includes?: string | null,
): Record<string, string> {
  switch (includes) {
    case 'pp_monthly':
      return { ppMonthly: 'true' };
    case 'pp_quarterly':
      return { ppQuarterly: 'true' };
    case 'incentive':
      return { withIncentive: 'true' };
    default:
      return {};
  }
}

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
