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
  TrainingRequest,
  TrainingRequestApprovalStatus,
  TrainingRequestStageBadgeTheme,
  TrainingRequestStageLabel,
  getTrainingRequestStage,
  trainingRequestApprovalStatusOptions,
} from '@/types/tna/externalTna';
import { TrainingRequestBody } from '@/store/server/features/tna/externalTraining/interface';
import { useGetTrainingRequests } from '@/store/server/features/tna/externalTraining/queries';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import TrainingApprovalActions from '@/app/(afterLogin)/(tna)/tna/_components/trainingApprovalActions';

/**
 * Every training request in the organisation, with search, status and date
 * filters. Approvers can act on a row directly; the detail page carries the
 * same actions alongside the full context.
 */
const RequestsTab: FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<TrainingRequestApprovalStatus[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(
    {},
  );

  const { data: currencies } = useCurrency();

  const filterBody: Partial<TrainingRequestBody> = useMemo(() => {
    const body: Partial<TrainingRequestBody> = {};
    const filter: TrainingRequestBody['filter'] = {};

    if (statuses.length) filter.approvalStatus = statuses;
    if (dateRange.from || dateRange.to) filter.createdAt = dateRange;
    if (Object.keys(filter).length) body.filter = filter;
    if (search.trim()) body.modifiers = { search: search.trim() };

    return body;
  }, [statuses, dateRange, search]);

  const { data, isLoading } = useGetTrainingRequests(
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

  const columns: TableColumnsType<TrainingRequest> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string, record: TrainingRequest) => (
        <div data-cy="tna-admin-requests-course-cell" className="flex flex-col">
          <span
            data-cy="tna-admin-requests-course-name"
            className="text-sm font-bold text-black"
          >
            {value || 'Untitled training'}
          </span>
          <span
            data-cy="tna-admin-requests-course-provider"
            className="text-xs text-black/45"
          >
            {record.source || 'External training'}
          </span>
        </div>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number, record: TrainingRequest) => (
        <span data-cy={`tna-admin-requests-amount-${record.id}`}>
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
      title: 'Stage',
      key: 'stage',
      render: (unusedValue: unknown, record: TrainingRequest) => {
        void unusedValue;
        const stage = getTrainingRequestStage(record);
        return (
          <StatusBadge theme={TrainingRequestStageBadgeTheme[stage]}>
            {TrainingRequestStageLabel[stage]}
          </StatusBadge>
        );
      },
    },
    {
      title: 'Payment',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (value: boolean) => (
        <span
          data-cy="tna-admin-requests-payment-state"
          className={value ? 'text-[#389E0D]' : 'text-[#AD8B00]'}
        >
          {value ? 'Paid' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Commitment',
      dataIndex: 'commitment',
      key: 'commitment',
      render: (unusedValue: unknown, record: TrainingRequest) => {
        void unusedValue;
        const commitment = record.commitment;
        if (!commitment) {
          return (
            <span
              data-cy="tna-admin-requests-commitment-empty"
              className="text-black/45"
            >
              -
            </span>
          );
        }
        return (
          <span data-cy={`tna-admin-requests-commitment-${record.id}`}>
            {commitment.completedCommitment
              ? 'Served'
              : `${commitment.daysLeft ?? 0} day(s) left`}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: TrainingRequest) => {
        void unusedValue;
        return (
          <Space data-cy={`tna-admin-requests-actions-${record.id}`}>
            {/* Only renders while this user is the workflow's current step. */}
            <TrainingApprovalActions requestId={record.id} />
            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(`/tna/management/external/${record.id}`)
              }
              data-cy={`tna-admin-requests-open-${record.id}`}
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
          placeholder="Search course, provider or description"
          className="h-10 w-full rounded-[6px] md:max-w-[340px]"
          onChange={(e) => onSearchChange(e.target.value)}
          data-cy="tna-admin-requests-search"
        />
        <Space wrap data-cy="tna-admin-requests-filter-controls">
          <Select
            mode="multiple"
            allowClear
            placeholder="Approval status"
            className="min-w-[220px]"
            options={trainingRequestApprovalStatusOptions}
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
          title="No training requests found"
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
    </div>
  );
};

export default RequestsTab;
