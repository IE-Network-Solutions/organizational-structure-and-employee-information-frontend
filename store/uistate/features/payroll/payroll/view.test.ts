import { buildPayrollListQuery } from './view';

describe('buildPayrollListQuery', () => {
  it('is only the pay period when nothing else is set', () => {
    expect(buildPayrollListQuery({ payPeriodId: 'pp-1' })).toBe(
      '&payPeriodId=pp-1',
    );
  });

  it('adds payment types, division and department to the same query', () => {
    expect(
      buildPayrollListQuery({
        payPeriodId: 'pp-1',
        paymentTypes: 'PAYROLL,INCENTIVE',
        divisionId: 'div-1',
        departmentId: 'dep-1',
      }),
    ).toBe(
      '&payPeriodId=pp-1&paymentTypes=PAYROLL%2CINCENTIVE&divisionId=div-1&departmentId=dep-1',
    );
  });

  it('leaves out cleared filters and sends nothing without a pay period', () => {
    expect(
      buildPayrollListQuery({
        payPeriodId: '',
        paymentTypes: undefined,
        divisionId: null,
        departmentId: '',
      }),
    ).toBe('');
  });

  it('leaves out payment types when all four are selected', () => {
    expect(
      buildPayrollListQuery({
        payPeriodId: 'pp-1',
        paymentTypes: 'PAYROLL,PP_MONTHLY,PP_QUARTERLY,INCENTIVE',
      }),
    ).toBe('&payPeriodId=pp-1');
  });
});
