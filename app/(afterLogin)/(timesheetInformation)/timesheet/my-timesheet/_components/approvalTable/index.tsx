import React from 'react';

import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import { Button, Popconfirm, Table, Input, Avatar } from 'antd';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useSetApproveLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { UserOutlined } from '@ant-design/icons';
import { useCurrentLeaveApprovalStore } from '@/store/uistate/features/timesheet/myTimesheet/currentApproval';

const ApprovalTable = () => {
  const { pageSize, userCurrentPage, setUserCurrentPage } =
    useCurrentLeaveApprovalStore();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalStore();
  const { mutate: editApprover } = useSetApproveLeaveRequest();

  const { data, isFetching } = useGetApprovalLeaveRequest(
    userId,
    userCurrentPage,
    pageSize,
  );

  const reject: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: any;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
    comment: { comment: string; commentedBy: string; tenantId: string };
  }) => {
    editApprover(e, {
      onSuccess: () => {
        setRejectComment('');
      },
    });
  };

  const confirm: any = (e: {
    approvalWorkflowId: any;
    stepOrder: any;
    requestId: any;
    approvedUserId: string;
    approverRoleId: any;
    action: string;
    tenantId: string;
  }) => {
    editApprover(e);
  };

  const cancel: any = () => {};
  const allFilterData = data?.items?.map((item: any, index: number) => {
    return {
      key: index,
      userId: item?.userId,
      startAt: item?.startAt,
      endAt: item?.endAt,
      days: item?.days,
      leaveType: item?.leaveType?.title,
      status: item?.status,
      action: (
        <div className="flex gap-4 ">
          <PermissionWrapper
            permissions={[Permissions.DeclineEmployeeLeaveRequest]}
          >
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
            >
              <Button danger>Reject</Button>
            </Popconfirm>
          </PermissionWrapper>
          <PermissionWrapper
            permissions={[Permissions.ApproveEmployeeLeaveRequest]}
          >
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
            >
              <Button type="primary">Approve</Button>
            </Popconfirm>
          </PermissionWrapper>
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
          <div className="text-xs text-gray-900">
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
  return (
    <>
      {data?.items?.length > 0 ? (
        <>
          <div className="flex items-center mb-6">
            <div className="text-2xl font-bold text-gray-900">
              Waiting for my approval
            </div>
          </div>
          <Table
            columns={columns}
            loading={isFetching}
            dataSource={allFilterData}
            pagination={{
              total: data?.meta?.totalItems,
              current: userCurrentPage,
              pageSize: pageSize,
              onChange: onPageChange,
            }}
          />
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default ApprovalTable;
