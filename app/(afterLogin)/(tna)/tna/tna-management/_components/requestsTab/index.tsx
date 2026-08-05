'use client';
import React, { FC, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Select, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import { useDebounce } from '@/utils/useDebounce';
import {
  ExternalTrainingRequest,
  ExternalTrainingStatus,
  ExternalTrainingStatusBadgeTheme,
  ExternalTrainingStatusLabel,
  externalTrainingStatusOptions,
} from '@/types/tna/externalTna';
import { ExternalTrainingRequestBody } from '@/store/server/features/tna/externalTraining/interface';
import { useGetExternalTrainings } from '@/store/server/features/tna/externalTraining/queries';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import ManagerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/managerDecisionModal';
import TnaOfficerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/tnaOfficerDecisionModal';

/**
 * Every external TNA request in the organisation, with search, status and date
 * filters plus the review actions the current user is allowed to take.
 */
const RequestsTab: FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<ExternalTrainingStatus[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(
    {},
  );
  const [activeRequest, setActiveRequest] =
    useState<ExternalTrainingRequest | null>(null);
  const [openModal, setOpenModal] = useState<'manager' | 'officer' | null>(
    null,
  );

  const { data: currencies } = useCurrency();

  const filterBody: Partial<ExternalTrainingRequestBody> = useMemo(() => {
    const body: Partial<ExternalTrainingRequestBody> = {};
    const filter: ExternalTrainingRequestBody['filter'] = {};

    if (statuses.length) filter.status = statuses;
    if (dateRange.from || dateRange.to) filter.createdAt = dateRange;
    if (Object.keys(filter).length) body.filter = filter;
    if (search.trim()) body.modifiers = { search: search.trim() };

    return body;
  }, [statuses, dateRange, search]);

  const { data, isLoading } = useGetExternalTrainings(
    { page, limit },
    filterBody,
  );

  const onSearchChange = useDebounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const currencyCode = (currencyId?: string | null) => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return (
      list.find((currency: any) => currency?.id === currencyId)?.code ?? ''
    );
  };

  const columns: TableColumnsType<ExternalTrainingRequest> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (unusedValue: string, record: ExternalTrainingRequest) => {
        void unusedValue;
        return (
          <div
            className="flex flex-col"
            data-cy={`tna-admin-request-course-${record.id}`}
          >
            <span
              data-cy="tna-admin-requests-course-name"
              className="text-sm font-bold text-black"
            >
              {record.courseName}
            </span>
            <span
              data-cy="tna-admin-requests-course-provider"
              className="text-xs text-black/45"
            >
              {record.trainingProvider || 'External training'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Employee',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number, record: ExternalTrainingRequest) => (
        <span data-cy={`tna-admin-request-cost-${record.id}`}>
          {Number(value ?? 0).toLocaleString()}{' '}
          {currencyCode(record.currencyId)}
        </span>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: ExternalTrainingStatus) => (
        <StatusBadge theme={ExternalTrainingStatusBadgeTheme[value]}>
          {ExternalTrainingStatusLabel[value] ?? value}
        </StatusBadge>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'isPaymentConfirmed',
      key: 'isPaymentConfirmed',
      render: (value: boolean) => (
        <span
          data-cy="tna-admin-requests-payment-state"
          className={value ? 'text-[#389E0D]' : 'text-[#AD8B00]'}
        >
          {value ? 'Confirmed' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Commitment',
      dataIndex: 'commitment',
      key: 'commitment',
      render: (unusedValue: unknown, record: ExternalTrainingRequest) => {
        void unusedValue;
        const commitment = record.commitment;
        if (!commitment)
          return (
            <span
              data-cy="tna-admin-requests-commitment-empty"
              className="text-black/45"
            >
              -
            </span>
          );
        return (
          <span data-cy={`tna-admin-request-commitment-${record.id}`}>
            {commitment.progressPercentage ?? 0}% ·{' '}
            {commitment.daysRemaining ?? 0} day(s) left
          </span>
        );
      },
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: ExternalTrainingRequest) => {
        void unusedValue;
        return (
          <Space data-cy={`tna-admin-request-actions-${record.id}`}>
            {record.status === ExternalTrainingStatus.PENDING_MANAGER ? (
              <Button
                size="small"
                type="link"
                className="!px-0 !text-[#1E40AF]"
                onClick={() => {
                  setActiveRequest(record);
                  setOpenModal('manager');
                }}
                data-cy={`tna-admin-request-manager-review-${record.id}`}
              >
                Manager review
              </Button>
            ) : null}
            {record.status === ExternalTrainingStatus.PENDING_TNA_OFFICER ? (
              <Button
                size="small"
                type="link"
                className="!px-0 !text-[#1E40AF]"
                onClick={() => {
                  setActiveRequest(record);
                  setOpenModal('officer');
                }}
                data-cy={`tna-admin-request-officer-review-${record.id}`}
              >
                Officer review
              </Button>
            ) : null}
            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(`/tna/management/external/${record.id}`)
              }
              data-cy={`tna-admin-request-open-${record.id}`}
            >
              Open
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="tna-admin-requests-tab">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-cy="tna-admin-requests-filters"
      >
        <Input
          allowClear
          prefix={<SearchOutlined className="text-black/45" />}
          placeholder="Search course or provider"
          className="h-10 w-full rounded-[6px] md:max-w-[320px]"
          onChange={(e) => onSearchChange(e.target.value)}
          data-cy="tna-admin-requests-search"
        />
        <Space wrap data-cy="tna-admin-requests-filter-controls">
          <Select
            mode="multiple"
            allowClear
            placeholder="Status"
            className="min-w-[220px]"
            options={externalTrainingStatusOptions}
            value={statuses}
            onChange={(value) => {
              setStatuses(value);
              setPage(1);
            }}
            data-cy="tna-admin-requests-status-filter"
          />
          <DatePicker.RangePicker
            format={DATE_FORMAT}
            className="h-10"
            onChange={(value) => {
              if (value && value[0] && value[1]) {
                setDateRange({
                  from: value[0].startOf('day').toISOString(),
                  to: value[1].endOf('day').toISOString(),
                });
              } else {
                setDateRange({});
              }
              setPage(1);
            }}
            data-cy="tna-admin-requests-date-filter"
          />
        </Space>
      </div>

      {isLoading ? (
        <TableSkeleton
          columns={columns}
          data-cy="tna-admin-requests-skeleton"
        />
      ) : !data?.items?.length ? (
        <EmptyState
          compact
          title="No TNA requests found"
          description="Adjust the filters, or wait for employees to submit requests."
          data-cy="tna-admin-requests-empty"
        />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data.items}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-admin-requests-table"
          />
          <CustomPagination
            current={page}
            total={data?.meta?.totalItems ?? 0}
            pageSize={limit}
            onChange={(nextPage, nextSize) => {
              setPage(nextPage);
              if (nextSize) setLimit(nextSize);
            }}
            onShowSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
            data-cy="tna-admin-requests-pagination"
          />
        </>
      )}

      <ManagerDecisionModal
        open={openModal === 'manager'}
        request={activeRequest}
        onClose={() => setOpenModal(null)}
      />
      <TnaOfficerDecisionModal
        open={openModal === 'officer'}
        request={activeRequest}
        onClose={() => setOpenModal(null)}
      />
    </div>
  );
};

export default RequestsTab;
