'use client';
import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Skeleton,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { TableColumnsType } from '@/types/table/table';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetTrainingApprovalsAllStatus } from '@/store/server/features/tna/trainingApproval/queries';
import {
  useSetAllTrainingRequestFinalStatuses,
  useSetAllTrainingRequestsApproved,
  useSetAllTrainingRequestsRejected,
  useSetTrainingRequestApprovalLog,
  useSetTrainingRequestFinalStatus,
} from '@/store/server/features/tna/trainingApproval/mutation';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';

/** Min width for horizontal scroll on narrow viewports (aligned with leave table pattern). */
const APPROVAL_TABLE_SCROLL_X = 960;

const statusFilterOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

/**
 * The current user's training approval inbox. Decisions go to the shared
 * approver service (`/approver/approvalLog`); only when it reports the step was
 * the last one is the final status pushed back to the training service — the
 * same handshake time-and-attendance uses for leave.
 */
const TrainingApprovalTable: FC = () => {
  const { userId, userData, tenantId } = useAuthenticationStore();
  const approverRoleId = userData?.roleId;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEmployee, setSearchEmployee] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [rejectComment, setRejectComment] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data: allUsersData } = useGetAllUsers();
  const userOptions = useMemo(
    () =>
      (allUsersData?.items ?? []).map((user: any) => ({
        label: [user?.firstName, user?.middleName, user?.lastName]
          .filter(Boolean)
          .join(' '),
        value: user?.id ?? '',
      })),
    [allUsersData?.items],
  );

  const {
    data: approvalData,
    isLoading,
    refetch,
  } = useGetTrainingApprovalsAllStatus(
    userId ?? '',
    page,
    pageSize,
    searchEmployee || undefined,
    filterStatus || undefined,
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setSelectedRowKeys([]);
  }, [searchEmployee, filterStatus]);

  // Normalize response: support both { items, meta } and { data: { items, meta } }
  const payload = approvalData?.data ?? approvalData;
  const rawItems = payload?.items ?? approvalData?.items ?? [];
  const meta = payload?.meta ?? approvalData?.meta;
  const totalItems = meta?.totalItems ?? meta?.total ?? rawItems.length;

  /** A row is actionable only while this user is the step the workflow is on. */
  const isPending = (item: any) =>
    item?.nextApprover?.[0]?.userId === userId ||
    (item?.status === 'pending' && !!item?.nextApprover?.length);

  const buildLogPayload = (record: any, action: 'Approved' | 'Rejected') => ({
    approvalWorkflowId: record?.approvalWorkflowId,
    // The approver service reports the current step under `nextApprover`, not at
    // the top level — reading `record.stepOrder` sends undefined and the log is
    // rejected. `stepOrder` is kept as a fallback in case the shape changes.
    stepOrder: record?.nextApprover?.[0]?.stepOrder ?? record?.stepOrder,
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
          setFinalStatus(
            { requestId: record?.id, status: 'approved' },
            { onSuccess: () => refetch() },
          );
        } else {
          refetch();
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
          setFinalStatus(
            { requestId: record?.id, status: 'declined' },
            { onSuccess: () => refetch() },
          );
        },
      },
    );
  };

  const onApproveAll = () => {
    approveAll(
      { userId: userId ?? '', roleId: approverRoleId, page, limit: pageSize },
      {
        onSuccess: (response: any) => {
          const finalised = (response?.items ?? []).map((item: any) => ({
            requestId: item?.requestId ?? item?.id,
            status: 'approved' as const,
          }));

          if (finalised.length) {
            setAllFinalStatuses(finalised, { onSuccess: () => refetch() });
          } else {
            refetch();
          }
          setSelectedRowKeys([]);
        },
      },
    );
  };

  const onRejectAll = () => {
    rejectAll(
      { userId: userId ?? '', roleId: approverRoleId, page, limit: pageSize },
      {
        onSuccess: (response: any) => {
          const finalised = (response?.items ?? []).map((item: any) => ({
            requestId: item?.requestId ?? item?.id,
            status: 'declined' as const,
          }));

          if (finalised.length) {
            setAllFinalStatuses(finalised, { onSuccess: () => refetch() });
          } else {
            refetch();
          }
          setSelectedRowKeys([]);
        },
      },
    );
  };

  const actionsDisabled =
    isLoading || isLogging || isApprovingAll || isRejectingAll;

  const dataSource = useMemo(
    () =>
      rawItems.map((item: any, index: number) => ({
        key: item?.id ?? index,
        id: item?.id,
        courseName: item?.courseName,
        source: item?.source,
        userId: item?.userId,
        amount: item?.amount,
        createdAt: item?.createdAt,
        status: item?.status,
        action: (
          <div
            className="flex gap-4"
            id={`tna-approval-table-row-${index}-actions-container`}
            data-cy={`tna-approval-table-row-${index}-actions-container`}
          >
            {isPending(item) ? (
              <>
                <Popconfirm
                  title="Approve Request"
                  description="Are you sure to approve this training request?"
                  onConfirm={() => onApprove(item)}
                  okText="Approve"
                  cancelText="Cancel"
                  disabled={actionsDisabled}
                  data-cy={`tna-approval-table-row-${index}-approve-popconfirm`}
                >
                  <Button
                    type="primary"
                    id={`tna-approval-table-row-${index}-approve-button`}
                    data-cy={`tna-approval-table-row-${index}-approve-button`}
                  >
                    Approve
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Reject Request"
                  description={
                    <>
                      <p
                        data-cy={`tna-approval-table-row-${index}-reject-text`}
                      >
                        Are you sure you want to reject this training request?
                      </p>
                      <Input
                        placeholder="Add a comment"
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        style={{ marginTop: 8 }}
                        id={`tna-approval-table-row-${index}-reject-comment-input`}
                        data-cy={`tna-approval-table-row-${index}-reject-comment-input`}
                      />
                    </>
                  }
                  onConfirm={() => onReject(item)}
                  okText="Reject"
                  cancelText="Cancel"
                  okButtonProps={{ disabled: !rejectComment }}
                  disabled={actionsDisabled}
                  data-cy={`tna-approval-table-row-${index}-reject-popconfirm`}
                >
                  <Button
                    danger
                    id={`tna-approval-table-row-${index}-reject-button`}
                    data-cy={`tna-approval-table-row-${index}-reject-button`}
                  >
                    Reject
                  </Button>
                </Popconfirm>
              </>
            ) : (
              <Tag
                color={item?.status === 'approved' ? 'success' : 'error'}
                id={`tna-approval-table-row-${index}-status-tag`}
                data-cy={`tna-approval-table-row-${index}-status-tag`}
              >
                {item?.status === 'approved' ? 'Approved' : 'Rejected'}
              </Tag>
            )}
          </div>
        ),
      })),
    [
      rawItems,
      userId,
      approverRoleId,
      tenantId,
      rejectComment,
      actionsDisabled,
    ],
  );

  const rowCellPadding = { paddingTop: 8, paddingBottom: 8 };
  const rowCellClass = 'text-sm py-2 text-gray-900';

  const columns: TableColumnsType<any> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      width: 220,
      ellipsis: true,
      onCell: () => ({ style: rowCellPadding }),
      render: (value: string, record: any) => (
        <div className="flex flex-col" data-cy="tna-approval-table-course-cell">
          <span
            className="text-sm font-bold text-black"
            data-cy="tna-approval-table-course-name"
          >
            {value || 'Untitled training'}
          </span>
          <span
            className="text-xs text-black/45"
            data-cy="tna-approval-table-course-source"
          >
            {record?.source || 'External training'}
          </span>
        </div>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
      onCell: () => ({ style: rowCellPadding }),
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      onCell: () => ({ style: rowCellPadding }),
      render: (value: number) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="tna-approval-table-cell-amount"
        >
          {Number(value ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      onCell: () => ({ style: rowCellPadding }),
      render: (value: string) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="tna-approval-table-cell-requested"
        >
          {value ? dayjs(value).format(DATE_DISPLAY_FORMAT) : '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 260,
      onCell: () => ({ style: rowCellPadding }),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <Card
      id="tna-approval-table-card"
      data-cy="tna-approval-table-card"
      className="border-gray-300"
      bodyStyle={{ padding: '0', paddingTop: 16 }}
    >
      <div
        className="mb-3 mx-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-2 sm:gap-3"
        id="tna-approval-table-toolbar"
        data-cy="tna-approval-table-toolbar"
      >
        <Select
          placeholder="Search Employee"
          showSearch
          allowClear
          options={userOptions}
          value={searchEmployee || undefined}
          onChange={(v) => setSearchEmployee(v ?? '')}
          filterOption={(input, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          className="h-8 w-full min-w-0 min-[400px]:min-w-[88px] min-[400px]:flex-1 min-[400px]:basis-0 md:flex-none md:basis-auto md:w-[280px] md:min-w-[280px] md:max-w-[280px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!min-w-0"
          id="tna-approval-table-search-employee"
          data-cy="tna-approval-table-search-employee"
        />
        <div
          className="flex w-full min-w-0 flex-wrap items-center gap-2 min-[400px]:w-auto min-[400px]:shrink-0 min-[400px]:justify-end"
          data-cy="tna-approval-table-toolbar-actions"
        >
          {selectedRowKeys.length > 0 && (
            <>
              <Popconfirm
                title="All Reject Request"
                description="Are you sure to reject all training requests?"
                onConfirm={onRejectAll}
                okText="Reject All"
                cancelText="Cancel"
                data-cy="tna-approval-table-reject-all-popconfirm"
              >
                <Button
                  danger
                  disabled={actionsDisabled}
                  id="tna-approval-table-reject-all-button"
                  data-cy="tna-approval-table-reject-all-button"
                >
                  <Skeleton
                    active
                    loading={isRejectingAll}
                    data-cy="tna-approval-table-reject-all-spin"
                  />
                  Reject All
                </Button>
              </Popconfirm>
              <Popconfirm
                title="All Approve Request"
                description="Are you sure to approve all training requests?"
                onConfirm={onApproveAll}
                okText="Approve All"
                cancelText="Cancel"
                data-cy="tna-approval-table-approve-all-popconfirm"
              >
                <Button
                  type="primary"
                  disabled={actionsDisabled}
                  id="tna-approval-table-approve-all-button"
                  data-cy="tna-approval-table-approve-all-button"
                >
                  <Skeleton
                    active
                    loading={isApprovingAll}
                    data-cy="tna-approval-table-approve-all-spin"
                  />
                  Approve All
                </Button>
              </Popconfirm>
            </>
          )}
          <Select
            placeholder="Filter by status"
            allowClear
            options={statusFilterOptions}
            value={filterStatus || undefined}
            onChange={(v) => setFilterStatus(v ?? '')}
            className="h-8 w-full min-w-0 min-[400px]:w-[136px] min-[400px]:min-w-[120px] min-[400px]:shrink-0 sm:min-w-[160px] sm:w-[160px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!min-w-0"
            id="tna-approval-table-filter-status"
            data-cy="tna-approval-table-filter-status"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: APPROVAL_TABLE_SCROLL_X }}
          locale={{ emptyText: 'Nothing awaiting your approval' }}
          className="mx-3 [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.tna-approval-table-row-even>td]:!bg-[#FAFAFA] [&_tr.tna-approval-table-row-odd>td]:!bg-white"
          rowClassName={(record, index) => {
            void record;
            return index % 2 === 1
              ? 'tna-approval-table-row-even'
              : 'tna-approval-table-row-odd';
          }}
          id="tna-approval-table"
          data-cy="tna-approval-table"
        />
      )}

      <div className="mx-3" data-cy="tna-approval-table-pagination-wrapper">
        <CustomPagination
          current={page}
          total={totalItems}
          pageSize={pageSize}
          onChange={(nextPage: number) => setPage(nextPage)}
          onShowSizeChange={(newPageSize: number) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
          id="tna-approval-table-pagination"
          data-cy="tna-approval-table-pagination"
        />
      </div>
    </Card>
  );
};

export default TrainingApprovalTable;
