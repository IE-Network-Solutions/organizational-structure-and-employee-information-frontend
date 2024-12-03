import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useGetBranchTransferApproveById } from '@/store/server/features/employees/approval/queries';
import { useSetApproveLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/approveRequest';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { Button, Input, Popconfirm, Table, TableColumnsType } from 'antd';
import React from 'react';

const ApprovalTable = () => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { userId } = useAuthenticationStore();
  const userRollId = useAuthenticationStore.getState().userData.roleId;
  const {
    userCurrentPage,
    pageSize,
    rejectComment,
    setRejectComment,
    setUserCurrentPage,
    setPageSize,
  } = useBranchApprovalStore();
  const { data, isFetching } = useGetBranchTransferApproveById(
    userId,
    pageSize,
    userCurrentPage,
  );
  const { mutate: editApprover } = useSetApproveLeaveRequest();

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
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
  const columns: TableColumnsType<any> = [
    {
      title: 'Current Branch',
      dataIndex: 'currentBranch',
    },
    {
      title: 'Requested Branch',
      dataIndex: 'requestedBranch',
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
  const allFilterData = data?.items?.map((item: any, index: number) => {
    return {
      key: index,
      currentBranch: item?.currentBranch?.name,
      requestedBranch: item?.requestBranch?.name,
      status: item?.status,
      action: (
        <div className="flex gap-4 ">
          <Popconfirm
            title="Reject Request"
            description={
              <>
                <p>Are you sure you want to reject this request?</p>
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

          <Popconfirm
            title="Approve Request"
            description="Are you sure to approve this request?"
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
        </div>
      ),
    };
  });
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
              total: allFilterData?.meta?.totalItems,
              current: allFilterData?.meta?.currentPage,
              pageSize: pageSize,
              onChange: onPageChange,
              showSizeChanger: true,
              onShowSizeChange: onPageChange,
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
