import {
  ActiveMergedPayroll,
  Allowances,
} from '@/store/uistate/features/payroll/employeeInfoStore';
import { Space, Typography, Divider } from 'antd';
import { getPayslipEarningsSections } from '@/utils/payslipBreakdown';

const { Text } = Typography;
type PayrollDetailsProps = {
  activeMergedPayroll?: ActiveMergedPayroll;
  bankName?: string;
  accountNumber?: string;
  showBankInformation?: boolean;
};

const PayrollDetails = ({
  activeMergedPayroll,
  bankName,
  accountNumber,
  showBankInformation = true,
}: PayrollDetailsProps) => {
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

  const sections = getPayslipEarningsSections(activeMergedPayroll?.breakdown);

  const totalAmount = (items: Allowances[]) => {
    if (!items || items.length === 0) return '0.00';
    return items
      .reduce(
        (total: number, item: Allowances) =>
          total + parseFloat(String(item.amount || '0')),
        0,
      )
      .toFixed(2);
  };

  const formatAmount = (amount: string | number) =>
    parseFloat(String(amount || '0')).toFixed(2);

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
        {/* Entitled Allowance */}
        <div
          id="payroll-details-allowances-section-view-container"
          data-cy="payroll-details-allowances-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-allowances-title-view-text"
            data-cy="payroll-details-allowances-title-view-text"
          >
            Entitled Allowance {sections.entitledAllowanceTotal.toFixed(2)}
          </div>
          <div
            className="flex gap-6 w-full"
            id="payroll-details-allowances-grid-view-container"
            data-cy="payroll-details-allowances-grid-view-container"
          >
            <div
              className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4 text-gray-600"
              id="payroll-details-allowances-types-view-column"
              data-cy="payroll-details-allowances-types-view-column"
            >
              {sections.allowances.map((item, index) => (
                <Text
                  className="text-gray-600"
                  key={`payroll-details-allowance-type-${index}`}
                  id={`payroll-details-allowance-type-view-text-${index}`}
                  data-cy={`payroll-details-allowance-type-view-text-${index}`}
                >
                  {item.type}
                </Text>
              ))}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start "
              id="payroll-details-allowances-amounts-view-column"
              data-cy="payroll-details-allowances-amounts-view-column"
            >
              {sections.allowances.map((item, index) => (
                <Text
                  className="font-bold"
                  key={`payroll-details-allowance-amount-${index}`}
                  id={`payroll-details-allowance-amount-view-text-${index}`}
                  data-cy={`payroll-details-allowance-amount-view-text-${index}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              ))}
            </div>
          </div>
          <Divider data-cy="payroll-details-allowances-divider" />
        </div>

        {/* Entitled Benefits (merits only — no Project Incentive / VP) */}
        <div
          id="payroll-details-benefits-section-view-container"
          data-cy="payroll-details-benefits-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-benefits-title-view-text"
            data-cy="payroll-details-benefits-title-view-text"
          >
            Entitled Benefits {sections.entitledBenefitTotal.toFixed(2)}
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
              {sections.entitledBenefitItems.map((item, index) => (
                <Text
                  className="text-gray-600"
                  key={`payroll-details-benefit-type-${index}`}
                  id={`payroll-details-benefit-type-view-text-${index}`}
                  data-cy={`payroll-details-benefit-type-view-text-${index}`}
                >
                  {item.type}
                </Text>
              ))}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-benefits-amounts-view-column"
              data-cy="payroll-details-benefits-amounts-view-column"
            >
              {sections.entitledBenefitItems.map((item, index) => (
                <Text
                  className="font-bold"
                  key={`payroll-details-benefit-amount-${index}`}
                  id={`payroll-details-benefit-amount-view-text-${index}`}
                  data-cy={`payroll-details-benefit-amount-view-text-${index}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              ))}
            </div>
          </div>
          <Divider data-cy="payroll-details-benefits-divider" />
        </div>

        {/* Incentive: Variable Pay + Project Incentive / Incentives */}
        <div
          id="payroll-details-incentive-section-view-container"
          data-cy="payroll-details-incentive-section-view-container"
        >
          <div
            className="my-6 text-xl text-gray-600"
            id="payroll-details-incentive-title-view-text"
            data-cy="payroll-details-incentive-title-view-text"
          >
            Incentive {sections.entitledIncentiveTotal.toFixed(2)}
          </div>
          <div
            className="flex gap-6 w-full"
            id="payroll-details-incentive-grid-view-container"
            data-cy="payroll-details-incentive-grid-view-container"
          >
            <div
              className="flex flex-col gap-6 w-1/3 justify-center items-start pl-4"
              id="payroll-details-incentive-types-view-column"
              data-cy="payroll-details-incentive-types-view-column"
            >
              {sections.incentiveItems.map((item, index) => (
                <Text
                  className="text-gray-600"
                  key={`payroll-details-incentive-type-${index}`}
                  id={`payroll-details-incentive-type-view-text-${index}`}
                  data-cy={`payroll-details-incentive-type-view-text-${index}`}
                >
                  {item.type}
                </Text>
              ))}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-incentive-amounts-view-column"
              data-cy="payroll-details-incentive-amounts-view-column"
            >
              {sections.incentiveItems.map((item, index) => (
                <Text
                  className="font-bold"
                  key={`payroll-details-incentive-amount-${index}`}
                  id={`payroll-details-incentive-amount-view-text-${index}`}
                  data-cy={`payroll-details-incentive-amount-view-text-${index}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              ))}
            </div>
          </div>
          <Divider data-cy="payroll-details-incentive-divider" />
        </div>

        {/* Entitled Deduction */}
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
            {totalAmount(sections.deductions as Allowances[])}
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
              {sections.deductions.map((item, index) => (
                <Text
                  className="text-gray-600"
                  key={`payroll-details-deduction-type-${index}`}
                  id={`payroll-details-deduction-type-view-text-${index}`}
                  data-cy={`payroll-details-deduction-type-view-text-${index}`}
                >
                  {item.type}
                </Text>
              ))}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-deductions-amounts-view-column"
              data-cy="payroll-details-deductions-amounts-view-column"
            >
              {sections.deductions.map((item, index) => (
                <Text
                  className="font-bold"
                  key={`payroll-details-deduction-amount-${index}`}
                  id={`payroll-details-deduction-amount-view-text-${index}`}
                  data-cy={`payroll-details-deduction-amount-view-text-${index}`}
                >
                  {formatAmount(item.amount)}
                </Text>
              ))}
            </div>
            <div
              className="flex flex-col gap-6 text-right justify-end items-start"
              id="payroll-details-deductions-reason-view-column"
              data-cy="payroll-details-deductions-reason-view-column"
            >
              {sections.deductions.map((item, index) => (
                <Text
                  className="font-bold"
                  key={`payroll-details-deduction-reason-${index}`}
                  id={`payroll-details-deduction-reason-view-text-${index}`}
                  data-cy={`payroll-details-deduction-reason-view-text-${index}`}
                >
                  {item.reason || '-'}
                </Text>
              ))}
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

        {showBankInformation && (
          <>
            <Divider data-cy="payroll-details-bank-divider" />
            <div
              id="payroll-details-bank-section-view-container"
              data-cy="payroll-details-bank-section-view-container"
            >
              <div
                className="my-6 text-xl text-gray-600"
                id="payroll-details-bank-title-view-text"
                data-cy="payroll-details-bank-title-view-text"
              >
                Employee Bank Information
              </div>
              <div
                className="flex gap-6 w-full"
                id="payroll-details-bank-grid-view-container"
                data-cy="payroll-details-bank-grid-view-container"
              >
                <div
                  className="flex flex-col gap-4 w-1/3 pl-4 text-gray-600"
                  id="payroll-details-bank-labels-view-column"
                  data-cy="payroll-details-bank-labels-view-column"
                >
                  <Text data-cy="payroll-details-bank-label-method">
                    Payment Method
                  </Text>
                  <Text data-cy="payroll-details-bank-label-name">
                    Bank Name
                  </Text>
                  <Text data-cy="payroll-details-bank-label-account">
                    Account Number
                  </Text>
                </div>
                <div
                  className="flex flex-col gap-4 font-bold"
                  id="payroll-details-bank-values-view-column"
                  data-cy="payroll-details-bank-values-view-column"
                >
                  <Text data-cy="payroll-details-bank-value-method">
                    Bank Transfer
                  </Text>
                  <Text data-cy="payroll-details-bank-value-name">
                    {bankName || '--'}
                  </Text>
                  <Text data-cy="payroll-details-bank-value-account">
                    {accountNumber || '--'}
                  </Text>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Space>
  );
};

export default PayrollDetails;
