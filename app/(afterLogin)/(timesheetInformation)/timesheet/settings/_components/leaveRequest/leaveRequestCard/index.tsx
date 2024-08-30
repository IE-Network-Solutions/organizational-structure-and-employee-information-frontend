import { Button, Checkbox, Space } from 'antd';
import UserCard from '@/components/common/userCard/userCard';
import RequestUserCard, { RequestUserCardProps } from './requestUserCard';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

const LeaveRequestCard = () => {
  const { setIsShowLeaveRequestSidebar } = useTimesheetSettingsStore();
  const statuses: RequestUserCardProps[] = [
    {
      name: 'Abeselom G/kidan',
      status: '/icons/status/verify.svg',
    },
    {
      name: 'Abeselom G/kidan',
      status: '/icons/status/information.svg',
    },
    {
      name: 'Abeselom G/kidan',
      status: '/icons/status/reject.svg',
    },
  ];

  return (
    <div
      className="flex items-center gap-2.5 border border-gray-200 rounded-lg p-4"
      onClick={() => setIsShowLeaveRequestSidebar(true)}
    >
      <Checkbox />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-gray-900 font-bold">Leave Request</div>
          <Space>
            <Button
              className="w-20  text-[10px] font-medium"
              size="small"
              danger
              type="primary"
            >
              Reject
            </Button>
            <Button
              className="w-20 text-[10px] font-medium bg-success"
              size="small"
              type="primary"
            >
              Approve
            </Button>
          </Space>
        </div>

        <div className="flex item-center gap-3 mb-1">
          <div className="text-xs text-gray-500">Requester:</div>
          <UserCard name="Abeselom G/kidanv" size="small" />
        </div>

        <div className="flex item-center gap-3 mb-1">
          <div className="text-xs text-gray-500">Leave type:</div>
          <div className="text-sm text-gray-900">Sick Leave</div>
        </div>

        <div className="flex item-center gap-3 mb-1">
          <div className="text-xs text-gray-500">Document:</div>
          <div className="text-sm text-gray-900">sick_leave.pdf</div>
        </div>

        <div className="flex item-center gap-3 mb-1">
          <div className="text-xs text-gray-500">Duration:</div>
          <div className="text-sm text-gray-900">01 Mar 2023 - 03 Mar 2023</div>
        </div>

        <div className="flex item-center gap-3 mb-1">
          <div className="text-xs text-gray-500">Note:</div>
          <div className="text-sm text-gray-900">
            I am feeling not normal which ...
          </div>
        </div>

        <div className="flex item-center gap-3">
          <div className="text-xs text-gray-500">Current Status:</div>
          <div className="flex-1 gap-4 flex">
            {statuses.map((status) => (
              <RequestUserCard
                key={status.status}
                name={status.name}
                status={status.status}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestCard;
