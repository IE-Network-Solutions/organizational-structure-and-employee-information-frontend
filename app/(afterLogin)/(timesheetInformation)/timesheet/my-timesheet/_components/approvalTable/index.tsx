import React from 'react';
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

const ApprovalTable = () => {
  const { pageSize, userCurrentPage, setUserCurrentPage } =
    useCurrentLeaveApprovalStore();
  const { allPageSize, allUserCurrentPage } = useAllCurrentLeaveApprovedStore();

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
        <div className="flex gap-4 ">
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
            >
              <Button type="primary">Approve</Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Reject Request"
            description={
              <>
                <p>Are you sure you want to reject this leave request?</p>
                <Input
                  placeholder="Add a comment"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  style={{ marginTop: 8 }}
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
          >
            <Button danger>Reject</Button>
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

    if (isLoading) return <div>...</div>;
    if (isError) return <>-</>;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        <div className="mx-1 text-sm">
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar size={24} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="text-xs text-gray-900 flex gap-2">
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div className="text-[10px] leading-4 text-gray-600">
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
        <StatusBadge theme={LeaveRequestStatusBadgeTheme[text]}>
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
      onSuccess: () => {
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
      onSuccess: () => {
        refetch();
      },
    });
  };
  return (
    <>
      {approvalData?.items?.length > 0 ? (
        <Card loading={isLoadingApproval}>
          <div className="flex items-center mb-2 px-3">
            <div className="text-2xl font-bold text-gray-900">
              Waiting for my approval
              <Button
                type="text"
                size="small"
                icon={<AiOutlineReload size={14} className="text-gray-600" />}
                onClick={() => refetch()}
              />
            </div>
          </div>
          <div className="flex items-center sm:justify-end justify-between mb-2 px-3 sm:px-0">
            <div className="flex items-center gap-4 mb-2">
              <Popconfirm
                title="All Approve Request"
                description="Are you sure to approve all leave request?"
                onConfirm={() => {
                  onAllApproveRequest();
                }}
                onCancel={cancel}
                okText="Approve All"
                cancelText="Cancel"
              >
                <Button
                  disabled={
                    isLoadingApproval ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  type="primary"
                >
                  <Spin spinning={allApproveIsLoading} />
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
              >
                <Button
                  disabled={
                    isLoadingApproval ||
                    isLoadingEditApprover ||
                    allApproveIsLoading ||
                    allRejectIsLoading
                  }
                  danger
                >
                  <Spin spinning={allRejectIsLoading} />
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
            pagination={{
              total: approvalData?.meta?.totalItems,
              current: userCurrentPage,
              pageSize: pageSize,
              onChange: onPageChange,
            }}
            scroll={{ x: 'min-content' }}
          />
        </Card>
      ) : (
        ''
      )}
    </>
  );
};

export default ApprovalTable;
