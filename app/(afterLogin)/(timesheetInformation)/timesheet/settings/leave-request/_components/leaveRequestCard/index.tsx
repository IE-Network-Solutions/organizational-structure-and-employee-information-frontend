import { Button, Checkbox, Space, Spin } from 'antd';
import UserCard from '@/components/common/userCard/userCard';
import RequestUserCard, { RequestUserCardProps } from './requestUserCard';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { LeaveRequest, LeaveRequestStatus } from '@/types/timesheet/settings';
import { FC } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useSetStatusToLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';

interface LeaveRequestCardProps {
  item: LeaveRequest;
}

const LeaveRequestCard: FC<LeaveRequestCardProps> = ({ item }) => {
  const { setIsShowLeaveRequestSidebar, setLeaveRequestId } =
    useTimesheetSettingsStore();
  const { mutate: changeStatus, isLoading } = useSetStatusToLeaveRequest();

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
    <Spin spinning={isLoading}>
      <div
        className="flex items-center gap-2.5 border border-gray-200 rounded-lg p-4"
        onClick={() => {
          setLeaveRequestId(item.id);
          setIsShowLeaveRequestSidebar(true);
        }}
      >
        <Checkbox disabled={true} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-gray-900 font-bold">Leave Request</div>
            <Space>
              <Button
                className="w-20  text-[10px] font-medium"
                size="small"
                danger
                type="primary"
                id={`${item.id}leaveRequestRejectButtonFieldId`} 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeStatus({
                    leaveRequestId: item.id,
                    status: LeaveRequestStatus.DECLINED,
                  });
                }}
              >
                Reject
              </Button>
              <Button
                className="w-20 text-[10px] font-medium bg-success"
                size="small"
                id={`${item.id}leaveRequestApproveButtonFieldId`} 
                type="primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeStatus({
                    leaveRequestId: item.id,
                    status: LeaveRequestStatus.APPROVED,
                  });
                }}
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
            <div className="text-sm text-gray-900">
              {item.leaveType
                ? typeof item.leaveType !== 'string'
                  ? item.leaveType.title
                  : ''
                : ''}
            </div>
          </div>

          {item.justificationDocument && (
            <div className="flex item-center gap-3 mb-1">
              <div className="text-xs text-gray-500">Document:</div>
              <div className="text-sm text-gray-900">sick_leave.pdf</div>
            </div>
          )}

          <div className="flex item-center gap-3 mb-1">
            <div className="text-xs text-gray-500">Duration:</div>
            <div className="text-sm text-gray-900">
              {' '}
              {dayjs(item.startAt).format(DATE_FORMAT)} - &nbsp;
              {dayjs(item.endAt).format(DATE_FORMAT)}
            </div>
          </div>

          <div className="flex item-center gap-3 mb-1">
            <div className="text-xs text-gray-500">Note:</div>
            <div className="text-sm text-gray-900">
              {item.justificationNote}
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
    </Spin>
  );
};

export default LeaveRequestCard;
