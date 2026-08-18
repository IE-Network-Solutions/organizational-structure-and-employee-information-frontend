'use client';

import React, { useMemo, useState } from 'react';
import { Card, Select, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import { PayPeriodCardSkeleton } from '@/components/common/PayPeriodCardSkeleton';
import EmptyState from '@/components/empty';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MOCK_FISCAL_YEARS, MOCK_PAY_PERIODS } from './mockPayPeriods';

const { Option } = Select;

const PAY_PERIOD_SKELETON_COUNT = 6;

const payPeriodTagTextColor = 'rgba(0, 0, 0, 0.7)';
const payPeriodTagBackgroundColor = 'rgba(0, 0, 0, 0.02)';

const payPeriodChipLayoutStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  height: 22,
  minHeight: 22,
  padding: '1px 8px',
  borderRadius: 4,
  border: '1px solid #D9D9D9',
  fontSize: 12,
  lineHeight: '18px',
  fontWeight: 400,
};

const pillStyle: React.CSSProperties = {
  ...payPeriodChipLayoutStyle,
  background: payPeriodTagBackgroundColor,
  color: payPeriodTagTextColor,
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const statusTagStyle: React.CSSProperties = {
  ...payPeriodChipLayoutStyle,
  color: payPeriodTagTextColor,
  backgroundColor: payPeriodTagBackgroundColor,
};

const payPeriodCardShellStyle: React.CSSProperties = {
  width: '100%',
  minWidth: 0,
  borderRadius: 8,
  border: '1px solid #D9D9D9',
  boxShadow: 'none',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  cursor: 'pointer',
};

const payPeriodCardBodyStyle: React.CSSProperties = {
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  flex: 1,
  minHeight: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
};

function asPayPeriodList(data: unknown): PayPeriod[] {
  if (Array.isArray(data)) {
    return data as PayPeriod[];
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: PayPeriod[] }).items;
  }
  return [];
}

export function formatPayPeriodLabel(period: {
  startDate: string;
  endDate?: string;
}): string {
  return dayjs(period.startDate).format('MMMM YYYY');
}

export function formatPayPeriodRange(period: {
  startDate: string;
  endDate: string;
}): string {
  return `${dayjs(period.startDate).format('MMMM D, YYYY')} - ${dayjs(period.endDate).format('MMMM D, YYYY')}`;
}

interface PayPeriodSelectProps {
  onSelect: (payPeriodId: string) => void;
}

