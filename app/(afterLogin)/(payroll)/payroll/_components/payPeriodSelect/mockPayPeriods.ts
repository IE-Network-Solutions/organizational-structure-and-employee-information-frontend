import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';

export const MOCK_FISCAL_YEAR_2026_ID = 'mock-fy-2026';
export const MOCK_FISCAL_YEAR_2025_ID = 'mock-fy-2025';

export const MOCK_FISCAL_YEARS = [
  {
    id: MOCK_FISCAL_YEAR_2026_ID,
    name: 'FY 2026',
    sessions: [
      {
        id: 'mock-session-2026-q1',
        name: 'Q1',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      },
      {
        id: 'mock-session-2026-q2',
        name: 'Q2',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
      },
      {
        id: 'mock-session-2026-q3',
        name: 'Q3',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
      },
      {
        id: 'mock-session-2026-q4',
        name: 'Q4',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
      },
    ],
  },
  {
    id: MOCK_FISCAL_YEAR_2025_ID,
    name: 'FY 2025',
    sessions: [
      {
        id: 'mock-session-2025-q3',
        name: 'Q3',
        startDate: '2025-07-01',
        endDate: '2025-09-30',
      },
      {
        id: 'mock-session-2025-q4',
        name: 'Q4',
        startDate: '2025-10-01',
        endDate: '2025-12-31',
      },
    ],
  },
];

const MOCK_TENANT_ID = 'mock-tenant';

function buildPeriod(
  year: number,
  month: number,
  status: PayPeriod['status'],
  fiscalYearId: string,
): PayPeriod {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const monthKey = String(month).padStart(2, '0');
  return {
    id: `mock-pp-${year}-${monthKey}`,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status,
    tenantId: MOCK_TENANT_ID,
    activeFiscalYearId: fiscalYearId,
  };
}

export const MOCK_PAY_PERIODS: PayPeriod[] = [
  buildPeriod(2026, 8, 'OPEN', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 7, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 6, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 5, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 4, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 3, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 2, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2026, 1, 'CLOSED', MOCK_FISCAL_YEAR_2026_ID),
  buildPeriod(2025, 12, 'CLOSED', MOCK_FISCAL_YEAR_2025_ID),
  buildPeriod(2025, 11, 'CLOSED', MOCK_FISCAL_YEAR_2025_ID),
  buildPeriod(2025, 10, 'CLOSED', MOCK_FISCAL_YEAR_2025_ID),
  buildPeriod(2025, 9, 'CLOSED', MOCK_FISCAL_YEAR_2025_ID),
];

export function getMockEmployeeOptions() {
  return MOCK_EMPLOYEES.map((employee) => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
    employeeData: employee,
  }));
}

export function isMockPayPeriodId(id?: string | null): boolean {
  return Boolean(id && id.startsWith('mock-pp-'));
}

export function findMockPayPeriod(id?: string | null): PayPeriod | undefined {
  if (!id) return undefined;
  return MOCK_PAY_PERIODS.find((period) => period.id === id);
}

const MOCK_EMPLOYEES = [
  {
    id: 'mock-emp-1',
    firstName: 'Abebe',
    middleName: 'Kebede',
    lastName: 'Tesfaye',
    profileImage: undefined as string | undefined,
    tinNumber: '0048211931',
    basicSalary: 28000,
  },
  {
    id: 'mock-emp-2',
    firstName: 'Hanna',
    middleName: 'Mekonnen',
    lastName: 'Alemu',
    profileImage: undefined as string | undefined,
    tinNumber: '0051938472',
    basicSalary: 34500,
  },
  {
    id: 'mock-emp-3',
    firstName: 'Yonas',
    middleName: 'Tadesse',
    lastName: 'Bekele',
    profileImage: undefined as string | undefined,
    tinNumber: '0039284716',
    basicSalary: 22000,
  },
  {
    id: 'mock-emp-4',
    firstName: 'Selam',
    middleName: 'Getachew',
    lastName: 'Haile',
    profileImage: undefined as string | undefined,
    tinNumber: '0061840293',
    basicSalary: 41000,
  },
  {
    id: 'mock-emp-5',
    firstName: 'Dawit',
    middleName: 'Solomon',
    lastName: 'Girma',
    profileImage: undefined as string | undefined,
    tinNumber: '0027481935',
    basicSalary: 19500,
  },
  {
    id: 'mock-emp-6',
    firstName: 'Marta',
    middleName: 'Assefa',
    lastName: 'Worku',
    profileImage: undefined as string | undefined,
    tinNumber: '0073519284',
    basicSalary: 31000,
  },
];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildEmployeeInfo(employee: (typeof MOCK_EMPLOYEES)[number]) {
  return {
    id: employee.id,
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    profileImage: employee.profileImage,
    basicSalaries: [
      {
        status: true,
        basicSalary: employee.basicSalary,
      },
    ],
    employeeInformation: {
      additionalInformation: {
        tinNumber: employee.tinNumber,
      },
    },
  };
}

