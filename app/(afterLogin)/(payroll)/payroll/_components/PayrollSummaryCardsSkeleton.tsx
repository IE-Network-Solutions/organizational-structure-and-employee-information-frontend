'use client';

import { Card } from 'antd';

const CARD_COUNT = 5;

/** Match {@link Payroll} summary row: horizontal scroll below `sm`; grid from `sm` up. */
const PAYROLL_SUMMARY_CARDS_ROW_CLASS =
  'mb-8 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x sm:grid sm:grid-cols-2 sm:overflow-x-visible sm:snap-none lg:grid-cols-5';

const PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start sm:min-w-0 sm:h-full sm:w-full sm:shrink sm:max-w-none';

function PayrollSummaryCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="h-full w-full min-w-0"
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
    className={PAYROLL_SUMMARY_CARDS_ROW_CLASS}
  >
    {Array.from({ length: CARD_COUNT }, (unused, i) => (
      <div
        key={`payroll-summary-sk-wrap-${i}`}
        className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
        data-cy={`payroll-summary-cards-skeleton-scroll-item-${i}`}
      >
        <PayrollSummaryCardSkeleton index={i} />
      </div>
    ))}
  </div>
);

export default PayrollSummaryCardsSkeleton;

