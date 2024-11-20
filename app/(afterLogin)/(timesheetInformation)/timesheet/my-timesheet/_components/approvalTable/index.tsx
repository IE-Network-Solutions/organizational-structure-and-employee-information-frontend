import React from 'react';

import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TableColumnsType } from '@/types/table/table';
import { Button, Popconfirm, Table, Input } from 'antd';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useSetApproveLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const ApprovalTable = () => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const { rejectComment, setRejectComment } = useApprovalStore();
  const { mutate: editApprover } = useSetApproveLeaveRequest();

  const { data, isFetching } = useGetApprovalLeaveRequest(userId);

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
      startAt: item?.startAt,
      endAt: item?.endAt,
      days: item?.days,
      leaveType: item?.leaveType?.title,
      status: item?.status,
      action: (
        <div className="flex gap-4 ">
          <AccessGuard permissions={[Permissions.DeclineEmployeeLeaveRequest]}>
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
          </AccessGuard>
          <AccessGuard permissions={[Permissions.ApproveEmployeeLeaveRequest]}>
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
          </AccessGuard>
        </div>
      ),
    };
  });
  const columns: TableColumnsType<any> = [
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
          />
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default ApprovalTable;