export interface MockPayrollBundle {
  items: any[];
  meta: { totalItems: number };
  totalGrossPaymentAmount: number;
  totalNetPayAmount: number;
  totalAllowanceAmount: number;
  totalMeritAmount: number;
  totalDeductionsAmount: number;
}

export function getMockPayrollBundle(
  payPeriodId: string,
  pageSize = 10,
  currentPage = 1,
  employeeId?: string,
): { paged: MockPayrollBundle; all: MockPayrollBundle } {
  const periodIndex = Math.max(
    0,
    MOCK_PAY_PERIODS.findIndex((period) => period.id === payPeriodId),
  );
  const monthFactor = 1 + periodIndex * 0.015;

  const allItems = MOCK_EMPLOYEES.map((employee, index) => {
    const basicSalary = round2(employee.basicSalary * monthFactor);
    const transportAllowance = 2200;
    const positionAllowance = round2(basicSalary * 0.1);
    const totalAllowance = round2(transportAllowance + positionAllowance);
    const totalMerit = round2(800 + index * 150);
    const variablePay = round2(1200 + index * 200);
    const grossSalary = round2(
      basicSalary + totalAllowance + totalMerit + variablePay,
    );
    const pension = round2(basicSalary * 0.07);
    const companyPension = round2(basicSalary * 0.11);
    const tax = round2(grossSalary * 0.15);
    const totalDeductions = round2(pension + tax);
    const incentives = round2(index % 2 === 0 ? 500 : 0);
    const netPay = round2(grossSalary - totalDeductions + incentives);

    return {
      id: `${payPeriodId}-${employee.id}`,
      employeeId: employee.id,
      payPeriodId,
      basicSalary,
      totalAllowance,
      totalMerit,
      grossSalary,
      totalDeductions,
      netPay,
      employeeInfo: buildEmployeeInfo(employee),
      breakdown: {
        allowances: [
          {
            type: 'Transport Allowance',
            amount: transportAllowance,
            compensationItemId: 'mock-allowance-transport',
          },
          {
            type: 'Position Allowance',
            amount: positionAllowance,
            compensationItemId: 'mock-allowance-position',
          },
        ],
        merits: [{ type: 'Benefit', amount: totalMerit }],
        variablePay: { amount: variablePay, type: 'VP' },
        pension: [
          { type: 'Pension', amount: pension },
          { type: 'CompanyContribution', amount: companyPension },
        ],
        tax: { amount: tax },
        totalDeductionWithPension: [
          { type: 'Pension', amount: pension },
          { type: 'Tax', amount: tax },
        ],
        incentives: { amount: incentives, type: 'Incentive' },
      },
    };
  });

  const filteredItems = employeeId
    ? allItems.filter((item) => item.employeeId === employeeId)
    : allItems;

  const totals = filteredItems.reduce(
    (acc, item) => {
      acc.totalGrossPaymentAmount += Number(item.grossSalary);
      acc.totalNetPayAmount += Number(item.netPay);
      acc.totalAllowanceAmount += Number(item.totalAllowance);
      acc.totalMeritAmount += Number(item.totalMerit);
      acc.totalDeductionsAmount += Number(item.totalDeductions);
      return acc;
    },
    {
      totalGrossPaymentAmount: 0,
      totalNetPayAmount: 0,
      totalAllowanceAmount: 0,
      totalMeritAmount: 0,
      totalDeductionsAmount: 0,
    },
  );

  const start = (currentPage - 1) * pageSize;
  const pagedItems = filteredItems.slice(start, start + pageSize);

  const all: MockPayrollBundle = {
    items: filteredItems,
    meta: { totalItems: filteredItems.length },
    ...totals,
  };

  return {
    all,
    paged: {
      ...all,
      items: pagedItems,
    },
  };
}

export type PayrollActivityAction =
  | 'Generated'
  | 'Regenerated'
  | 'Approved'
  | 'Exported'
  | 'Payslip Sent'
  | 'Reconciled';

export interface PayrollActivityLog {
  id: string;
  payPeriodId: string;
  action: PayrollActivityAction;
  remarks: string;
  performedBy: {
    firstName: string;
    lastName: string;
  };
  performedAt: string;
}

