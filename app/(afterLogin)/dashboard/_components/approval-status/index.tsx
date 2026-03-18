// components/ApprovalStatus.tsx
import { FC } from 'react';
import { Button, Card } from 'antd';
import { Clock3 } from 'lucide-react';
import ApprovalRequestCard from './approval-status-card';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useDashboardApprovalStore } from '@/store/uistate/features/dashboard/approval';
import { useGetBranchTransferApproveById } from '@/store/server/features/employees/approval/queries';
import MyLeaveRequestDashboard from '../my-leave-request';
import { MdOutlineAssignmentInd, MdOutlineGroups } from 'react-icons/md';

const ApprovalStatus: FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: LeaveTransferData, isLoading: isLoadingLeaveTransfer } =
    useGetApprovalLeaveRequest(userId, 1, 4);
  const { data: BranchTransferData, isLoading: isLoadingBranchTransfer } =
    useGetBranchTransferApproveById(userId, 4, 1);
  const { approverType, setApproverType } = useDashboardApprovalStore();

  const handleChange = (value: string) => {
    setApproverType(value);
  };

  const pendingCount =
    approverType === 'BranchTransfer'
      ? BranchTransferData?.meta?.totalItems ||
        BranchTransferData?.items?.length ||
        0
      : LeaveTransferData?.meta?.totalItems ||
        LeaveTransferData?.items?.length ||
        0;

  return (
    <div
      className="bg-white rounded-lg w-full border border-[#D9D9D9] shadow-none px-4 py-3 h-[272px]"
      data-cy="dashboard-approval-status-container"
    >
      <div
        className="flex items-center justify-between mb-4"
        data-cy="dashboard-approval-status-header"
      >
        <div
          className="flex items-center gap-2"
          data-cy="dashboard-approval-status-title-section"
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
            data-cy="dashboard-approval-status-icon"
          >
            <Clock3 className="w-4 h-4" />
          </span>
          <div data-cy="dashboard-approval-status-title-wrapper">
            <div
              className="text-sm lg:text-base font-bold text-gray-900"
              data-cy="dashboard-approval-status-title"
            >
              <span data-cy="dashboard-approval-status-title-text">
                Leave Approvals
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 text-xs"
          data-cy="dashboard-approval-status-header-actions"
        >
          {approverType !== 'Personal' && (
            <span
              className="px-3 py-0.5 rounded-sm bg-gray-50 border border-gray-200 text-gray-700 font-medium"
              data-cy="dashboard-approval-status-pending-pill"
            >
              {pendingCount} Pending
            </span>
          )}
          {/* 
          <Select
            value={approverType}
            className="min-w-[90px] text-xs font-medium border-none [&_.ant-select-selector]:rounded-full [&_.ant-select-selector]:border-gray-200"
            options={requests.map((item) => ({
              value: item.type,
              label: item.value,
            }))}
            bordered={false}
            onChange={handleChange}
            data-cy="dashboard-approval-status-select"
          /> */}

          <Button
            type="primary"
            size="small"
            className="inline-flex items-center gap-1 px-3 md:py-2 py-0 rounded-sm font-medium shadow-none"
            data-cy="dashboard-approval-status-personal-pill"
            icon={
              approverType === 'Personal' ? (
                <MdOutlineAssignmentInd />
              ) : (
                <MdOutlineGroups />
              )
            }
            onClick={() =>
              handleChange(approverType === 'Personal' ? 'Leave' : 'Personal')
            }
          >
            {approverType !== 'Personal' ? 'My Leave' : 'All Leaves'}
          </Button>
        </div>
      </div>
      <div
        className="h-[210px] overflow-y-auto scrollbar-none"
        data-cy="dashboard-approval-status-content"
      >
        {approverType === 'Personal' ? (
          <MyLeaveRequestDashboard />
        ) : approverType === 'BranchTransfer' ? (
          isLoadingBranchTransfer ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingBranchTransfer}
              data-cy="dashboard-approval-status-branch-transfer-card"
            >
              <div style={{ height: 250 }} />
            </Card>
          ) : BranchTransferData?.items?.length ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingBranchTransfer}
              data-cy="dashboard-approval-status-branch-transfer-card"
            >
              {BranchTransferData.items.map((request: any, index: number) => (
                <ApprovalRequestCard
                  isLoading={isLoadingBranchTransfer}
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
          isLoadingLeaveTransfer ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingLeaveTransfer}
              data-cy="dashboard-approval-status-leave-card"
            >
              <div style={{ height: 250 }} />
            </Card>
          ) : LeaveTransferData?.items?.length ? (
            <Card
              className="border-0"
              bodyStyle={{ padding: '0px', margin: '0px', border: 'none' }}
              loading={isLoadingLeaveTransfer}
              data-cy="dashboard-approval-status-leave-card"
            >
              {LeaveTransferData.items.map((request: any, index: number) => (
                <ApprovalRequestCard
                  isLoading={isLoadingLeaveTransfer}
                  key={index}
                  id={request.id}
                  name={request.name}
                  days={request.days}
                  approveRequesterId={request.userId}
                  startAt={request.startAt}
                  endAt={request.endAt}
                  isHalfDay={request.isHalfDay}
                  leaveType={request?.leaveType?.title || '-'}
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