const PayPeriodSelect: React.FC<PayPeriodSelectProps> = ({ onSelect }) => {
  const { isMobile, isTablet } = useIsMobile();

  const [fiscalYearId, setFiscalYearId] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const payPeriods = useMemo(() => {
    const list = asPayPeriodList(MOCK_PAY_PERIODS);
    return [...list].sort((a, b) => {
      const aOpen = a.status === 'OPEN';
      const bOpen = b.status === 'OPEN';
      if (aOpen && !bOpen) return -1;
      if (bOpen && !aOpen) return 1;
      return dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf();
    });
  }, []);

  const filteredPeriods = useMemo(() => {
    if (!fiscalYearId) return payPeriods;
    return payPeriods.filter(
      (period) => period.activeFiscalYearId === fiscalYearId,
    );
  }, [payPeriods, fiscalYearId]);

  const paginatedPeriods = filteredPeriods.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const onPageChange = (page: number, nextPageSize?: number) => {
    setCurrentPage(page);
    if (nextPageSize) {
      setPageSize(nextPageSize);
    }
  };

  const onPageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  };

  const handleYearChange = (value: string | undefined) => {
    setFiscalYearId(value);
    setCurrentPage(1);
  };

  const fiscalYears = MOCK_FISCAL_YEARS;
  const isLoading = false;

  return (
    <div
      id="payroll-pay-period-select-view-container"
      data-cy="payroll-pay-period-select-view-container"
      className="w-full"
    >
      <div
        id="payroll-pay-period-select-toolbar"
        data-cy="payroll-pay-period-select-toolbar"
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div data-cy="payroll-pay-period-select-copy">
          <p
            id="payroll-pay-period-select-title"
            data-cy="payroll-pay-period-select-title"
            className="m-0 text-base font-medium text-gray-900"
          >
            Select a pay period
          </p>
          <p
            id="payroll-pay-period-select-subtitle"
            data-cy="payroll-pay-period-select-subtitle"
            className="m-0 mt-1 text-sm text-gray-500"
          >
            Choose a pay period to view payroll data. All periods in the system
            are available.
          </p>
        </div>
        <Select
          id="payroll-pay-period-select-year-select"
          data-cy="payroll-pay-period-select-year-select"
          placeholder="All fiscal years"
          allowClear
          value={fiscalYearId}
          onChange={handleYearChange}
          className="w-full sm:w-[217px] h-8"
        >
          {fiscalYears.map((year) => (
            <Option
              key={year.id}
              value={year.id}
              data-cy={`payroll-pay-period-select-year-option-${year.id}`}
            >
              {year.name}
            </Option>
          ))}
        </Select>
      </div>

      <div
        id="payroll-pay-period-select-grid"
        data-cy="payroll-pay-period-select-grid"
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          Array.from(
            { length: PAY_PERIOD_SKELETON_COUNT },
            (element: unknown, skeletonIndex: number) => (
              <PayPeriodCardSkeleton
                key={`payroll-pay-period-select-sk-${skeletonIndex}`}
                index={skeletonIndex}
                dataCyPrefix="payroll-pay-period-select-card-skeleton"
              />
            ),
          )
        ) : filteredPeriods.length === 0 ? (
          <div
            id="payroll-pay-period-select-empty-state"
            data-cy="payroll-pay-period-select-empty-state"
            className="col-span-full"
          >
            <EmptyState
              title="No pay periods found"
              description="Create a pay period in Payroll Settings to get started."
              data-cy="payroll-pay-period-select-empty-state-inner"
            />
          </div>
        ) : (
          paginatedPeriods.map((period) => {
            const isOpen = period.status === 'OPEN';
            const range = formatPayPeriodRange(period);
            const title = formatPayPeriodLabel(period);

            return (
              <Card
                key={period.id}
                id={`payroll-pay-period-select-card-${period.id}`}
                data-cy={`payroll-pay-period-select-card-${period.id}`}
                style={payPeriodCardShellStyle}
                bodyStyle={payPeriodCardBodyStyle}
                hoverable
                onClick={() => onSelect(period.id)}
                className="transition-colors hover:!border-primary"
              >
                <div
                  id={`payroll-pay-period-select-card-header-${period.id}`}
                  data-cy={`payroll-pay-period-select-card-header-${period.id}`}
                  className="flex shrink-0 items-start justify-between"
                  style={{ gap: 8 }}
                >
                  <h3
                    id={`payroll-pay-period-select-card-title-${period.id}`}
                    data-cy={`payroll-pay-period-select-card-title-${period.id}`}
                    className="m-0 min-w-0 flex-1 truncate text-base font-normal leading-tight"
                    style={{ color: '#000000' }}
                  >
                    {title}
                  </h3>
                </div>

                <div
                  id={`payroll-pay-period-select-card-details-${period.id}`}
                  data-cy={`payroll-pay-period-select-card-details-${period.id}`}
                  className="flex min-h-0 shrink flex-wrap items-center"
                  style={{ gap: 6 }}
                >
                  <span
                    id={`payroll-pay-period-select-card-range-${period.id}`}
                    data-cy={`payroll-pay-period-select-card-range-${period.id}`}
                    style={{
                      ...pillStyle,
                      whiteSpace: 'normal',
                      height: 'auto',
                      minHeight: 22,
                    }}
                    title={range}
                  >
                    {range}
                  </span>
                  <span
                    id={`payroll-pay-period-select-card-status-${period.id}`}
                    data-cy={`payroll-pay-period-select-card-status-${period.id}`}
                    className="shrink-0"
                    style={statusTagStyle}
                  >
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div
        id="payroll-pay-period-select-pagination"
        data-cy="payroll-pay-period-select-pagination"
        className="mt-4 pt-4"
      >
        {isLoading ? (
          <div data-cy="payroll-pay-period-select-pagination-skeleton">
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 1, width: ['100%'] }}
            />
          </div>
        ) : isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="payroll-pay-period-select-mobile-pagination"
            totalResults={filteredPeriods.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="payroll-pay-period-select-desktop-pagination"
            current={currentPage}
            total={filteredPeriods.length}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default PayPeriodSelect;
