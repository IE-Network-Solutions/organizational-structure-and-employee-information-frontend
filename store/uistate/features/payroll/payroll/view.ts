export type PayrollView =
  | 'payroll'
  | 'vp'
  | 'incentive'
  | 'vp_incentive'
  | 'all';

/** Every payment type is shown until some are picked. */
export const DEFAULT_PAYROLL_VIEW: PayrollView = 'all';

/** Narrows the list to rows that include a PP track or incentive. */
export type PayrollIncludes =
  | 'any'
  | 'pp_monthly'
  | 'pp_quarterly'
  | 'incentive';

export const DEFAULT_PAYROLL_INCLUDES: PayrollIncludes = 'any';

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

/**
 * Payment type filter: any of salary, monthly / quarterly performance and
 * incentive, stored on the page as a comma separated string (empty = all).
 * The names are the generation types the approvals use.
 */
export const PAYMENT_TYPE_ORDER = [
  'PAYROLL',
  'PP_MONTHLY',
  'PP_QUARTERLY',
  'INCENTIVE',
] as const;
export type PaymentType = (typeof PAYMENT_TYPE_ORDER)[number];

export function parsePaymentTypes(value?: string | null): PaymentType[] {
  const wanted = String(value ?? '')
    .split(',')
    .map((part) => part.trim());
  return PAYMENT_TYPE_ORDER.filter((type) => wanted.includes(type));
}

/** Empty selection and "all four" both mean every type, so neither is sent. */
export function serializePaymentTypes(
  types: readonly PaymentType[],
): string | undefined {
  const ordered = PAYMENT_TYPE_ORDER.filter((type) => types.includes(type));
  if (ordered.length === 0 || ordered.length === PAYMENT_TYPE_ORDER.length) {
    return undefined;
  }
  return ordered.join(',');
}

/** List API params for a payment type selection. */
export function paymentTypesToQueryParams(
  value?: string | null,
): Record<string, string> {
  const types = parsePaymentTypes(value);
  const serialized = serializePaymentTypes(types);
  return serialized ? { paymentTypes: serialized } : {};
}

/**
 * Query string for the payroll list and the cards built from it: the pay
 * period plus any payment type, division and department filters. Empty values
 * are left out so cleared filters don't reach the API.
 */
export function buildPayrollListQuery(filters: {
  payPeriodId?: string | null;
  paymentTypes?: string | null;
  divisionId?: string | null;
  departmentId?: string | null;
}): string {
  const params = new URLSearchParams();
  if (filters.payPeriodId) params.append('payPeriodId', filters.payPeriodId);
  Object.entries(paymentTypesToQueryParams(filters.paymentTypes)).forEach(
    ([key, value]) => params.append(key, value),
  );
  if (filters.divisionId) params.append('divisionId', filters.divisionId);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  const qs = params.toString();
  return qs ? `&${qs}` : '';
}
