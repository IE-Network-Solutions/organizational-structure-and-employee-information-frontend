// components/ApprovalStatus.tsx
import { FC } from 'react';
import { Card, Select } from 'antd';
import ApprovalRequestCard from './approval-status-card';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useDashboardApprovalStore } from '@/store/uistate/features/dashboard/approval';
import { useGetBranchTransferApproveById } from '@/store/server/features/employees/approval/queries';

const ApprovalStatus: FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: LeaveTransferData, isLoading: isLoadingLeaveTransfer } =
    useGetApprovalLeaveRequest(userId, 1, 4);
  const { data: BranchTransferData, isLoading: isLoadingBranchTransfer } =
    useGetBranchTransferApproveById(userId, 4, 1);
  const { approverType, setApproverType } = useDashboardApprovalStore();
  const requests = [
    {
      type: 'Leave',
      value: 'Leave',
    },
    {
      type: 'BranchTransfer',
      value: 'Branch',
    },
  ];
  const handleChange = (value: string) => {
    setApproverType(value);
  };

  return (
    <div
      className="bg-white p-3 rounded-lg w-full shadow-lg"
      data-cy="dashboard-approval-status-container"
    >
      <div
        className="flex items-center justify-between mb-4"
        data-cy="dashboard-approval-status-header"
      >
        <div className="" data-cy="dashboard-approval-status-title-section">
          <div
            className="text-base lg:text-xl font-bold"
            data-cy="dashboard-approval-status-title"
          >
            <span data-cy="dashboard-approval-status-title-text">
              Approval Status
            </span>
          </div>
          <div
            className="text-xs font-normal text-[#687588]"
            data-cy="dashboard-approval-status-subtitle"
          >
            <span data-cy="dashboard-approval-status-subtitle-text">
              {`${
                approverType == 'Leave'
                  ? `${LeaveTransferData?.meta?.totalItems || LeaveTransferData?.items?.length || 0} Leave `
                  : approverType == 'BranchRequest'
                    ? `${BranchTransferData?.meta?.totalItems || BranchTransferData?.items?.length || 0} Branch `
                    : ''
              }`}
              Waiting For Your Approval
            </span>
          </div>
        </div>

        <div
          className="flex items-center space-x-1 text-sm text-gray-500 cursor-pointer"
          data-cy="dashboard-approval-status-select-container"
        >
          <Select
            placeholder="select"
            allowClear
            className="min-w-10   text-sm font-semibold border-none"
            options={requests.map((item) => ({
              value: item.type,
              label: item.value,
            }))}
            bordered={false}
            defaultValue="Leave"
            onChange={handleChange}
            data-cy="dashboard-approval-status-select"
          />
        </div>
      </div>
      <div
        className="max-h-[250px] min-h-[250px] overflow-y-auto scrollbar-none"
        data-cy="dashboard-approval-status-content"
      >
        {approverType === 'BranchTransfer' ? (
          BranchTransferData?.items?.length ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingBranchTransfer}
              data-cy="dashboard-approval-status-branch-transfer-card"
            >
              {BranchTransferData.items.map((request: any, index: number) => (
                <ApprovalRequestCard
                  key={index}
                  id={request.id}
                  name={request.name}
                  approveRequesterId={request.userId}
                  startAt={request?.currentBranch?.name}
                  endAt={request?.requestBranch?.name}
                  leaveType={'Branch Transfer Request'}
                  approvalWorkflowId={request.approvalWorkflowId}
                  nextApprover={request.nextApprover?.[0]?.stepOrder}
                  requestType={approverType}
                />
              ))}
            </Card>
          ) : (
            <div
              className="flex items-center justify-center min-h-[250px]"
              data-cy="dashboard-approval-status-branch-transfer-empty"
            >
              <div
                className="text-xl font-thin"
                data-cy="dashboard-approval-status-branch-transfer-empty-text"
              >
                <span data-cy="dashboard-approval-status-branch-transfer-empty-text-content">
                  No Approval Found
                </span>
              </div>
            </div>
          )
        ) : approverType === 'Leave' ? (
          LeaveTransferData?.items?.length ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingLeaveTransfer}
              data-cy="dashboard-approval-status-leave-card"
            >
              {LeaveTransferData.items.map((request: any, index: number) => (
                <ApprovalRequestCard
                  key={index}
                  id={request.id}
                  name={request.name}
                  days={request.days}
                  approveRequesterId={request.userId}
                  startAt={request.startAt}
                  endAt={request.endAt}
                  isHalfDay={request.isHalfDay}
                  leaveType={request?.leaveType?.title || ''}
                  approvalWorkflowId={request.approvalWorkflowId}
                  nextApprover={request.nextApprover?.[0]?.stepOrder}
                  requestType={approverType}
                  fileAttachment={request?.justificationDocument}
                />
              ))}
            </Card>
          ) : (
            <div
              className="flex items-center justify-center min-h-[250px]"
              data-cy="dashboard-approval-status-leave-empty"
            >
              <div
                className="text-xl font-thin"
                data-cy="dashboard-approval-status-leave-empty-text"
              >
                <span data-cy="dashboard-approval-status-leave-empty-text-content">
                  No Approval Found
                </span>
              </div>
            </div>
          )
        ) : (
          <div
            className="flex items-center justify-center min-h-[250px]"
            data-cy="dashboard-approval-status-default-empty"
          >
            <div
              className="text-xl font-thin"
              data-cy="dashboard-approval-status-default-empty-text"
            >
              <span data-cy="dashboard-approval-status-default-empty-text-content">
                No Approval Found
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
