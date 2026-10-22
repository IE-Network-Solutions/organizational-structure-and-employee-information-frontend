import {
  approvalsForPeriod,
  areTypesApproved,
  getLockedTypes,
  hasOpenGeneration,
  isPeriodFullyApproved,
  PeriodApproval,
  requiredTypesForView,
} from './generationTypes';
import {
  getApprovableItems,
  getPendingApprovalForPeriod,
} from './payrollApprovalVisibility';

const approval = (
  generationType: PeriodApproval['generationType'],
  approved: boolean,
): PeriodApproval => ({ payPeriodId: 'pp-1', generationType, approved });

describe('generation type approvals', () => {
  it('locks only the approved types', () => {
    const locked = getLockedTypes([
      approval('PAYROLL', true),
      approval('PP_MONTHLY', false),
    ]);
    expect(Array.from(locked)).toEqual(['PAYROLL']);
  });

  it('treats an approval without a type as a payroll approval', () => {
    expect(
      Array.from(getLockedTypes([{ payPeriodId: 'pp-1', approved: true }])),
    ).toEqual(['PAYROLL']);
  });

  it('is fully approved only when every generation is approved', () => {
    expect(isPeriodFullyApproved([])).toBe(false);
    expect(
      isPeriodFullyApproved([
        approval('PAYROLL', true),
        approval('PP_MONTHLY', false),
      ]),
    ).toBe(false);
    expect(isPeriodFullyApproved([approval('PAYROLL', true)])).toBe(true);
  });

  it('reports an open generation while one is still pending', () => {
    expect(hasOpenGeneration([approval('PAYROLL', true)])).toBe(false);
    expect(
      hasOpenGeneration([
        approval('PAYROLL', true),
        approval('INCENTIVE', false),
      ]),
    ).toBe(true);
  });

  it('filters approvals by pay period', () => {
    const items = [approval('PAYROLL', true), { payPeriodId: 'other' }];
    expect(approvalsForPeriod(items, 'pp-1')).toHaveLength(1);
    expect(approvalsForPeriod(undefined, 'pp-1')).toEqual([]);
  });

  describe('bank letter requirement per view', () => {
    const existing = ['PAYROLL' as const, 'PP_MONTHLY' as const];

    it('needs payroll approved for the payroll view', () => {
      const required = requiredTypesForView('payroll', 'any', existing);
      expect(
        areTypesApproved(
          [approval('PAYROLL', true), approval('PP_MONTHLY', false)],
          required,
        ),
      ).toBe(true);
    });

    it('needs the PP types that exist for the PP view', () => {
      const required = requiredTypesForView('vp', 'any', existing);
      expect(required).toEqual(['PP_MONTHLY']);
      expect(
        areTypesApproved(
          [approval('PAYROLL', true), approval('PP_MONTHLY', false)],
          required,
        ),
      ).toBe(false);
    });

    it('needs every generation for the all view', () => {
      const required = requiredTypesForView('all', 'any', existing);
      expect(
        areTypesApproved(
          [approval('PAYROLL', true), approval('PP_MONTHLY', false)],
          required,
        ),
      ).toBe(false);
    });

    it('is never approved when nothing is required', () => {
      expect(areTypesApproved([], [])).toBe(false);
    });
  });
});

describe('pending approvals per generation type', () => {
  const pendingItem = (
    id: string,
    generationType: PeriodApproval['generationType'],
    userId: string,
  ) => ({
    id,
    payPeriodId: 'pp-1',
    generationType,
    approved: false,
    approvalWorkflowId: 'wf-1',
    nextApprover: [{ userId, stepOrder: 1 }],
  });

  const pending = {
    items: [
      pendingItem('a-1', 'PAYROLL', 'user-1'),
      pendingItem('a-2', 'PP_MONTHLY', 'user-1'),
      pendingItem('a-3', 'INCENTIVE', 'user-2'),
    ],
  };

  it('finds the pending item of one generation type', () => {
    expect(getPendingApprovalForPeriod(pending, 'pp-1', 'PP_MONTHLY')?.id).toBe(
      'a-2',
    );
    expect(getPendingApprovalForPeriod(pending, 'pp-1')?.id).toBe('a-1');
    expect(getPendingApprovalForPeriod(pending, 'pp-1', 'PP_QUARTERLY')).toBe(
      undefined,
    );
  });

  it('offers one approve action per generation waiting for the user', () => {
    const items = getApprovableItems({
      payPeriodId: 'pp-1',
      currentUserId: 'user-1',
      payrollExists: true,
      pendingApprovals: pending,
    });
    expect(items.map((item) => item.id)).toEqual(['a-1', 'a-2']);
  });

  it('skips generations that are already approved', () => {
    const items = getApprovableItems({
      payPeriodId: 'pp-1',
      currentUserId: 'user-1',
      payrollExists: true,
      pendingApprovals: {
        items: [{ ...pendingItem('a-1', 'PAYROLL', 'user-1'), approved: true }],
      },
    });
    expect(items).toEqual([]);
  });

  it('offers nothing while loading or without payroll', () => {
    const base = {
      payPeriodId: 'pp-1',
      currentUserId: 'user-1',
      pendingApprovals: pending,
    };
    expect(getApprovableItems({ ...base, payrollExists: false })).toEqual([]);
    expect(
      getApprovableItems({
        ...base,
        payrollExists: true,
        isPendingLoading: true,
      }),
    ).toEqual([]);
  });
});
