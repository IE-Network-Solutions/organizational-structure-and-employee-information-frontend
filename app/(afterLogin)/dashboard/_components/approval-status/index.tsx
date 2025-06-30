// components/ApprovalStatus.tsx
import { FC } from 'react';
import { Select } from 'antd';
import ApprovalRequestCard from './approval-status-card';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { useDashboardApprovalStore } from '@/store/uistate/features/dashboard/approval';
import { useGetBranchTransferApproveById } from '@/store/server/features/employees/approval/queries';

const ApprovalStatus: FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: LeaveTransferData } = useGetApprovalLeaveRequest(userId, 1, 4);
  const { data: BranchTransferData } = useGetBranchTransferApproveById(
    userId,
    4,
    1,
  );
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
    <div className="bg-white p-3 rounded-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">Approval Status</h4>
        <div className="flex items-center space-x-1 text-sm text-gray-500 cursor-pointer">
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
          />
        </div>
      </div>
      <div className="max-h-[250px] min-h-[250px] overflow-y-auto scrollbar-none">
        {approverType === 'BranchTransfer' ? (
          BranchTransferData?.items?.length ? (
            <div>
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
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[250px]">
              <div className="text-xl font-thin">No Approval Found</div>
            </div>
          )
        ) : approverType === 'Leave' ? (
          LeaveTransferData?.items?.length ? (
            <div>
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
                  leaveType={request.leaveType.title}
                  approvalWorkflowId={request.approvalWorkflowId}
                  nextApprover={request.nextApprover?.[0]?.stepOrder}
                  requestType={approverType}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[250px]">
              <div className="text-xl font-thin">No Approval Found</div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center min-h-[250px]">
            <div className="text-xl font-thin">No Approval Found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
