'use client';
import React, { FC, useState } from 'react';
import { Button, Input, Popconfirm, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetTrainingRequestsForApprover } from '@/store/server/features/tna/trainingApproval/queries';
import {
  useSetAllTrainingRequestFinalStatuses,
  useSetAllTrainingRequestsApproved,
  useSetAllTrainingRequestsRejected,
  useSetTrainingRequestApprovalLog,
  useSetTrainingRequestFinalStatus,
} from '@/store/server/features/tna/trainingApproval/mutation';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

/**
 * The current user's TNA approval inbox. Decisions go to the shared approver
 * service (`/approver/approvalLog`); only when it reports the step was the last
 * one do we push the final status back to the training service — the same
 * handshake time-and-attendance uses for leave.
 */
const TrainingApprovalTable: FC = () => {
  const router = useRouter();
  const { userId, userData, tenantId } = useAuthenticationStore();
  const approverRoleId = userData?.roleId;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rejectComment, setRejectComment] = useState('');

  const { data, isLoading } = useGetTrainingRequestsForApprover(
    userId ?? '',
    page,
    limit,
  );

  const { mutate: logDecision, isLoading: isLogging } =
    useSetTrainingRequestApprovalLog();
  const { mutate: setFinalStatus } = useSetTrainingRequestFinalStatus();
  const { mutate: approveAll, isLoading: isApprovingAll } =
    useSetAllTrainingRequestsApproved();
  const { mutate: rejectAll, isLoading: isRejectingAll } =
    useSetAllTrainingRequestsRejected();
  const { mutate: setAllFinalStatuses } =
    useSetAllTrainingRequestFinalStatuses();

  const items = data?.items ?? [];

  const buildLogPayload = (record: any, action: 'Approved' | 'Rejected') => ({
    approvalWorkflowId: record?.approvalWorkflowId,
    stepOrder: record?.stepOrder,
    requestId: record?.id,
    approvedUserId: userId ?? '',
    approverRoleId,
    action,
    tenantId: tenantId ?? '',
  });

  const onApprove = (record: any) => {
    logDecision(buildLogPayload(record, 'Approved'), {
      onSuccess: (response: any) => {
        // Only the last step settles the request; earlier steps just advance it.
        if (response?.last === true) {
          setFinalStatus({ requestId: record?.id, status: 'approved' });
        }
      },
    });
  };

  const onReject = (record: any) => {
    const comment = rejectComment.trim();

    logDecision(
      {
        ...buildLogPayload(record, 'Rejected'),
        ...(comment
          ? {
              comment: {
                comment,
                commentedBy: userId ?? '',
                tenantId: tenantId ?? '',
              },
            }
          : {}),
      },
      {
        onSuccess: () => {
          setRejectComment('');
          // A rejection ends the workflow wherever it happens.
          setFinalStatus({ requestId: record?.id, status: 'declined' });
        },
      },
    );
  };

  const onApproveAll = () => {
    approveAll(
      { userId: userId ?? '', roleId: approverRoleId, page, limit },
      {
        onSuccess: (response: any) => {
          const finalised = (response?.items ?? response ?? [])
            .filter((item: any) => item?.last === true || item?.isLast === true)
            .map((item: any) => ({
              requestId: item?.id ?? item?.requestId,
              status: 'approved' as const,
            }));

          if (finalised.length) {
            setAllFinalStatuses(finalised);
          }
        },
      },
    );
  };

  const onRejectAll = () => {
    rejectAll(
      { userId: userId ?? '', roleId: approverRoleId, page, limit },
      {
        onSuccess: (response: any) => {
          const finalised = (response?.items ?? response ?? []).map(
            (item: any) => ({
              requestId: item?.id ?? item?.requestId,
              status: 'declined' as const,
            }),
          );

          if (finalised.length) {
            setAllFinalStatuses(finalised);
          }
        },
      },
    );
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string, record: any) => (
        <div data-cy="tna-approval-table-course-cell" className="flex flex-col">
          <span
            data-cy="tna-approval-table-course-name"
            className="text-sm font-bold text-black"
          >
            {value || 'Untitled training'}
          </span>
          <span
            data-cy="tna-approval-table-course-provider"
            className="text-xs text-black/45"
          >
            {record?.source || 'External training'}
          </span>
        </div>
      ),
    },
    {
      title: 'Requested by',
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
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: any) => {
        void unusedValue;
        return (
          <Space data-cy={`tna-approval-table-actions-${record?.id}`}>
            <Popconfirm
              title="Approve this training request?"
              okText="Approve"
              cancelText="Cancel"
              onConfirm={() => onApprove(record)}
            >
              <Button
                type="primary"
                size="small"
                className="rounded-md border-[#1E40AF] bg-[#1E40AF]"
                loading={isLogging}
                data-cy={`tna-approval-table-approve-${record?.id}`}
              >
                Approve
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Reject this training request?"
              okText="Reject"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={() => onReject(record)}
              description={
                <Input.TextArea
                  rows={2}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Reason (optional)"
                  className="mt-1 w-[220px]"
                  data-cy={`tna-approval-table-reject-comment-${record?.id}`}
                />
              }
            >
              <Button
                danger
                size="small"
                className="rounded-md"
                loading={isLogging}
                data-cy={`tna-approval-table-reject-${record?.id}`}
              >
                Reject
              </Button>
            </Popconfirm>

            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(`/tna/management/external/${record?.id}`)
              }
              data-cy={`tna-approval-table-open-${record?.id}`}
            >
              Open
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="tna-approval-table-wrap">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-cy="tna-approval-table-header"
      >
        <p
          className="m-0 text-sm leading-[22px] text-black/45"
          data-cy="tna-approval-table-hint"
        >
          Training requests waiting on your approval.
        </p>
        {items.length ? (
          <Space data-cy="tna-approval-table-bulk-actions">
            <Popconfirm
              title="Approve every pending request?"
              okText="Approve all"
              cancelText="Cancel"
              onConfirm={onApproveAll}
            >
              <Button
                type="primary"
                className="h-10 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4"
                loading={isApprovingAll}
                data-cy="tna-approval-table-approve-all"
              >
                Approve all
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject every pending request?"
              okText="Reject all"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={onRejectAll}
            >
              <Button
                danger
                className="h-10 rounded-md px-4"
                loading={isRejectingAll}
                data-cy="tna-approval-table-reject-all"
              >
                Reject all
              </Button>
            </Popconfirm>
          </Space>
        ) : null}
      </div>

      {isLoading ? (
        <TableSkeleton
          columns={columns}
          data-cy="tna-approval-table-skeleton"
        />
      ) : !items.length ? (
        <EmptyState
          compact
          title="Nothing awaiting your approval"
          description="Training requests routed to you will appear here."
          data-cy="tna-approval-table-empty"
        />
      ) : (
        <>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-approval-table"
          />
          <CustomPagination
            current={page}
            total={data?.meta?.totalItems ?? items.length}
            pageSize={limit}
            onChange={(nextPage, nextSize) => {
              setPage(nextPage);
              if (nextSize) setLimit(nextSize);
            }}
            onShowSizeChange={(size) => {
              setLimit(size);
              setPage(1);
            }}
            data-cy="tna-approval-table-pagination"
          />
        </>
      )}
    </div>
  );
};

export default TrainingApprovalTable;
