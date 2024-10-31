// components/ApprovalStatus.tsx
import { FC } from 'react';
import { Empty, Select } from 'antd';
import ApprovalRequestCard from './approval-status-card';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetApprovalLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';

const ApprovalStatus: FC = () => {
  const { userId } = useAuthenticationStore();
  const { data } = useGetApprovalLeaveRequest(userId);

  const requests = [
    {
      type: 'Leave Request',
    },
  ];

  return (
    <div className="bg-white p-3 rounded-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="tex t-sm font-semibold">Approval Status</h4>
        <div className="flex items-center space-x-1 text-sm text-gray-500 cursor-pointer">
          <Select
            placeholder="select"
            allowClear
            className="min-w-10   text-sm font-semibold border-none"
            options={requests.map((item) => ({
              value: item.type,
              label: item.type,
            }))}
            defaultValue={requests[0].type}
            bordered={false}
          />
        </div>
      </div>
      <div className="md:h-[325px] overflow-y-auto scrollbar-none">
        {data?.items?.length ? (
          <div className="">
            {data?.items.map((request: any, index: number) => (
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
              />
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
