'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGetWorkFromHomeApprovalAllStatus } from '@/store/server/features/timesheet/workFromHome/queries';
import { useSetFinalWorkFromHomeRequest } from '@/store/server/features/timesheet/workFromHome/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import { Button, Input, Popconfirm, Table, Card, Select, Tag } from 'antd';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useSetApproveLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import dayjs from 'dayjs';
import CustomPagination from '@/components/customPagination';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { TableSkeleton } from '@/components/tableSkeleton';

const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';
const APPROVAL_TABLE_SCROLL_X = 960;

const EmpRender = ({ userId }: { userId: string }) => {
  const {
    isLoading,
    data: employeeData,
    isError,
  } = useGetSimpleEmployee(userId);

  if (isLoading) {
    return (
      <span data-cy="time-attendance-wfh-approval-table-employee-loading">
        ...
      </span>
    );
  }
  if (isError) {
    return (
      <span data-cy="time-attendance-wfh-approval-table-employee-error">-</span>
    );
  }
  return employeeData ? (
    <div
      className="text-sm text-gray-900"
      data-cy={`time-attendance-wfh-approval-table-employee-${userId}`}
    >
      {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
      {employeeData?.lastName || '-'}
    </div>
  ) : (
    '-'
  );
};

export default function WorkFromHomeApprovalsTable() {
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const uid = userId ?? '';
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalStore();
  const { mutate: editApprover, isLoading: isLoadingEditApprover } =
    useSetApproveLeaveRequest();
  const { mutate: finalWfh, isLoading: isFinalLoading } =
    useSetFinalWorkFromHomeRequest();

  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEmployee, setSearchEmployee] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

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

  const statusFilterOptions = [
    { label: 'Pending', value: LeaveRequestStatus.PENDING },
    { label: 'Approved', value: LeaveRequestStatus.APPROVED },
    { label: 'Rejected', value: LeaveRequestStatus.DECLINED },
  ];

  const {
    data: approvalData,
    isLoading: isLoadingApproval,
    isFetching: isFetchingApproval,
    refetch,
  } = useGetWorkFromHomeApprovalAllStatus(
    uid,
    userCurrentPage,
    pageSize,
    searchEmployee || undefined,
    filterStatus || undefined,
  );

  useEffect(() => {
    setUserCurrentPage(1);
  }, [searchEmployee, filterStatus]);

  useEffect(() => {
    refetch();
  }, [userCurrentPage, pageSize, searchEmployee, filterStatus, refetch]);

  const isApprovalListLoading = isLoadingApproval || isFetchingApproval;

  const payload = approvalData?.data ?? approvalData;
  const rawItems = payload?.items ?? approvalData?.items ?? [];

  const finalApproval = (
    e: { workFromHomeRequestId: string; status: 'approved' | 'declined' },
    options?: { onSuccess?: () => void },
  ) => {
    finalWfh(e, { onSuccess: () => options?.onSuccess?.() });
  };

  const reject = (e: {
    approvalWorkflowId: string;
    stepOrder: any;
    requestId: string;
    approvedUserId: string;
    approverRoleId: string;
    action: string;
    tenantId: string;
    comment: { comment: string; commentedBy: string; tenantId: string };
  }) => {
    editApprover(e, {
      onSuccess: () => {
        setRejectComment('');
        finalApproval(
          { workFromHomeRequestId: e.requestId, status: 'declined' },
          { onSuccess: () => refetch() },
        );
      },
    });
  };

  const confirm = (e: {
    approvalWorkflowId: string;
    stepOrder: any;
    requestId: string;
    approvedUserId: string;
    approverRoleId: string;
    action: string;
    tenantId: string;
  }) => {
    editApprover(e, {
      onSuccess: (data) => {
        if (data?.last === true) {
          finalApproval(
            { workFromHomeRequestId: e.requestId, status: 'approved' },
            { onSuccess: () => refetch() },
          );
        } else {
          refetch();
        }
      },
    });
  };

  const cancel = () => {};
  const isPending = (item: any) => item?.nextApprover?.[0]?.userId === uid;

  const dayCount = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    const d = dayjs(end).diff(dayjs(start), 'day') + 1;
    return Number.isFinite(d) ? d : '-';
  };

  const allFilterData = useMemo(
    () =>
      rawItems.map((item: any, index: number) => {
        const pending = isPending(item);
        return {
          key: item?.id ?? index,
          id: item?.id,
          userId: item?.userId,
          startAt: item?.startAt,
          endAt: item?.endAt,
          days: item?.days ?? dayCount(item?.startAt, item?.endAt),
          status: item?.status,
          action: (
            <div
              className="flex gap-4"
              data-cy={`time-attendance-wfh-approval-table-row-${index}-actions`}
            >
              {pending ? (
                <>
                  <Popconfirm
                    title="Approve Request"
                    description="Are you sure to approve this work from home request?"
                    onConfirm={() => {
                      confirm({
                        approvalWorkflowId: item?.approvalWorkflowId,
                        stepOrder: item?.nextApprover?.[0]?.stepOrder,
                        requestId: item?.id,
                        approvedUserId: uid,
                        approverRoleId: userRollId,
                        action: 'Approved',
                        tenantId: tenantId,
                      });
                    }}
                    onCancel={cancel}
                    okText="Approve"
                    cancelText="Cancel"
                    disabled={isLoadingEditApprover || isFinalLoading}
                  >
                    <Button
                      type="primary"
                      data-cy={`time-attendance-wfh-approval-approve-${index}`}
                    >
                      Approve
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Reject Request"
                    description={
                      <>
                        <p data-cy="time-attendance-wfh-approval-reject-confirm-text">
                          Are you sure you want to reject this work from home
                          request?
                        </p>
                        <Input
                          placeholder="Add a comment"
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          style={{ marginTop: 8 }}
                          data-cy={`time-attendance-wfh-approval-reject-comment-${index}`}
                        />
                      </>
                    }
                    onConfirm={() => {
                      reject({
                        approvalWorkflowId: item?.approvalWorkflowId,
                        stepOrder: item?.nextApprover?.[0]?.stepOrder,
                        requestId: item?.id,
                        approvedUserId: uid,
                        approverRoleId: userRollId,
                        action: 'Rejected',
                        tenantId: tenantId,
                        comment: {
                          comment: rejectComment,
                          commentedBy: uid,
                          tenantId: tenantId,
                        },
                      });
                    }}
                    onCancel={cancel}
                    okText="Reject"
                    cancelText="Cancel"
                    okButtonProps={{ disabled: !rejectComment }}
                    disabled={isLoadingEditApprover || isFinalLoading}
                  >
                    <Button
                      danger
                      data-cy={`time-attendance-wfh-approval-reject-${index}`}
                    >
                      Reject
                    </Button>
                  </Popconfirm>
                </>
              ) : (
                <Tag
                  color={
                    item?.status === LeaveRequestStatus.APPROVED
                      ? 'success'
                      : 'error'
                  }
                  data-cy={`time-attendance-wfh-approval-status-${index}`}
                >
                  {item?.status === LeaveRequestStatus.APPROVED
                    ? 'Approved'
                    : 'Rejected'}
                </Tag>
              )}
            </div>
          ),
        };
      }),
    [
      rawItems,
      uid,
      userRollId,
      tenantId,
      rejectComment,
      isApprovalListLoading,
      isLoadingEditApprover,
      isFinalLoading,
    ],
  );

  const rowCellPadding = { paddingTop: 8, paddingBottom: 8 };
  const rowCellClass = 'text-sm py-2 text-gray-900';

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      width: 200,
      ellipsis: true,
      onCell: () => ({ style: rowCellPadding }),
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      ellipsis: true,
      onCell: () => ({ style: rowCellPadding }),
      render: () => (
        <span
          className={rowCellClass}
          data-cy="time-attendance-wfh-approval-type-cell"
        >
          Work From Home
        </span>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startAt',
      key: 'startAt',
      width: 128,
      onCell: () => ({ style: rowCellPadding }),
      render: (val: string) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="time-attendance-wfh-approval-cell-start-date"
        >
          {val ? dayjs(val).format(DATE_DISPLAY_FORMAT) : '-'}
        </span>
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'endAt',
      key: 'endAt',
      width: 128,
      onCell: () => ({ style: rowCellPadding }),
      render: (val: string) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="time-attendance-wfh-approval-cell-end-date"
        >
          {val ? dayjs(val).format(DATE_DISPLAY_FORMAT) : '-'}
        </span>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      width: 72,
      onCell: () => ({ style: rowCellPadding }),
      render: (v: number | string) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="time-attendance-wfh-approval-cell-days"
        >
          {v}
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

  const meta = payload?.meta ?? approvalData?.meta;
  const totalFromApi =
    approvalData?.totalFromHeader ??
    meta?.totalItems ??
    meta?.total ??
    meta?.totalCount ??
    meta?.itemCount ??
    payload?.totalItems ??
    payload?.total ??
    payload?.totalCount ??
    payload?.totalElements ??
    payload?.totalRecords ??
    payload?.count ??
    approvalData?.totalItems ??
    approvalData?.total ??
    approvalData?.totalCount ??
    approvalData?.totalElements ??
    approvalData?.totalRecords ??
    (meta?.totalPages != null && meta.totalPages > 0
      ? meta.totalPages * pageSize
      : null);
  const totalItems = totalFromApi ?? 0;

  return (
    <Card
      data-cy="time-attendance-wfh-approval-table-card"
      className="border-gray-300"
      bodyStyle={{ padding: '0', paddingTop: 16 }}
    >
      <div
        className="mb-3 mx-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-2 sm:gap-3"
        data-cy="time-attendance-wfh-approval-toolbar"
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
          data-cy="time-attendance-wfh-approval-search-employee"
        />
        <Select
          placeholder="Filter by status"
          allowClear
          options={statusFilterOptions}
          value={filterStatus || undefined}
          onChange={(v) => setFilterStatus(v ?? '')}
          className="h-8 w-full min-w-0 min-[400px]:w-[136px] min-[400px]:min-w-[120px] min-[400px]:shrink-0 sm:min-w-[160px] sm:w-[160px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!min-w-0"
          data-cy="time-attendance-wfh-approval-filter-status"
        />
      </div>
      {isApprovalListLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          columns={columns}
          dataSource={allFilterData}
          pagination={false}
          scroll={{ x: APPROVAL_TABLE_SCROLL_X }}
          locale={{ emptyText: 'No work from home requests' }}
          className="mx-3 [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.my-timesheet-wfh-approval-row-even>td]:!bg-[#FAFAFA] [&_tr.my-timesheet-wfh-approval-row-odd>td]:!bg-white"
          rowClassName={(unusedRecord, rowIndex) =>
            rowIndex % 2 === 1
              ? 'my-timesheet-wfh-approval-row-even'
              : 'my-timesheet-wfh-approval-row-odd'
          }
          data-cy="time-attendance-wfh-approval-table"
        />
      )}
      <div
        className="mx-3"
        data-cy="time-attendance-wfh-approval-pagination-wrap"
      >
        <CustomPagination
          current={userCurrentPage}
          total={totalItems}
          pageSize={pageSize}
          onChange={(page) => setUserCurrentPage(page)}
          onShowSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setUserCurrentPage(1);
          }}
          data-cy="time-attendance-wfh-approval-pagination"
        />
      </div>
    </Card>
  );
}
