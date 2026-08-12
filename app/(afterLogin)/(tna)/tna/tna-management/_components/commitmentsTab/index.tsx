'use client';
import React, { FC, useMemo, useState } from 'react';
import { Button, Progress, Select, Table } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { StatusBadgeTheme } from '@/components/common/statusBadge';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  UserTrainingCommitment,
  getCommitmentProgress,
} from '@/types/tna/externalTna';
import { UserTrainingCommitmentBody } from '@/store/server/features/tna/externalTraining/interface';
import { useGetUserTrainingCommitments } from '@/store/server/features/tna/trainingCommitment/queries';
import { useRecalculateCommitments } from '@/store/server/features/tna/trainingCommitment/mutation';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

/** Organisation-wide commitment register, driven by the cron-maintained counters. */
const CommitmentsTab: FC = () => {
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const { mutate: recalculate, isLoading: isRecalculating } =
    useRecalculateCommitments();

  const filterBody: Partial<UserTrainingCommitmentBody> = useMemo(() => {
    if (!status) return {};
    return { filter: { completedCommitment: status === 'completed' } };
  }, [status]);

  const { data, isLoading } = useGetUserTrainingCommitments(
    { page, limit },
    filterBody,
  );

  const columns: TableColumnsType<UserTrainingCommitment> = [
    {
      title: 'Training',
      dataIndex: ['trainingRequest', 'courseName'],
      key: 'courseName',
      render: (unusedValue: unknown, record: UserTrainingCommitment) => {
        void unusedValue;
        return (
          <span
            data-cy="tna-admin-commitments-course-name"
            className="text-sm font-bold text-black"
          >
            {record.trainingRequest?.courseName || 'External training'}
          </span>
        );
      },
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
      title: 'Days left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      render: (value: number, record: UserTrainingCommitment) =>
        record.completedCommitment ? 'Served' : `${value ?? 0} day(s)`,
    },
    {
      title: 'Amount left',
      dataIndex: 'amountLeft',
      key: 'amountLeft',
      render: (value: number) =>
        Number(value ?? 0).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        }),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (unusedValue: unknown, record: UserTrainingCommitment) => {
        void unusedValue;
        return (
          <Progress
            percent={getCommitmentProgress(record)}
            size="small"
            className="!mb-0 min-w-[120px]"
            strokeColor={record.completedCommitment ? '#52C41A' : '#1E40AF'}
            data-cy={`tna-admin-commitment-progress-${record.id}`}
          />
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'completedCommitment',
      key: 'completedCommitment',
      render: (value: boolean) => (
        <StatusBadge
          theme={value ? StatusBadgeTheme.success : StatusBadgeTheme.warning}
        >
          {value ? 'Completed' : 'Active'}
        </StatusBadge>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: UserTrainingCommitment) => {
        void unusedValue;
        return (
          <Button
            size="small"
            type="link"
            className="!px-0 !text-[#1E40AF]"
            onClick={() =>
              router.push(
                `/tna/management/external/${record.trainingRequestId}`,
              )
            }
            data-cy={`tna-admin-commitment-open-${record.id}`}
          >
            Open
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="tna-admin-commitments-tab">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end"
        data-cy="tna-admin-commitments-filters"
      >
        {/* Controls go full width and stack on mobile; inline from md up. */}
        <div
          className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center"
          data-cy="tna-admin-commitments-filter-controls"
        >
          <Select
            allowClear
            placeholder="Status"
            className="w-full md:w-auto md:min-w-[180px]"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            data-cy="tna-admin-commitments-status-filter"
          />
          <AccessGuard permissions={[Permissions.ConfirmTnaCommitment]}>
            <Button
              className="h-10 w-full rounded-md border-[#D9D9D9] px-4 md:w-auto"
              loading={isRecalculating}
              onClick={() => recalculate()}
              data-cy="tna-admin-commitments-recalculate"
            >
              Recalculate now
            </Button>
          </AccessGuard>
        </div>
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
          description="Commitments appear once a paid, closed-out request is confirmed."
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
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={data?.meta?.totalItems ?? 0}
              pageSize={limit}
              currentPage={page}
              onChange={(nextPage, nextSize) => {
                setPage(nextPage);
                if (nextSize) setLimit(nextSize);
              }}
              onShowSizeChange={(unusedCurrent, size) => {
                void unusedCurrent;
                setLimit(size);
                setPage(1);
              }}
              data-cy="tna-admin-commitments-mobile-pagination"
            />
          ) : (
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
          )}
        </>
      )}
    </div>
  );
};

export default CommitmentsTab;