export interface MockReconciliationComponent {
  type: string;
  label: string;
  previous: number;
  current: number;
  variance: number;
  variancePercentage: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface MockReconciliationBundle {
  previousPayPeriodId?: string;
  currentPayPeriodId: string;
  summary: {
    totalPayrollCost: number;
    previousPayrollCost: number;
    netVariance: number;
    netVariancePercentage: number;
    headcount: number;
    previousHeadcount: number;
    terminations: number;
  };
  components: MockReconciliationComponent[];
}

export interface MockReconciliationDetailRow {
  employeeName: string;
  description: string;
  previous: number;
  current: number;
  difference: number;
  userId: string;
}

function impactFromPercent(percent: number): 'High' | 'Medium' | 'Low' {
  const abs = Math.abs(percent);
  if (abs >= 5) return 'High';
  if (abs >= 2) return 'Medium';
  return 'Low';
}

export function getMockReconciliation(
  payPeriodId: string,
  previousPayPeriodId?: string,
): MockReconciliationBundle {
  const currentIndex = MOCK_PAY_PERIODS.findIndex(
    (period) => period.id === payPeriodId,
  );
  const previousPeriod = previousPayPeriodId
    ? findMockPayPeriod(previousPayPeriodId)
    : currentIndex >= 0
      ? MOCK_PAY_PERIODS[currentIndex + 1]
      : undefined;
  const current = getMockPayrollBundle(payPeriodId, 100, 1).all;
  const previous = previousPeriod
    ? getMockPayrollBundle(previousPeriod.id, 100, 1).all
    : {
        totalGrossPaymentAmount: 0,
        totalNetPayAmount: 0,
        totalAllowanceAmount: 0,
        totalMeritAmount: 0,
        totalDeductionsAmount: 0,
        items: [],
        meta: { totalItems: 0 },
      };

  const makeComponent = (
    type: string,
    label: string,
    currentValue: number,
    previousValue: number,
  ): MockReconciliationComponent => {
    const variance = round2(currentValue - previousValue);
    const percent =
      previousValue === 0 ? 0 : round2((variance / previousValue) * 100);
    return {
      type,
      label,
      previous: round2(previousValue),
      current: round2(currentValue),
      variance,
      variancePercentage: `${percent.toFixed(2)}%`,
      impact: impactFromPercent(percent),
    };
  };

  const netVariance = round2(
    current.totalGrossPaymentAmount - previous.totalGrossPaymentAmount,
  );
  const netVariancePercentage =
    previous.totalGrossPaymentAmount === 0
      ? 0
      : round2((netVariance / previous.totalGrossPaymentAmount) * 100);

  const currentBasicSalary = round2(
    current.items.reduce(
      (sum: number, item: { basicSalary?: number }) =>
        sum + Number(item.basicSalary || 0),
      0,
    ),
  );
  const previousBasicSalary = round2(
    previous.items.reduce(
      (sum: number, item: { basicSalary?: number }) =>
        sum + Number(item.basicSalary || 0),
      0,
    ),
  );

  return {
    previousPayPeriodId: previousPeriod?.id,
    currentPayPeriodId: payPeriodId,
    summary: {
      totalPayrollCost: round2(current.totalGrossPaymentAmount),
      previousPayrollCost: round2(previous.totalGrossPaymentAmount),
      netVariance,
      netVariancePercentage,
      headcount: current.meta.totalItems,
      previousHeadcount: previous.meta.totalItems,
      terminations: Math.max(
        0,
        previous.meta.totalItems - current.meta.totalItems,
      ),
    },
    components: [
      makeComponent(
        'BASIC_SALARY',
        'Basic Salary',
        currentBasicSalary,
        previousBasicSalary,
      ),
      makeComponent(
        'ALLOWANCE',
        'Total Allowance',
        current.totalAllowanceAmount,
        previous.totalAllowanceAmount,
      ),
      makeComponent(
        'BENEFIT',
        'Total Benefit',
        current.totalMeritAmount,
        previous.totalMeritAmount,
      ),
      makeComponent(
        'GROSS',
        'Gross Salary',
        current.totalGrossPaymentAmount,
        previous.totalGrossPaymentAmount,
      ),
      makeComponent(
        'DEDUCTION',
        'Total Deduction',
        current.totalDeductionsAmount,
        previous.totalDeductionsAmount,
      ),
      makeComponent(
        'NET',
        'Net Pay',
        current.totalNetPayAmount,
        previous.totalNetPayAmount,
      ),
      makeComponent(
        'HEADCOUNT',
        'Headcount',
        current.meta.totalItems,
        previous.meta.totalItems,
      ),
    ],
  };
}

function amountForComponentType(item: any, componentType: string): number {
  switch (componentType) {
    case 'BASIC_SALARY':
      return Number(item.basicSalary || 0);
    case 'ALLOWANCE':
      return Number(item.totalAllowance || 0);
    case 'BENEFIT':
      return Number(item.totalMerit || 0);
    case 'DEDUCTION':
      return Number(item.totalDeductions || 0);
    case 'NET':
      return Number(item.netPay || 0);
    case 'HEADCOUNT':
      return 1;
    case 'GROSS':
    default:
      return Number(item.grossSalary || 0);
  }
}

export function getMockReconciliationDetails({
  currentPayPeriodId,
  previousPayPeriodId,
  componentType,
  search,
  pageSize = 10,
  currentPage = 1,
}: {
  currentPayPeriodId: string;
  previousPayPeriodId?: string;
  componentType: string;
  search?: string;
  pageSize?: number;
  currentPage?: number;
}) {
  const currentItems = getMockPayrollBundle(currentPayPeriodId, 100, 1).all
    .items;
  const previousItems = previousPayPeriodId
    ? getMockPayrollBundle(previousPayPeriodId, 100, 1).all.items
    : [];
  const previousByEmployee = new Map(
    previousItems.map((item: any) => [item.employeeId, item]),
  );

  let rows: MockReconciliationDetailRow[] = currentItems.map((item: any) => {
    const previousItem = previousByEmployee.get(item.employeeId);
    const currentAmount = amountForComponentType(item, componentType);
    const previousAmount = previousItem
      ? amountForComponentType(previousItem, componentType)
      : 0;
    const info = item.employeeInfo || {};
    return {
      employeeName:
        `${info.firstName || ''} ${info.middleName || ''} ${info.lastName || ''}`.trim(),
      description: componentType,
      previous: round2(previousAmount),
      current: round2(currentAmount),
      difference: round2(currentAmount - previousAmount),
      userId: item.employeeId,
    };
  });

  if (search) {
    const query = search.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.userId === search || row.employeeName.toLowerCase().includes(query),
    );
  }

