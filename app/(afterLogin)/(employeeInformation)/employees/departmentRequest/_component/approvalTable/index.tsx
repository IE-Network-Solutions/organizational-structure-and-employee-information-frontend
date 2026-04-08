import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useGetBranchTransferApproveById } from '@/store/server/features/employees/approval/queries';
import {
  useSetApproveLeaveRequest,
  useSetFinalApproveBranchRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBranchApprovalStore } from '@/store/uistate/features/employees/branchTransfer/approveRequest';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { TableSkeleton } from '@/components/tableSkeleton';
import {
  Avatar,
  Button,
  Input,
  Popconfirm,
  Table,
  TableColumnsType,
} from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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
  const { mutate: finalApprover } = useSetFinalApproveBranchRequest();

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const finalApproval: any = (e: { requestId: string; status: string }) => {
    finalApprover(e);
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
        finalApproval({ requestId: e.requestId, status: 'declined' });
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
    editApprover(e, {
      onSuccess: (data) => {
        if (data?.last == true) {
          finalApproval({
            requestId: e.requestId,
            status: 'approved',
          });
        }
      },
    });
  };

  const cancel: any = () => {};
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    const userSlug = toSlug(userId);

    if (isLoading)
      return (
        <div
          className="text-xs text-gray-500"
          id={`department-request-approval-emp-loading-${userSlug}`}
          data-cy={`department-request-approval-emp-loading-${userSlug}`}
        >
          ...
        </div>
      );
    if (isError)
      return (
        <span
          id={`department-request-approval-emp-error-${userSlug}`}
          data-cy={`department-request-approval-emp-error-${userSlug}`}
        >
          -
        </span>
      );

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        id={`department-request-approval-emp-card-${userSlug}`}
        data-cy={`department-request-approval-emp-card-${userSlug}`}
      >
        <div
          className="mx-1 text-sm"
          id={`department-request-approval-emp-attendance-${userSlug}`}
          data-cy={`department-request-approval-emp-attendance-${userSlug}`}
        >
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar
          size={24}
          icon={<UserOutlined />}
          data-cy={`department-request-approval-emp-avatar-${userSlug}`}
        />
        <div
          className="flex-1"
          data-cy={`department-request-approval-emp-info-${userSlug}`}
          id={`department-request-approval-emp-info-${userSlug}`}
        >
          <div
            className="text-xs text-gray-900"
            data-cy={`department-request-approval-emp-name-${userSlug}`}
            id={`department-request-approval-emp-name-${userSlug}`}
          >
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div
            className="text-[10px] leading-4 text-gray-600"
            id={`department-request-approval-emp-email-${userSlug}`}
            data-cy={`department-request-approval-emp-email-${userSlug}`}
          >
            {employeeData?.email}
          </div>
        </div>
      </div>
    ) : (
      <span
        id={`department-request-approval-emp-empty-${userSlug}`}
        data-cy={`department-request-approval-emp-empty-${userSlug}`}
      >
        -
      </span>
    );
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'createdBy',
      render: (text: string) => (
        <EmpRender
          userId={text}
          data-cy="department-request-approval-emp-name"
        />
      ),
    },
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
      render: (text: LeaveRequestStatus, record: any) => {
        const statusSlug = toSlug(`${record?.id}-${text}`);
        return (
          <span
            id={`department-request-approval-status-${statusSlug}`}
            data-cy={`department-request-approval-status-${statusSlug}`}
          >
            <StatusBadge
              theme={LeaveRequestStatusBadgeTheme[text]}
              data-cy={`department-request-approval-status-${statusSlug}`}
            >
              {text}
            </StatusBadge>
          </span>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
  ];
  const allFilterData = data?.items?.map((item: any, index: number) => {
    const requestSlug = toSlug(item?.id || index);
    return {
      key: index,
      userId: item?.userId,
      currentBranch: item?.currentBranch?.name,
      requestedBranch: item?.requestBranch?.name,
      status: item?.status,
      action: (
        <div
          className="flex gap-4 "
          id={`department-request-approval-actions-${requestSlug}`}
          data-cy={`department-request-approval-actions-${requestSlug}`}
        >
          <Popconfirm
            title="Reject Request"
            description={
              <>
                <p
                  id={`department-request-approval-reject-text-${requestSlug}`}
                  data-cy={`department-request-approval-reject-text-${requestSlug}`}
                >
                  Are you sure you want to reject this request?
                </p>
                <Input
                  placeholder="Add a comment"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  style={{ marginTop: 8 }}
                  id={`department-request-approval-reject-input-${requestSlug}`}
                  data-cy={`department-request-approval-reject-input-${requestSlug}`}
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
            id={`department-request-approval-reject-popconfirm-${requestSlug}`}
            data-cy={`department-request-approval-reject-popconfirm-${requestSlug}`}
          >
            <Button
              danger
              id={`department-request-approval-reject-btn-${requestSlug}`}
              data-cy={`department-request-approval-reject-btn-${requestSlug}`}
            >
              Reject
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Approve Request"
            description={
              <span
                id={`department-request-approval-approve-text-${requestSlug}`}
                data-cy={`department-request-approval-approve-text-${requestSlug}`}
              >
                Are you sure to approve this request?
              </span>
            }
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
            id={`department-request-approval-approve-popconfirm-${requestSlug}`}
            data-cy={`department-request-approval-approve-popconfirm-${requestSlug}`}
          >
            <Button
              type="primary"
              id={`department-request-approval-approve-btn-${requestSlug}`}
              data-cy={`department-request-approval-approve-btn-${requestSlug}`}
            >
              Approve
            </Button>
          </Popconfirm>
        </div>
      ),
    };
  });
  return (
    <>
      {data?.items?.length > 0 ? (
        <>
          <div
            className="flex items-center mb-6"
            id="department-request-approval-header"
            data-cy="department-request-approval-header"
          >
            <div
              className="text-2xl font-bold text-gray-900"
              id="department-request-approval-title"
              data-cy="department-request-approval-title"
            >
              Waiting for my approval
            </div>
          </div>
          {isFetching ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              columns={columns}
              dataSource={allFilterData}
              pagination={{
                total: allFilterData?.meta?.totalItems,
                current: allFilterData?.meta?.currentPage,
                pageSize: pageSize,
                onChange: onPageChange,
                showSizeChanger: true,
                onShowSizeChange: onPageChange,
              }}
              id="department-request-approval-table-grid"
              data-cy="department-request-approval-table-grid"
            />
          )}
        </>
      ) : (
        <span
          id="department-request-approval-empty"
          data-cy="department-request-approval-empty"
        >
          {' '}
        </span>
      )}
    </>
  );
};

export default ApprovalTable;
