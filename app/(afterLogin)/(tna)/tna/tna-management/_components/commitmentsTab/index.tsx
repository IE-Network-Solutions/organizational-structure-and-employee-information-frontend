'use client';
import React, { FC, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
} from 'antd';
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
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  TrainingCommitment,
  TrainingCommitmentStatus,
  TrainingCommitmentStatusBadgeTheme,
  TrainingCommitmentStatusLabel,
  trainingCommitmentStatusOptions,
} from '@/types/tna/externalTna';
import { TrainingCommitmentRequestBody } from '@/store/server/features/tna/externalTraining/interface';
import { useGetTrainingCommitments } from '@/store/server/features/tna/trainingCommitment/queries';
import {
  useCompleteTrainingCommitment,
  useRefreshTrainingCommitmentStatuses,
} from '@/store/server/features/tna/trainingCommitment/mutation';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

/** Organisation-wide commitment register with live progress. */
const CommitmentsTab: FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<TrainingCommitmentStatus[]>([]);

  const { mutate: completeCommitment, isLoading: isCompleting } =
    useCompleteTrainingCommitment();
  const { mutate: refreshStatuses, isLoading: isRefreshing } =
    useRefreshTrainingCommitmentStatuses();

  const filterBody: Partial<TrainingCommitmentRequestBody> = useMemo(() => {
    const body: Partial<TrainingCommitmentRequestBody> = {};
    if (statuses.length) body.filter = { status: statuses };
    if (search.trim()) body.modifiers = { search: search.trim() };
    return body;
  }, [statuses, search]);

  const { data, isLoading } = useGetTrainingCommitments(
    { page, limit },
    filterBody,
  );

  const onSearchChange = useDebounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const columns: TableColumnsType<TrainingCommitment> = [
    {
      title: 'Training',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string) => (
        <span
          data-cy="tna-admin-commitments-course-name"
          className="text-sm font-bold text-black"
        >
          {value || 'External training'}
        </span>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'End',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'Remaining',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      render: (value: number, record: TrainingCommitment) =>
        record.status === TrainingCommitmentStatus.COMPLETED
          ? 'Completed'
          : `${value ?? 0} day(s)`,
    },
    {
      title: 'Progress',
      dataIndex: 'progressPercentage',
      key: 'progressPercentage',
      render: (value: number, record: TrainingCommitment) => (
        <Progress
          percent={value ?? 0}
          size="small"
          className="!mb-0 min-w-[120px]"
          strokeColor={
            record.status === TrainingCommitmentStatus.COMPLETED
              ? '#52C41A'
              : '#1E40AF'
          }
          data-cy={`tna-admin-commitment-progress-${record.id}`}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: TrainingCommitmentStatus) => (
        <StatusBadge theme={TrainingCommitmentStatusBadgeTheme[value]}>
          {TrainingCommitmentStatusLabel[value] ?? value}
        </StatusBadge>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: TrainingCommitment) => {
        void unusedValue;
        return (
          <Space data-cy={`tna-admin-commitment-actions-${record.id}`}>
            {record.status === TrainingCommitmentStatus.ACTIVE ? (
              <AccessGuard permissions={[Permissions.ApproveTnaAsOfficer]}>
                <Popconfirm
                  title="Complete this commitment?"
                  onConfirm={() => completeCommitment({ id: record.id })}
                  okText="Complete"
                  cancelText="Cancel"
                >
                  <Button
                    size="small"
                    type="link"
                    className="!px-0 !text-[#1E40AF]"
                    loading={isCompleting}
                    data-cy={`tna-admin-commitment-complete-${record.id}`}
                  >
                    Complete
                  </Button>
                </Popconfirm>
              </AccessGuard>
            ) : null}
            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(
                  `/tna/management/external/${record.externalTrainingRequestId}`,
                )
              }
              data-cy={`tna-admin-commitment-open-${record.id}`}
            >
              Open
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="tna-admin-commitments-tab">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-cy="tna-admin-commitments-filters"
      >
        <Input
          allowClear
          prefix={<SearchOutlined className="text-black/45" />}
          placeholder="Search training"
          className="h-10 w-full rounded-[6px] md:max-w-[320px]"
          onChange={(e) => onSearchChange(e.target.value)}
          data-cy="tna-admin-commitments-search"
        />
        <Space wrap data-cy="tna-admin-commitments-filter-controls">
          <Select
            mode="multiple"
            allowClear
            placeholder="Status"
            className="min-w-[220px]"
            options={trainingCommitmentStatusOptions}
            value={statuses}
            onChange={(value) => {
              setStatuses(value);
              setPage(1);
            }}
            data-cy="tna-admin-commitments-status-filter"
          />
          <AccessGuard permissions={[Permissions.ApproveTnaAsOfficer]}>
            <Button
              className="h-10 rounded-md border-[#D9D9D9] px-4"
              loading={isRefreshing}
              onClick={() => refreshStatuses()}
              data-cy="tna-admin-commitments-refresh"
            >
              Reconcile elapsed
            </Button>
          </AccessGuard>
        </Space>
      </div>

      {isLoading ? (
        <TableSkeleton
          columns={columns}
          data-cy="tna-admin-commitments-skeleton"
        />
      ) : !data?.items?.length ? (
        <EmptyState
          compact
          title="No commitments found"
          description="Commitments appear once the TNA Officer approves a paid external training."
          data-cy="tna-admin-commitments-empty"
        />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data.items}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-admin-commitments-table"
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
            data-cy="tna-admin-commitments-pagination"
          />
        </>
      )}
    </div>
  );
};

export default CommitmentsTab;