  const start = (currentPage - 1) * pageSize;
  return {
    employeeVariances: {
      items: rows.slice(start, start + pageSize),
      meta: { totalItems: rows.length },
    },
  };
}

export function getSeedActivityLogs(payPeriodId: string): PayrollActivityLog[] {
  const period = findMockPayPeriod(payPeriodId);
  const end = period ? new Date(period.endDate) : new Date();
  const at = (daysBefore: number, hour: number) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - daysBefore);
    date.setUTCHours(hour, 15, 0, 0);
    return date.toISOString();
  };

  const financeUser = { firstName: 'Liya', lastName: 'Asfaw' };
  const approver = { firstName: 'Henok', lastName: 'Berhanu' };
  const isOpen = period?.status === 'OPEN';

  const logs: PayrollActivityLog[] = [
    {
      id: `${payPeriodId}-log-generate`,
      payPeriodId,
      action: 'Generated',
      remarks: 'Payroll generated for all active employees.',
      performedBy: financeUser,
      performedAt: at(12, 9),
    },
  ];

  if (!isOpen) {
    logs.push(
      {
        id: `${payPeriodId}-log-regenerate`,
        payPeriodId,
        action: 'Regenerated',
        remarks: 'Payroll regenerated after allowance corrections.',
        performedBy: financeUser,
        performedAt: at(10, 11),
      },
      {
        id: `${payPeriodId}-log-approve`,
        payPeriodId,
        action: 'Approved',
        remarks: 'Payroll approved in the approval workflow.',
        performedBy: approver,
        performedAt: at(8, 14),
      },
      {
        id: `${payPeriodId}-log-export`,
        payPeriodId,
        action: 'Exported',
        remarks: 'Bank file and payroll workbook exported.',
        performedBy: financeUser,
        performedAt: at(7, 16),
      },
      {
        id: `${payPeriodId}-log-payslip`,
        payPeriodId,
        action: 'Payslip Sent',
        remarks: 'Payslips emailed to employees.',
        performedBy: financeUser,
        performedAt: at(7, 16),
      },
      {
        id: `${payPeriodId}-log-reconcile`,
        payPeriodId,
        action: 'Reconciled',
        remarks: 'Compared current payroll against the previous pay period.',
        performedBy: financeUser,
        performedAt: at(6, 10),
      },
    );
  } else {
    logs.push({
      id: `${payPeriodId}-log-regenerate`,
      payPeriodId,
      action: 'Regenerated',
      remarks: 'Payroll regenerated to include latest incentives.',
      performedBy: financeUser,
      performedAt: at(2, 10),
    });
  }

  return logs.sort(
    (a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );
}
