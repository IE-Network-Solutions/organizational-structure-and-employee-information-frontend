import { Modal, Progress, Spin, Table, Tag } from 'antd';
import React, { useMemo } from 'react';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ColumnsType } from 'antd/es/table';

/** Above entitlement/benefit-type sidebars (`zIndex={10002}`) so tracking stays on top. */
const BENEFIT_TRACKING_MODAL_Z_INDEX = 10200;

const formatMoney = (value: number) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BenefitTracking = () => {
  const {
    setEmployeeBenefitData,
    employeeBenefitData,
    detailCurrentPage,
    setDetailCurrentPage,
    detailPageSize,
    setDetailPageSize,
  } = useBenefitEntitlementStore();

  const handleClose = () => {
    setEmployeeBenefitData(null);
    setDetailCurrentPage(1);
  };

  const { isMobile, isTablet } = useIsMobile();
  const { data: payPeriods } = useGetPayPeriod();

  const compensationItemEntitlementId =
    employeeBenefitData?.id ||
    employeeBenefitData?.[0]?.compensationItemEntitlementId;
  const userId =
    employeeBenefitData?.userId ||
    employeeBenefitData?.[0]?.compensationItemEntitlement?.employeeId;

  const { data: employeeEntitlementData, isLoading } =
    useEmployeeSettlementTracking(compensationItemEntitlementId, userId);

  const settlementTracking = employeeEntitlementData?.settlementTracking || [];

  const startIndex = (detailCurrentPage - 1) * detailPageSize;
  const endIndex = startIndex + detailPageSize;
  const paginatedTracking = settlementTracking.slice(startIndex, endIndex);

  const { totalAmount, totalPaid, remaining } = useMemo(() => {
    let paid = 0;
    let rem = 0;
    for (const item of settlementTracking) {
      const amt = Number(item.amount) || 0;
      if (item.isPaid === true) paid += amt;
      else rem += amt;
    }
    const total = paid + rem;
    return { totalAmount: total, totalPaid: paid, remaining: rem };
  }, [settlementTracking]);

  const repaymentPercent =
    totalAmount > 0
      ? Math.min(100, Math.round((totalPaid / totalAmount) * 100))
      : 0;

  const periodLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const period of payPeriods ?? []) {
      const label = `${dayjs(period.startDate).format('MMM DD, YYYY')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`;
      map.set(period.id, label);
    }
    return map;
  }, [payPeriods]);

  const columns: ColumnsType<any> = [
    {
      title: 'Date',
      key: 'date',
      width: 120,
      render: (_: unknown, record: any) =>
        record?.createdAt ? dayjs(record.createdAt).format('MMM DD,YYYY') : '—',
    },
    {
      title: 'Pay Amount',
      key: 'amount',
      width: 120,
      // align: 'right',
      render: (_: unknown, record: any) =>
        formatMoney(Number(record?.amount) || 0),
    },
    {
      title: 'Pay Period',
      key: 'payPeriod',
      width: 280,
      render: (_: unknown, record: any) => {
        const id = record?.payPeriodId;
        const text = id ? periodLabelById.get(id) : undefined;
        return text ? (
          <Tag
            bordered
            className="m-0 rounded px-2 py-0.5 text-[13px] font-normal text-[#434343] border-[#D9D9D9] bg-[#FAFAFA]"
            data-cy="compensation-benefit-tracker-pay-period-tag"
          >
            {text}
          </Tag>
        ) : (
          '—'
        );
      },
    },
    {
      title: 'Reason',
      key: 'reason',
      ellipsis: true,
      render: (_: unknown, record: any) => record?.reason?.trim() || '',
    },
  ];

  const benefitTitle =
    employeeEntitlementData?.compensationItem?.name ?? 'Benefit';
  const isRepayable = employeeEntitlementData?.compensationItem?.mode === 'DEBIT';

  const trackingOpen = employeeBenefitData != null;

  return (
    <Modal
      title={
        <span
          className="text-lg font-semibold text-[#262626] pr-6 scrollbar-hide"
          id="compensation-benefit-tracker-title"
          data-cy="compensation-benefit-tracker-title"
        >
          {benefitTitle}
        </span>
      }
      open={trackingOpen}
      onCancel={handleClose}
      footer={null}
      width={920}
      centered
      destroyOnClose
      maskClosable
      zIndex={BENEFIT_TRACKING_MODAL_Z_INDEX}
      rootClassName="compensation-benefit-tracking-modal"
      classNames={{ body: 'hide-scrollbar' }}
      data-cy="compensation-benefit-tracking-modal"
      styles={{
        body: {
          maxHeight: 'min(72vh, calc(100vh - 200px))',
          overflowY: 'auto',
          paddingTop: 8,
        },
      }}
    >
      <Spin spinning={isLoading}>
        <div
          id="compensation-benefit-tracker-card"
          data-cy="compensation-benefit-tracker-card"
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
            id="compensation-benefit-tracker-summary-cards"
            data-cy="compensation-benefit-tracker-summary-cards"
          >
            {(
              [
                { label: 'Total Amount', value: totalAmount },
                { label: 'Total Paid', value: totalPaid },
                { label: 'Remaining', value: remaining },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border-2 border-[#D9D9D9] px-4 py-3 bg-white"
                data-cy={`compensation-benefit-tracker-stat-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="text-xs text-[#8C8C8C] mb-1">{stat.label}</div>
                <div className="text-xl font-semibold text-[#262626] tabular-nums">
                  {formatMoney(stat.value)}
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg border border-[#F0F0F0] px-4 py-3 mb-6"
            id="compensation-benefit-tracker-progress"
            data-cy="compensation-benefit-tracker-progress"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#262626]">
                {isRepayable ? 'Repayment Progress' : 'Payment Status'}
              </span>
              <span
                className="text-sm font-medium rounded-md text-[#52C41A]"
                data-cy="compensation-benefit-tracker-progress-percent"
              >
                {repaymentPercent}%
              </span>
            </div>
            <Progress
              percent={repaymentPercent}
              showInfo={false}
              strokeColor="#52C41A"
              trailColor="#F0F0F0"
              strokeLinecap="round"
              className="mb-0 [&_.ant-progress-bg]:h-2 [&_.ant-progress-bg]:rounded-full [&_.ant-progress-inner]:rounded-full"
            />
          </div>

          <h3
            className="text-sm font-medium text-[#262626] mb-3 m-0"
            id="compensation-benefit-tracker-paid-back-header"
            data-cy="compensation-benefit-tracker-paid-back-header"
          >
            {isRepayable ? 'Repaid Amount' : 'Payment History'}
          </h3>

          <div
            className="overflow-hidden [&_.ant-table-wrapper]:!shadow-none [&_.ant-table]:!shadow-none [&_.ant-table-content]:[-ms-overflow-style:none] [&_.ant-table-content]:[scrollbar-width:none] [&_.ant-table-content::-webkit-scrollbar]:hidden"
            id="compensation-benefit-tracker-table-scroll"
            data-cy="compensation-benefit-tracker-table-scroll"
          >
            <Table<any>
              data-cy="compensation-benefit-tracker-list-table"
              // className="benefit-tracking-paid-table [&_.ant-table]:text-sm [&_.ant-table]:border [&_.ant-table]:border-[#F0F0F0] [&_.ant-table]:rounded-md [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-[#262626] [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:px-3 [&_.ant-table-thead>tr>th]:py-3 [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table-tbody>tr>td]:px-3 [&_.ant-table-tbody>tr>td]:py-[10px] [&_.ant-table-tbody>tr>td]:text-[#434343] [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-[#F0F0F0] [&_.ant-table-tbody>tr:last-child>td]:border-b-0 [&_.ant-table-tbody>tr.benefit-row-even>td]:bg-[#FFFFFF] [&_.ant-table-tbody>tr.benefit-row-odd>td]:bg-[#FAFAFA]"
              columns={columns}
              dataSource={paginatedTracking}
              rowKey={(record, index) =>
                record?.id ??
                `${record?.createdAt ?? ''}-${record?.payPeriodId ?? index}`
              }
              rowHoverable={false}
              rowClassName={(_, index) =>
                index % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAFAFA]'
              }
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              id="compensation-benefit-tracker-list-table"
            />
          </div>

          <div
            className="mt-6"
            id="compensation-benefit-tracker-pagination-wrapper"
            data-cy="compensation-benefit-tracker-pagination-wrapper"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                data-cy="compensation-benefit-tracker-mobile-pagination"
                totalResults={settlementTracking.length}
                pageSize={detailPageSize}
                currentPage={detailCurrentPage}
                onChange={(page) => setDetailCurrentPage(page)}
                onShowSizeChange={(page) => setDetailCurrentPage(page)}
              />
            ) : (
              <CustomPagination
                data-cy="compensation-benefit-tracker-pagination"
                current={detailCurrentPage}
                total={settlementTracking.length}
                pageSize={detailPageSize}
                onChange={(page) => setDetailCurrentPage(page)}
                onShowSizeChange={(pageSize) => {
                  setDetailPageSize(pageSize);
                  setDetailCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default BenefitTracking;
