import type {
  PayrollIncludes,
  PayrollView,
} from '@/store/uistate/features/payroll/payroll/view';

/**
 * A pay period holds several independent generations. Each one is approved,
 * locked and published on its own.
 */
export type PayrollGenerationType =
  | 'PAYROLL'
  | 'PP_MONTHLY'
  | 'PP_QUARTERLY'
  | 'INCENTIVE';

export const PAYROLL_GENERATION_TYPES: PayrollGenerationType[] = [
  'PAYROLL',
  'PP_MONTHLY',
  'PP_QUARTERLY',
  'INCENTIVE',
];

export const GENERATION_TYPE_LABEL: Record<PayrollGenerationType, string> = {
  PAYROLL: 'Payroll',
  PP_MONTHLY: 'PP Monthly',
  PP_QUARTERLY: 'PP Quarterly',
  INCENTIVE: 'Incentive',
};

export type PeriodApproval = {
  id?: string;
  payPeriodId?: string;
  generationType?: PayrollGenerationType;
  approved?: boolean;
};

/** Approvals created before generation types existed are payroll approvals. */
export function approvalType(
  approval?: Pick<PeriodApproval, 'generationType'> | null,
): PayrollGenerationType {
  return approval?.generationType ?? 'PAYROLL';
}

export function approvalsForPeriod<T extends PeriodApproval>(
  approvals: unknown,
  payPeriodId?: string,
): T[] {
  if (!payPeriodId || !Array.isArray(approvals)) return [];
  return (approvals as T[]).filter((item) => item?.payPeriodId === payPeriodId);
}

/** Types that are approved, so they can no longer be generated or changed. */
export function getLockedTypes(
  approvals: PeriodApproval[],
): Set<PayrollGenerationType> {
  return new Set(
    approvals.filter((a) => a.approved === true).map((a) => approvalType(a)),
  );
}

/** A period is fully approved when it has approvals and every one is approved. */
export function isPeriodFullyApproved(approvals: PeriodApproval[]): boolean {
  return approvals.length > 0 && approvals.every((a) => a.approved === true);
}

/** Generations that exist but are still waiting for approval. */
export function hasOpenGeneration(approvals: PeriodApproval[]): boolean {
  return approvals.some((a) => a.approved !== true);
}

/**
 * Generation types a payroll list view depends on. A payment export (bank
 * letter) is only allowed once all of them are approved.
 */
export function requiredTypesForView(
  view: PayrollView,
  includes: PayrollIncludes | undefined,
  existing: PayrollGenerationType[],
): PayrollGenerationType[] {
  const ppTypes: PayrollGenerationType[] =
    includes === 'pp_monthly'
      ? ['PP_MONTHLY']
      : includes === 'pp_quarterly'
        ? ['PP_QUARTERLY']
        : ['PP_MONTHLY', 'PP_QUARTERLY'];
  const present = (types: PayrollGenerationType[]) =>
    types.filter((type) => existing.includes(type));

  switch (view) {
    case 'payroll':
      return ['PAYROLL'];
    case 'vp':
      return present(ppTypes);
    case 'incentive':
      return ['INCENTIVE'];
    case 'vp_incentive':
      return present([...ppTypes, 'INCENTIVE']);
    default:
      return existing;
  }
}

export function areTypesApproved(
  approvals: PeriodApproval[],
  required: PayrollGenerationType[],
): boolean {
  if (!required.length) return false;
  const locked = getLockedTypes(approvals);
  return required.every((type) => locked.has(type));
}
