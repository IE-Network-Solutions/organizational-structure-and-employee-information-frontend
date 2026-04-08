'use client';

import { Card } from 'antd';

const CARD_COUNT = 5;

function PayrollSummaryCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="w-full min-w-0"
      data-cy={`payroll-summary-card-skeleton-column-${index}`}
    >
      <Card
        bordered={false}
        className="h-full shadow-sm"
        style={{
          borderRadius: '10px',
          border: '2px solid #A8AEB9',
        }}
        styles={{ body: { padding: '16px' } }}
        data-cy={`payroll-summary-card-skeleton-card-${index}`}
      >
        <div
          className="flex items-center gap-2 mb-2"
          data-cy={`payroll-summary-card-skeleton-header-${index}`}
        >
          <div
            className="h-7 w-7 shrink-0 rounded-sm bg-gray-200 animate-pulse"
            data-cy={`payroll-summary-card-skeleton-icon-${index}`}
          />
          <div
            className="h-4 max-w-[120px] flex-1 rounded bg-gray-200 animate-pulse"
            data-cy={`payroll-summary-card-skeleton-title-${index}`}
          />
        </div>
        <div
          className="mb-4 h-7 max-w-[180px] w-[60%] rounded bg-gray-200 animate-pulse"
          data-cy={`payroll-summary-card-skeleton-value-${index}`}
        />
        <div
          className="h-4 max-w-[220px] w-[85%] rounded bg-gray-200 animate-pulse"
          data-cy={`payroll-summary-card-skeleton-growth-${index}`}
        />
      </Card>
    </div>
  );
}

/**
 * Payroll dashboard: mirrors {@link PayrollCard} layout while export/summary
 * data is loading.
 */
const PayrollSummaryCardsSkeleton = () => (
  <div
    id="payroll-summary-cards-skeleton-row"
    data-cy="payroll-summary-cards-skeleton-row"
    className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
  >
    {Array.from({ length: CARD_COUNT }, (unused, i) => (
      <PayrollSummaryCardSkeleton key={`payroll-summary-sk-${i}`} index={i} />
    ))}
  </div>
);

export default PayrollSummaryCardsSkeleton;
