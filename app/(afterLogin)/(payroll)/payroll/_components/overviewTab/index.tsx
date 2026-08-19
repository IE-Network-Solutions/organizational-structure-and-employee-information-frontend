'use client';

import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { MdAttachMoney, MdCardGiftcard } from 'react-icons/md';
import PayrollCard from '../cards';
import PayrollSummaryCardsSkeleton from '../PayrollSummaryCardsSkeleton';
import ActivityLogTab from '../activityLogTab';

const PAYROLL_SUMMARY_CARDS_ROW_CLASS =
  'mb-0 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:snap-none';

const PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start lg:min-w-0 lg:h-full lg:w-full lg:shrink lg:max-w-none';

interface OverviewTabProps {
  payPeriodId: string;
  payrollForExport?: {
    totalGrossPaymentAmount?: string | number;
    totalNetPayAmount?: string | number;
    totalAllowanceAmount?: string | number;
    totalMeritAmount?: string | number;
    totalDeductionsAmount?: string | number;
  };
  loading?: boolean;
}

const OverviewTab = ({
  payPeriodId,
  payrollForExport,
  loading,
}: OverviewTabProps) => (
  <div
    id="payroll-overview-tab-view-container"
    data-cy="payroll-overview-tab-view-container"
    className="w-full"
  >
      {loading ? (
        <PayrollSummaryCardsSkeleton />
      ) : (
        <div
          id="payroll-summary-cards-view-row"
          data-cy="payroll-summary-cards-view-row"
          className={PAYROLL_SUMMARY_CARDS_ROW_CLASS}
        >
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-amount"
          >
            <PayrollCard
              title="Total Amount"
              data-cy="payroll-summary-card-total-amount-view-component"
              value={payrollForExport?.totalGrossPaymentAmount}
              icon={
                <MdAttachMoney data-cy="payroll-summary-card-total-amount-icon" />
              }
              iconBg="bg-[#E6F4FF]"
              iconText="text-[#1E40AF]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-net-paid"
          >
            <PayrollCard
              title="Net Paid Amount"
              data-cy="payroll-summary-card-net-paid-view-component"
              value={payrollForExport?.totalNetPayAmount}
              icon={
                <LocalAtmIcon
                  data-cy="payroll-summary-card-net-paid-amount-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#F9F0FF]"
              iconText="text-[#722ED1]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-allowance"
          >
            <PayrollCard
              title="Total Allowance"
              data-cy="payroll-summary-card-total-allowance-view-component"
              value={payrollForExport?.totalAllowanceAmount}
              icon={
                <PaymentsIcon
                  data-cy="payroll-summary-card-total-allowance-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#F6FFED]"
              iconText="text-[#52C41A]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-benefit"
          >
            <PayrollCard
              title="Total Benefit"
              data-cy="payroll-summary-card-total-benefit-view-component"
              value={payrollForExport?.totalMeritAmount}
              icon={
                <MdCardGiftcard
                  data-cy="payroll-summary-card-total-benefit-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#FFFBE6]"
              iconText="text-[#FBB221]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-summary-cards-scroll-item-total-deduction"
          >
            <PayrollCard
              title="Total Deduction"
              data-cy="payroll-summary-card-total-deduction-view-component"
              value={payrollForExport?.totalDeductionsAmount}
              icon={
                <MoneyOffIcon
                  data-cy="payroll-summary-card-total-deduction-icon"
                  className="w-5 h-5"
                />
              }
              iconBg="bg-[#FFF2F0]"
              iconText="text-[#FF4D4F]"
            />
          </div>
        </div>
      )}

      <div
        id="payroll-overview-activity-log-section"
        data-cy="payroll-overview-activity-log-section"
        className="mt-8"
      >
        <h3
          id="payroll-overview-activity-log-title"
          data-cy="payroll-overview-activity-log-title"
          className="m-0 mb-4 text-base font-medium text-gray-900"
        >
          Activity Log
        </h3>
        <div
          data-cy="payroll-overview-activity-log-table-wrap"
          className="payroll-table-scroll-host overflow-x-auto scrollbar-none rounded-lg overflow-hidden"
        >
          <ActivityLogTab payPeriodId={payPeriodId} />
        </div>
      </div>
  </div>
);

export default OverviewTab;
