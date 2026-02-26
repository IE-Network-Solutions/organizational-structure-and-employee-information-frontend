import React, { useEffect, useMemo, useState } from 'react';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import {
  Button,
  Input,
  Popconfirm,
  Table,
  Spin,
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
import MyTimesheetAttendancePagination from '../attendance/MyTimesheetAttendancePagination';
import { usePathname } from 'next/navigation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';

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
    refetch,
  } = useGetApprovalLeaveRequest(userId, userCurrentPage, pageSize);

  const rawItems = approvalData?.items ?? [];
  const filteredItems = useMemo(() => {
    return rawItems.filter((item: any) => {
      const matchStatus = !filterStatus.trim() || item?.status === filterStatus;
      const matchSearch = !searchEmployee || item?.userId === searchEmployee;
      return matchStatus && matchSearch;
    });
  }, [rawItems, searchEmployee, filterStatus]);
  const finalApproval: any = (e: {
    leaveRequestId: string;
    status: string;
  }) => {
    finalApprover(e);
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
        finalApproval({ leaveRequestId: e.requestId, status: 'declined' });
        refetch();
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
        if (data?.last == true) {
          finalApproval({
            leaveRequestId: e.requestId,
            status: 'approved',
          });
        }
        refetch();
      },
    });
  };

  const cancel: any = () => {};
  const isPending = (item: any) => item?.nextApprover?.[0]?.userId === userId;
  const allFilterData = useMemo(
    () =>
      filteredItems.map((item: any, index: number) => {
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
                      isLoadingApproval ||
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
                      isLoadingApproval ||
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
      filteredItems,
      userId,
      userRollId,
      tenantId,
      rejectComment,
      isLoadingApproval,
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
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee',
      dataIndex: 'userId',
      key: 'userId',
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
    },
    {
      title: 'Start Date',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (val: string) =>
        val ? dayjs(val).format(DATE_DISPLAY_FORMAT) : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (val: string) =>
        val ? dayjs(val).format(DATE_DISPLAY_FORMAT) : '-',
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };
  const onPageChange = (page: number) => {
    setUserCurrentPage(page);
  };
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
      loading={isLoadingApproval}
      id="time-attendance-approval-table-card"
      data-cy="time-attendance-approval-table-card"
      className="border-gray-300"
      bodyStyle={{ padding: '0', paddingTop: 16 }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 mb-3 mx-3"
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
          className="min-w-[280px]"
          id="time-attendance-approval-table-search-employee"
          data-cy="time-attendance-approval-table-search-employee"
        />
        <div
          className="flex flex-wrap items-center gap-2"
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
                    isLoadingApproval ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  danger
                  id="time-attendance-approval-table-reject-all-button"
                  data-cy="time-attendance-approval-table-reject-all-button"
                >
                  <Spin
                    spinning={allRejectIsLoading}
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
                    isLoadingApproval ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  type="primary"
                  id="time-attendance-approval-table-approve-all-button"
                  data-cy="time-attendance-approval-table-approve-all-button"
                >
                  <Spin
                    data-cy="time-attendance-approval-table-approve-all-spin"
                    spinning={allApproveIsLoading}
                  />
                  Approve All
                </Button>
              </Popconfirm>
            </>
          )}
          <Select
            placeholder="Filter by status"
            allowClear
            options={[
              { label: 'All statuses', value: '' },
              ...statusFilterOptions,
            ]}
            value={filterStatus || undefined}
            onChange={(v) => setFilterStatus(v ?? '')}
            className="min-w-[160px]"
            id="time-attendance-approval-table-filter-status"
            data-cy="time-attendance-approval-table-filter-status"
          />
        </div>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        loading={
          isLoadingApproval ||
          isLoadingEditApprover ||
          allApproveIsLoading ||
          allRejectIsLoading
        }
        dataSource={allFilterData}
        pagination={false}
        scroll={{ x: 'min-content' }}
        locale={{ emptyText: 'No leave requests' }}
        id="time-attendance-approval-table"
        data-cy="time-attendance-approval-table"
      />
      <div
        className="mx-3"
        data-cy="time-attendance-approval-table-pagination-wrapper"
      >
        <MyTimesheetAttendancePagination
          current={userCurrentPage}
          total={approvalData?.meta?.totalItems ?? 0}
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
