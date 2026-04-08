import React, { useEffect, useMemo, useState } from 'react';
import { useGetApprovalLeaveRequestAllStatus } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import {
  Button,
  Input,
  Popconfirm,
  Table,
  Skeleton,
  Card,
  Select,
  Tag,
} from 'antd';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import { useApprovalStore } from '@/store/uistate/features/approval';
import {
  useSetAllApproveLeaveRequest,
  useSetAllFinalApproveLeaveRequest,
  useSetApproveLeaveRequest,
  useSetFinalApproveLeaveRequest,
  useSetRejectLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useCurrentLeaveApprovalStore } from '@/store/uistate/features/timesheet/myTimesheet/currentApproval';
import { useAllCurrentLeaveApprovedStore } from '@/store/uistate/features/timesheet/myTimesheet/allCurentApproved';
import { AllLeaveRequestApproveData } from '@/store/server/features/timesheet/leaveRequest/interface';
import dayjs from 'dayjs';
import CustomPagination from '@/components/customPagination';
import { usePathname } from 'next/navigation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { TableSkeleton } from '@/components/tableSkeleton';

const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';

/** Min width for horizontal scroll on narrow viewports (aligned with leave table pattern). */
const APPROVAL_TABLE_SCROLL_X = 960;

const ApprovalTable = () => {
  const { pageSize, userCurrentPage, setUserCurrentPage, setPageSize } =
    useCurrentLeaveApprovalStore();
  const { allPageSize, allUserCurrentPage } = useAllCurrentLeaveApprovedStore();
  const pathname = usePathname();

  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalStore();
  const { mutate: editApprover, isLoading: isLoadingEditApprover } =
    useSetApproveLeaveRequest();
  const { mutate: finalApprover } = useSetFinalApproveLeaveRequest();
  const { mutate: allApprover, isLoading: allApproveIsLoading } =
    useSetAllApproveLeaveRequest();
  const { mutate: allReject, isLoading: allRejectIsLoading } =
    useSetRejectLeaveRequest();
  const { mutate: finalAllApproval } = useSetAllFinalApproveLeaveRequest();

  const [searchEmployee, setSearchEmployee] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
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

  const statusFilterOptions = [
    { label: 'Pending', value: LeaveRequestStatus.PENDING },
    { label: 'Approved', value: LeaveRequestStatus.APPROVED },
    { label: 'Rejected', value: LeaveRequestStatus.DECLINED },
  ];

  useEffect(() => {
    setUserCurrentPage(1);
    setPageSize(10);
  }, [pathname]);

  const {
    data: approvalData,
    isLoading: isLoadingApproval,
    isFetching: isFetchingApproval,
    refetch,
  } = useGetApprovalLeaveRequestAllStatus(
    userId ?? '',
    userCurrentPage,
    pageSize,
    searchEmployee || undefined,
    filterStatus || undefined,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setUserCurrentPage(1);
  }, [searchEmployee, filterStatus]);

  // When page, page size, or filters change, refetch so the endpoint is called with the new params
  useEffect(() => {
    refetch();
  }, [userCurrentPage, pageSize, searchEmployee, filterStatus, refetch]);

  /** True on first load and on every refetch (e.g. filter / page changes). `isLoading` alone misses refetches when `keepPreviousData` is on. */
  const isApprovalListLoading = isLoadingApproval || isFetchingApproval;

  // Normalize response: support both { items, meta } and { data: { items, meta } }
  const payload = approvalData?.data ?? approvalData;
  const rawItems = payload?.items ?? approvalData?.items ?? [];
  const finalApproval: any = (
    e: { leaveRequestId: string; status: string },
    options?: { onSuccess?: () => void },
  ) => {
    finalApprover(e, { onSuccess: () => options?.onSuccess?.() });
  };
  const reject: any = (e: {
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
          { leaveRequestId: e.requestId, status: 'declined' },
          { onSuccess: () => refetch() },
        );
      },
    });
  };

  const confirm: any = (e: {
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
            { leaveRequestId: e.requestId, status: 'approved' },
            { onSuccess: () => refetch() },
          );
        } else {
          refetch();
        }
      },
    });
  };

  const cancel: any = () => {};
  const isPending = (item: any) => item?.nextApprover?.[0]?.userId === userId;
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
          days: item?.days,
          leaveType: item?.leaveType?.title,
          status: item?.status,
          action: (
            <div
              className="flex gap-4"
              id={`time-attendance-approval-table-row-${index}-actions-container`}
              data-cy={`time-attendance-approval-table-row-${index}-actions-container`}
            >
              {pending ? (
                <>
                  <Popconfirm
                    title="Approve Request"
                    description="Are you sure to approve this leave request?"
                    onConfirm={() => {
                      confirm({
                        approvalWorkflowId: item?.approvalWorkflowId,
                        stepOrder: item?.nextApprover?.[0]?.stepOrder,
                        requestId: item?.id,
                        approvedUserId: userId,
                        approverRoleId: userRollId,
                        action: 'Approved',
                        tenantId: tenantId,
                      });
                    }}
                    onCancel={cancel}
                    okText="Approve"
                    cancelText="Cancel"
                    disabled={
                      isApprovalListLoading ||
                      isLoadingEditApprover ||
                      allApproveIsLoading ||
                      allRejectIsLoading
                    }
                    data-cy={`time-attendance-approval-table-row-${index}-approve-popconfirm`}
                  >
                    <Button
                      type="primary"
                      id={`time-attendance-approval-table-row-${index}-approve-button`}
                      data-cy={`time-attendance-approval-table-row-${index}-approve-button`}
                    >
                      Approve
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Reject Request"
                    description={
                      <>
                        <p data-cy="my-timesheet-components-approvaltable-index-tsx-index-p-166">
                          Are you sure you want to reject this leave request?
                        </p>
                        <Input
                          placeholder="Add a comment"
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          style={{ marginTop: 8 }}
                          id={`time-attendance-approval-table-row-${index}-reject-comment-input`}
                          data-cy={`time-attendance-approval-table-row-${index}-reject-comment-input`}
                        />
                      </>
                    }
                    onConfirm={() => {
                      reject({
                        approvalWorkflowId: item?.approvalWorkflowId,
                        stepOrder: item?.nextApprover?.[0]?.stepOrder,
                        requestId: item?.id,
                        approvedUserId: userId,
                        approverRoleId: userRollId,
                        action: 'Rejected',
                        tenantId: tenantId,
                        comment: {
                          comment: rejectComment,
                          commentedBy: userId,
                          tenantId: tenantId,
                        },
                      });
                    }}
                    onCancel={cancel}
                    okText="Reject"
                    cancelText="Cancel"
                    okButtonProps={{ disabled: !rejectComment }}
                    disabled={
                      isApprovalListLoading ||
                      isLoadingEditApprover ||
                      allApproveIsLoading ||
                      allRejectIsLoading
                    }
                    data-cy={`time-attendance-approval-table-row-${index}-reject-popconfirm`}
                  >
                    <Button
                      danger
                      id={`time-attendance-approval-table-row-${index}-reject-button`}
                      data-cy={`time-attendance-approval-table-row-${index}-reject-button`}
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
                  id={`time-attendance-approval-table-row-${index}-status-tag`}
                  data-cy={`time-attendance-approval-table-row-${index}-status-tag`}
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
      userId,
      userRollId,
      tenantId,
      rejectComment,
      isApprovalListLoading,
      isLoadingEditApprover,
      allApproveIsLoading,
      allRejectIsLoading,
    ],
  );
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading)
      return (
        <div data-cy="time-attendance-approval-table-employee-loading">
          <span data-cy="time-attendance-approval-table-employee-loading-placeholder">
            ...
          </span>
        </div>
      );
    if (isError)
      return (
        <span data-cy="time-attendance-approval-table-employee-error">-</span>
      );

    return employeeData ? (
      <div
        className="text-sm text-gray-900"
        id={`time-attendance-approval-table-employee-${userId}-container`}
        data-cy={`time-attendance-approval-table-employee-${userId}-container`}
      >
        {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
        {employeeData?.lastName || '-'}
      </div>
    ) : (
      '-'
    );
  };
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
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 180,
      ellipsis: true,
      onCell: () => ({ style: rowCellPadding }),
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
          data-cy="time-attendance-approval-table-cell-start-date"
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
          data-cy="time-attendance-approval-table-cell-end-date"
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
      render: (v: number) => (
        <span
          className={`${rowCellClass} whitespace-nowrap`}
          data-cy="time-attendance-approval-table-cell-days"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };
  const onPageChange = (page: number, pageSizeUnused?: number) => {
    void pageSizeUnused;
    setUserCurrentPage(page);
  };
  // Real total from API only (no heuristic) so "Page X of Y" shows the true count
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
    payload?.result?.total ??
    payload?.data?.total ??
    approvalData?.totalItems ??
    approvalData?.total ??
    approvalData?.totalCount ??
    approvalData?.totalElements ??
    approvalData?.totalRecords ??
    (meta?.totalPages != null && meta.totalPages > 0
      ? meta.totalPages * pageSize
      : null);
  const totalItems = totalFromApi ?? 0;
  const safeApprovalPageSize = pageSize > 0 ? pageSize : 1;
  const approvalMetaTotalPages = meta?.totalPages;
  const approvalResolvedTotalPages = Math.max(
    1,
    typeof approvalMetaTotalPages === 'number' &&
      !Number.isNaN(approvalMetaTotalPages) &&
      approvalMetaTotalPages >= 1
      ? approvalMetaTotalPages
      : Math.ceil((totalItems || 0) / safeApprovalPageSize),
  );

  const onAllApproveRequest = () => {
    const body: AllLeaveRequestApproveData = {
      userId: userId,
      roleId: userRollId,
      limit: allPageSize,
      page: allUserCurrentPage,
    };

    allApprover(body, {
      onSuccess: (data) => {
        const transformData = data.items.map(
          ({ requestId }: { requestId: string }) => ({
            leaveRequestId: requestId,
            status: 'approved',
          }),
        );
        finalAllApproval(transformData);
        refetch();
      },
    });
  };
  const onAllRejectRequest = () => {
    const body: AllLeaveRequestApproveData = {
      userId: userId,
      roleId: userRollId,
      limit: allPageSize,
      page: allUserCurrentPage,
    };

    allReject(body, {
      onSuccess: (data) => {
        const transformData = data.items.map(({ id }: { id: string }) => ({
          leaveRequestId: id,
          status: 'declined',
        }));
        finalAllApproval(transformData);
        refetch();
      },
    });
  };
  return (
    <Card
      id="time-attendance-approval-table-card"
      data-cy="time-attendance-approval-table-card"
      className="border-gray-300"
      bodyStyle={{ padding: '0', paddingTop: 16 }}
    >
      <div
        className="mb-3 mx-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-center min-[400px]:justify-between min-[400px]:gap-2 sm:gap-3"
        id="time-attendance-approval-table-toolbar"
        data-cy="time-attendance-approval-table-toolbar"
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
          id="time-attendance-approval-table-search-employee"
          data-cy="time-attendance-approval-table-search-employee"
        />
        <div
          className="flex w-full min-w-0 flex-wrap items-center gap-2 min-[400px]:w-auto min-[400px]:shrink-0 min-[400px]:justify-end"
          data-cy="time-attendance-approval-table-toolbar-actions"
        >
          {selectedRowKeys.length > 0 && (
            <>
              <Popconfirm
                title="All Reject Request"
                description="Are you sure to reject all leave request?"
                onConfirm={() => {
                  onAllRejectRequest();
                }}
                onCancel={cancel}
                okText="Reject All"
                cancelText="Cancel"
                data-cy="time-attendance-approval-table-reject-all-popconfirm"
              >
                <Button
                  disabled={
                    isApprovalListLoading ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  danger
                  id="time-attendance-approval-table-reject-all-button"
                  data-cy="time-attendance-approval-table-reject-all-button"
                >
                  <Skeleton
                    active
                    loading={allRejectIsLoading}
                    data-cy="time-attendance-approval-table-reject-all-spin"
                  />
                  Reject All
                </Button>
              </Popconfirm>
              <Popconfirm
                title="All Approve Request"
                description="Are you sure to approve all leave request?"
                onConfirm={() => {
                  onAllApproveRequest();
                }}
                onCancel={cancel}
                okText="Approve All"
                cancelText="Cancel"
                data-cy="time-attendance-approval-table-approve-all-popconfirm"
              >
                <Button
                  disabled={
                    isApprovalListLoading ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  type="primary"
                  id="time-attendance-approval-table-approve-all-button"
                  data-cy="time-attendance-approval-table-approve-all-button"
                >
                  <Skeleton
                    active
                    data-cy="time-attendance-approval-table-approve-all-spin"
                    loading={allApproveIsLoading}
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
            id="time-attendance-approval-table-filter-status"
            data-cy="time-attendance-approval-table-filter-status"
          />
        </div>
      </div>
      {isApprovalListLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={allFilterData}
          pagination={false}
          // Single horizontal scroll: only Ant Design’s table body (no outer overflow-x wrapper).
          scroll={{ x: APPROVAL_TABLE_SCROLL_X }}
          locale={{ emptyText: 'No leave requests' }}
          className="mx-3 [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.my-timesheet-approval-table-row-even>td]:!bg-[#FAFAFA] [&_tr.my-timesheet-approval-table-row-odd>td]:!bg-white"
          rowClassName={(record, index) => {
            void record;
            return index % 2 === 1
              ? 'my-timesheet-approval-table-row-even'
              : 'my-timesheet-approval-table-row-odd';
          }}
          id="time-attendance-approval-table"
          data-cy="time-attendance-approval-table"
        />
      )}
      <div
        className="mx-3"
        data-cy="time-attendance-approval-table-pagination-wrapper"
      >
        <CustomPagination
          current={userCurrentPage}
          total={totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setUserCurrentPage(1);
          }}
          id="time-attendance-approval-table-pagination"
          data-cy="time-attendance-approval-table-pagination"
        />
      </div>
    </Card>
  );
};

export default ApprovalTable;
