import React, { useEffect } from 'react';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import { Button, Popconfirm, Table, Input, Avatar, Spin, Card } from 'antd';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useApprovalStore } from '@/store/uistate/features/approval';
import {
  useSetAllApproveLeaveRequest,
  useSetAllFinalApproveLeaveRequest,
  useSetApproveLeaveRequest,
  useSetFinalApproveLeaveRequest,
  useSetRejectLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { UserOutlined } from '@ant-design/icons';
import { useCurrentLeaveApprovalStore } from '@/store/uistate/features/timesheet/myTimesheet/currentApproval';
import { useAllCurrentLeaveApprovedStore } from '@/store/uistate/features/timesheet/myTimesheet/allCurentApproved';
import { AllLeaveRequestApproveData } from '@/store/server/features/timesheet/leaveRequest/interface';
import dayjs from 'dayjs';
import { AiOutlineReload } from 'react-icons/ai';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';

const ApprovalTable = () => {
  const { pageSize, userCurrentPage, setUserCurrentPage, setPageSize } =
    useCurrentLeaveApprovalStore();
  const { allPageSize, allUserCurrentPage } = useAllCurrentLeaveApprovedStore();
  const { isMobile, isTablet } = useIsMobile();
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

  useEffect(() => {
    setUserCurrentPage(1);
    setPageSize(5);
  }, [pathname]);

  const {
    data: approvalData,
    isLoading: isLoadingApproval,
    refetch,
  } = useGetApprovalLeaveRequest(userId, userCurrentPage, pageSize);
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
  const allFilterData = approvalData?.items?.map((item: any, index: number) => {
    return {
      key: index,
      createdAt: item?.createdAt
        ? dayjs(item?.createdAt).format('YYYY-MM-DD')
        : '-',
      userId: item?.userId,
      startAt: item?.startAt,
      endAt: item?.endAt,
      days: item?.days,
      leaveType: item?.leaveType?.title,
      status: item?.status,
      action: (
        <div
          className="flex gap-4 "
          id={`time-attendance-approval-table-row-${index}-actions-container`}
          data-cy={`time-attendance-approval-table-row-${index}-actions-container`}
        >
          {item?.nextApprover?.[0]?.userId === userId && (
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
          )}
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
        </div>
      ),
    };
  });
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading)
      return (
        <div data-cy="my-timesheet-components-approvaltable-index-tsx-index-div-224">
          ...
        </div>
      );
    if (isError) return <>-</>;

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        id={`time-attendance-approval-table-employee-${userId}-container`}
        data-cy={`time-attendance-approval-table-employee-${userId}-container`}
      >
        <div
          className="mx-1 text-sm"
          id={`time-attendance-approval-table-employee-${userId}-id`}
          data-cy={`time-attendance-approval-table-employee-${userId}-id`}
        >
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar
          size={24}
          icon={
            <UserOutlined
              data-cy={`time-attendance-approval-table-employee-${userId}-avatar-icon`}
            />
          }
          data-cy={`time-attendance-approval-table-employee-${userId}-avatar`}
        />
        <div
          className="flex-1"
          id={`time-attendance-approval-table-employee-${userId}-info`}
          data-cy={`time-attendance-approval-table-employee-${userId}-info`}
        >
          <div
            className="text-xs text-gray-900 flex gap-2"
            id={`time-attendance-approval-table-employee-${userId}-name`}
            data-cy={`time-attendance-approval-table-employee-${userId}-name`}
          >
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div
            className="text-[10px] leading-4 text-gray-600"
            id={`time-attendance-approval-table-employee-${userId}-email`}
            data-cy={`time-attendance-approval-table-employee-${userId}-email`}
          >
            {employeeData?.email}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'createdBy',
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'Requested At',
      dataIndex: 'createdAt',
    },
    {
      title: 'From',
      dataIndex: 'startAt',
    },
    {
      title: 'To',
      dataIndex: 'endAt',
    },
    {
      title: 'Total',
      dataIndex: 'days',
    },

    {
      title: 'Type',
      dataIndex: 'leaveType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: LeaveRequestStatus) => (
        <StatusBadge
          data-cy={`time-attendance-approval-table-status-badge-${text}`}
          theme={LeaveRequestStatusBadgeTheme[text]}
        >
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];
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
    <>
      {approvalData?.items?.length > 0 ? (
        <Card
          loading={isLoadingApproval}
          id="time-attendance-approval-table-card"
          data-cy="time-attendance-approval-table-card"
        >
          <div
            className="flex items-center mb-2 px-3"
            id="time-attendance-approval-table-header-container"
            data-cy="time-attendance-approval-table-header-container"
          >
            <div
              className="text-2xl font-bold text-gray-900"
              id="time-attendance-approval-table-title"
              data-cy="time-attendance-approval-table-title"
            >
              Waiting for my approval
              <Button
                type="text"
                size="small"
                icon={
                  <AiOutlineReload
                    data-cy="time-attendance-approval-table-refresh-button-icon"
                    size={14}
                    className="text-gray-600"
                  />
                }
                onClick={() => refetch()}
                id="time-attendance-approval-table-refresh-button"
                data-cy="time-attendance-approval-table-refresh-button"
              />
            </div>
          </div>
          <div
            className="flex items-center sm:justify-end justify-between mb-2 px-3 sm:px-0"
            id="time-attendance-approval-table-actions-container"
            data-cy="time-attendance-approval-table-actions-container"
          >
            <div
              className="flex items-center gap-4 mb-2"
              id="time-attendance-approval-table-actions-buttons"
              data-cy="time-attendance-approval-table-actions-buttons"
            >
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
            </div>
          </div>
          <Table
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
            id="time-attendance-approval-table"
            data-cy="time-attendance-approval-table"
          />
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={approvalData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setUserCurrentPage(1);
              }}
              data-cy="time-attendance-approval-table-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={userCurrentPage}
              total={approvalData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setUserCurrentPage(1);
              }}
              data-cy="time-attendance-approval-table-pagination"
            />
          )}
        </Card>
      ) : (
        ''
      )}
    </>
  );
};

export default ApprovalTable;
