'use client';
import React, { FC, useState } from 'react';
import { Button, Popconfirm, Space, Table, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { LuExternalLink } from 'react-icons/lu';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TrainingRequest } from '@/types/tna/externalTna';
import { useGetTrainingRequests } from '@/store/server/features/tna/externalTraining/queries';
import { useConfirmTrainingRequest } from '@/store/server/features/tna/externalTraining/mutation';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

/**
 * Requests that have cleared every pre-condition and are waiting only on a
 * CONFIRM_TNA_COMMITMENT holder to start the commitment.
 */
const ConfirmationTab: FC = () => {
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { mutate: confirmRequest, isLoading: isConfirming } =
    useConfirmTrainingRequest();

  const { data, isLoading } = useGetTrainingRequests(
    { page, limit },
    { filter: { awaitingConfirmation: true } },
  );

  // Strict check, no owner short-circuit — the backend guards confirm on the
  // real permission list, so an owner without the slug would get a 403.
  const canConfirm = AccessGuard.hasExplicitPermission(
    Permissions.ConfirmTnaCommitment,
  );

  const columns: TableColumnsType<TrainingRequest> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string, record: TrainingRequest) => (
        <div data-cy="tna-admin-confirm-course-cell" className="flex flex-col">
          <span
            data-cy="tna-admin-confirm-course-name"
            className="text-sm font-bold text-black"
          >
            {value || 'Untitled training'}
          </span>
          <span
            data-cy="tna-admin-confirm-course-provider"
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
      render: (value: number) => Number(value ?? 0).toLocaleString(),
    },
    {
      title: 'Outcome',
      key: 'outcome',
      render: (unusedValue: unknown, record: TrainingRequest) => {
        void unusedValue;
        const url = record.certificatePath ?? record.failureFilePath;
        const label = record.hasFailed ? 'Failure proof' : 'Certificate';
        return url ? (
          <Tooltip title={`Open ${label.toLowerCase()}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                record.hasFailed
                  ? 'inline-flex items-center gap-1 text-[#CF1322]'
                  : 'inline-flex items-center gap-1 text-[#389E0D]'
              }
              data-cy={`tna-admin-confirm-proof-${record.id}`}
            >
              {label} <LuExternalLink size={12} />
            </a>
          </Tooltip>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Ended',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: TrainingRequest) => {
        void unusedValue;
        return (
          <Space data-cy={`tna-admin-confirm-actions-${record.id}`}>
            {canConfirm ? (
              <Popconfirm
                title="Confirm this request?"
                description="This starts the employee's commitment period."
                okText="Confirm"
                cancelText="Cancel"
                onConfirm={() => confirmRequest(record.id)}
              >
                <Button
                  type="primary"
                  size="small"
                  className="rounded-md !border-[#1E40AF] !bg-[#1E40AF] !text-white"
                  loading={isConfirming}
                  data-cy={`tna-admin-confirm-button-${record.id}`}
                >
                  Confirm
                </Button>
              </Popconfirm>
            ) : null}
            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(`/tna/management/external/${record.id}`)
              }
              data-cy={`tna-admin-confirm-open-${record.id}`}
            >
              Open
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="tna-admin-confirmation-tab">
      <p
        className="m-0 text-sm leading-[22px] text-black/45"
        data-cy="tna-admin-confirmation-hint"
      >
        Approved requests that are paid for and closed out with a certificate or
        failure proof. Confirming starts the employee&apos;s commitment.
      </p>

      {isLoading ? (
        <TableSkeleton columns={columns} data-cy="tna-admin-confirm-skeleton" />
      ) : !data?.items?.length ? (
        <EmptyState
          compact
          title="Nothing awaiting confirmation"
          description="Requests appear here once they are approved, paid and closed out with proof."
          data-cy="tna-admin-confirm-empty"
        />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data.items}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-admin-confirm-table"
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
              data-cy="tna-admin-confirm-mobile-pagination"
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
              data-cy="tna-admin-confirm-pagination"
            />
          )}
        </>
      )}
    </div>
  );
};

export default ConfirmationTab;
