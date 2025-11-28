import {
  ActiveMergedPayroll,
  Allowances,
} from '@/store/uistate/features/payroll/employeeInfoStore';
import { Space, Typography, Divider } from 'antd';

const { Text } = Typography;
type PayrollDetailsProps = {
  activeMergedPayroll?: ActiveMergedPayroll;
};

const PayrollDetails = ({ activeMergedPayroll }: PayrollDetailsProps) => {
  if (!activeMergedPayroll) {
    return (
      <Text
        id="payroll-details-empty-view-text"
        data-cy="payroll-details-empty-view-text"
        type="secondary"
      >
        No payroll available.
      </Text>
    );
  }
  const totalAmount = (items: Allowances[]) => {
    if (!items || items.length === 0) return '0.00';
    return items
      .reduce(
        (total: number, item: Allowances) =>
          total + parseFloat(item.amount || '0'),
        0,
      )
      .toFixed(2);
  };

  return (
    <Space
      id="payroll-details-wrapper-view-space"
      data-cy="payroll-details-wrapper-view-space"
      direction="vertical"
      size="large"
      style={{ width: '100%' }}
    >
      <div
        id="payroll-details-content-view-container"
        data-cy="payroll-details-content-view-container"
      >
        {/* Total Allowance */}
        <div
          id="payroll-details-allowances-section-view-container"
          data-cy="payroll-details-allowances-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-allowances-title-view-text"
            data-cy="payroll-details-allowances-title-view-text"
          >
            Entitled Allowance{' '}
            {totalAmount(activeMergedPayroll?.breakdown?.allowances)}
          </div>
          <div
            className="flex gap-6 w-full"
            id="payroll-details-allowances-grid-view-container"
            data-cy="payroll-details-allowances-grid-view-container"
          >
            <div
              className="flex flex-col gap-4 w-1/2 justify-center items-start pl-4 text-gray-600"
              id="payroll-details-allowances-types-view-column"
              data-cy="payroll-details-allowances-types-view-column"
            >
              {activeMergedPayroll?.breakdown?.allowances?.map(
                (item: any, index: any) => (
                  <Text
                    className="text-gray-600"
                    key={`payroll-details-allowance-type-${index}`}
                    id={`payroll-details-allowance-type-view-text-${index}`}
                    data-cy={`payroll-details-allowance-type-view-text-${index}`}
                  >
                    {item.type}
                  </Text>
                ),
              )}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start "
              id="payroll-details-allowances-amounts-view-column"
              data-cy="payroll-details-allowances-amounts-view-column"
            >
              {activeMergedPayroll?.breakdown?.allowances?.map(
                (item: any, index: any) => (
                  <Text
                    className="font-bold"
                    key={`payroll-details-allowance-amount-${index}`}
                    id={`payroll-details-allowance-amount-view-text-${index}`}
                    data-cy={`payroll-details-allowance-amount-view-text-${index}`}
                  >
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
            </div>
          </div>
          <Divider data-cy="payroll-details-allowances-divider" />
        </div>

        {/* Total Benefits */}
        <div
          id="payroll-details-benefits-section-view-container"
          data-cy="payroll-details-benefits-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-benefits-title-view-text"
            data-cy="payroll-details-benefits-title-view-text"
          >
            Entitled Benefits{' '}
            {totalAmount([
              ...(activeMergedPayroll?.breakdown?.merits || []),
              ...(activeMergedPayroll?.breakdown?.variablePay
                ? [
                    {
                      type: 'VP',
                      amount:
                        activeMergedPayroll?.breakdown?.variablePay.amount,
                    },
                  ]
                : []),
              ...(activeMergedPayroll?.breakdown?.incentives
                ? [
                    {
                      type: 'Incentive',
                      amount: activeMergedPayroll?.breakdown?.incentives.amount,
                    },
                  ]
                : []),
            ])}
          </div>
          <div
            className="flex gap-6 w-full"
            id="payroll-details-benefits-grid-view-container"
            data-cy="payroll-details-benefits-grid-view-container"
          >
            <div
              className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4"
              id="payroll-details-benefits-types-view-column"
              data-cy="payroll-details-benefits-types-view-column"
            >
              {activeMergedPayroll?.breakdown?.merits?.map(
                (item: any, index: any) => (
                  <Text
                    className="text-gray-600"
                    key={`payroll-details-benefit-type-${index}`}
                    id={`payroll-details-benefit-type-view-text-${index}`}
                    data-cy={`payroll-details-benefit-type-view-text-${index}`}
                  >
                    {item.type}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.variablePay && (
                <Text
                  className="text-gray-600"
                  id="payroll-details-variablepay-type-view-text"
                  data-cy="payroll-details-variablepay-type-view-text"
                >
                  {activeMergedPayroll?.breakdown?.variablePay?.type}
                </Text>
              )}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-benefits-amounts-view-column"
              data-cy="payroll-details-benefits-amounts-view-column"
            >
              {activeMergedPayroll?.breakdown?.merits?.map(
                (item: any, index: any) => (
                  <Text
                    className="font-bold"
                    key={`payroll-details-benefit-amount-${index}`}
                    id={`payroll-details-benefit-amount-view-text-${index}`}
                    data-cy={`payroll-details-benefit-amount-view-text-${index}`}
                  >
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
              {activeMergedPayroll?.breakdown?.variablePay && (
                <Text
                  className="font-bold"
                  id="payroll-details-variablepay-amount-view-text"
                  data-cy="payroll-details-variablepay-amount-view-text"
                >
                  {parseFloat(
                    activeMergedPayroll?.breakdown?.variablePay?.amount || '0',
                  ).toFixed(2)}{' '}
                </Text>
              )}
            </div>
          </div>
          <Divider data-cy="payroll-details-benefits-divider" />
        </div>

        {/* Total Deduction */}
        <div
          id="payroll-details-deductions-section-view-container"
          data-cy="payroll-details-deductions-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-deductions-title-view-text"
            data-cy="payroll-details-deductions-title-view-text"
          >
            Entitled Deduction{' '}
            {totalAmount([
              ...(activeMergedPayroll?.breakdown?.totalDeductionWithPension ||
                []),
            ])}
          </div>
          <div
            className="flex gap-6 w-full"
            id="payroll-details-deductions-grid-view-container"
            data-cy="payroll-details-deductions-grid-view-container"
          >
            <div
              className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4"
              id="payroll-details-deductions-types-view-column"
              data-cy="payroll-details-deductions-types-view-column"
            >
              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                (item: any, index: any) => (
                  <Text
                    className="text-gray-600"
                    key={`payroll-details-deduction-type-${index}`}
                    id={`payroll-details-deduction-type-view-text-${index}`}
                    data-cy={`payroll-details-deduction-type-view-text-${index}`}
                  >
                    {item.type}
                  </Text>
                ),
              )}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-deductions-amounts-view-column"
              data-cy="payroll-details-deductions-amounts-view-column"
            >
              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                (item: any, index: any) => (
                  <Text
                    className="font-bold"
                    key={`payroll-details-deduction-amount-${index}`}
                    id={`payroll-details-deduction-amount-view-text-${index}`}
                    data-cy={`payroll-details-deduction-amount-view-text-${index}`}
                  >
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                ),
              )}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-deductions-reason-view-column"
              data-cy="payroll-details-deductions-reason-view-column"
            >
              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                (item: any, index: any) => (
                  <Text
                    className="font-bold"
                    key={`payroll-details-deduction-reason-${index}`}
                    id={`payroll-details-deduction-reason-view-text-${index}`}
                    data-cy={`payroll-details-deduction-reason-view-text-${index}`}
                  >
                    {item.reason || '-'}
                  </Text>
                ),
              )}
            </div>
          </div>
          <Divider data-cy="payroll-details-deductions-divider" />
        </div>

        {/* Gross Earning & Net Pay */}
        <div
          className="flex gap-6 w-full"
          id="payroll-details-summary-view-container"
          data-cy="payroll-details-summary-view-container"
        >
          <div
            className="flex flex-col gap-4 w-1/3"
            id="payroll-details-summary-labels-view-column"
            data-cy="payroll-details-summary-labels-view-column"
          >
            <Text
              id="payroll-details-gross-label-view-text"
              data-cy="payroll-details-gross-label-view-text"
            >
              Gross Earning
            </Text>
            <Text
              id="payroll-details-net-label-view-text"
              data-cy="payroll-details-net-label-view-text"
            >
              Net Pay
            </Text>
          </div>
          <div
            className="flex flex-col gap-4"
            id="payroll-details-summary-values-view-column"
            data-cy="payroll-details-summary-values-view-column"
          >
            <Text
              className="font-bold"
              id="payroll-details-gross-value-view-text"
              data-cy="payroll-details-gross-value-view-text"
            >
              {activeMergedPayroll?.grossSalary}
            </Text>
            <Text
              className="font-bold"
              id="payroll-details-net-value-view-text"
              data-cy="payroll-details-net-value-view-text"
            >
              {activeMergedPayroll?.netPay}{' '}
            </Text>
          </div>
        </div>
      </div>
    </Space>
  );
};

export default PayrollDetails;
