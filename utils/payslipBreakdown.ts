export type PayslipAmountItem = {
  type: string;
  amount: string | number;
  reason?: string | null;
};

const PROJECT_INCENTIVE_TYPE = 'Project Incentive';

const toNumber = (value: unknown) => {
  const n = parseFloat(String(value ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Split payroll breakdown into display sections without double-counting
 * Project Incentive (stored in merits on full payroll, and in incentives on VP/incentive-only).
 *
 * Layout (email PDF + employee download / cards):
 * - Allowances
 * - Benefits = merits excluding Project Incentive
 * - Incentive = Variable Pay + Project Incentive/Incentives (once)
 * - Deductions
 */
export function getPayslipEarningsSections(breakdown?: {
  allowances?: PayslipAmountItem[];
  merits?: PayslipAmountItem[];
  variablePay?: PayslipAmountItem | null;
  incentives?: PayslipAmountItem | null;
  totalDeductionWithPension?: PayslipAmountItem[];
}) {
  const allowances = breakdown?.allowances ?? [];
  const merits = breakdown?.merits ?? [];
  const entitledBenefitItems = merits.filter(
    (item) => item?.type !== PROJECT_INCENTIVE_TYPE,
  );
  const projectIncentiveFromMerits = merits.find(
    (item) => item?.type === PROJECT_INCENTIVE_TYPE,
  );

  const variablePayAmount = toNumber(breakdown?.variablePay?.amount);
  const incentiveAmount = projectIncentiveFromMerits
    ? toNumber(projectIncentiveFromMerits.amount)
    : toNumber(breakdown?.incentives?.amount);

  const incentiveItems: PayslipAmountItem[] = [
    {
      type: 'Variable Pay',
      amount: variablePayAmount,
    },
    {
      type: projectIncentiveFromMerits
        ? PROJECT_INCENTIVE_TYPE
        : breakdown?.incentives?.type || 'Incentives',
      amount: incentiveAmount,
    },
  ];

  const deductions = breakdown?.totalDeductionWithPension ?? [];

  return {
    allowances,
    entitledBenefitItems,
    incentiveItems,
    variablePayAmount,
    incentiveAmount,
    deductions,
    entitledAllowanceTotal: allowances.reduce(
      (sum, item) => sum + toNumber(item.amount),
      0,
    ),
    entitledBenefitTotal: entitledBenefitItems.reduce(
      (sum, item) => sum + toNumber(item.amount),
      0,
    ),
    entitledIncentiveTotal: variablePayAmount + incentiveAmount,
    entitledDeductionTotal: deductions.reduce(
      (sum, item) => sum + toNumber(item.amount),
      0,
    ),
  };
}
