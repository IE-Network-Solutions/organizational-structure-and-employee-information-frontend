import { useGetUserLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Card, Spin, Tag } from 'antd';
import React from 'react';
import dayjs from 'dayjs';
import LeaveRequestSidebar from '../../../my-timesheet/_components/leaveRequestSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';

interface LeaveRequest {
  id: string;
  leaveType: {
    id: string;
    title: string;
    description: string;
  };
  status: string;
  startDate: string;
  endDate: string;
  days: number;
  isHalfday: boolean;
  createdAt: string;
  updatedAt: string;
}
const formatDateRange = (startDateStr: string, endDateStr: string): string => {
  const startDate = dayjs(startDateStr);
  const endDate = dayjs(endDateStr);

  if (startDate.isSame(endDate, 'day')) {
    return startDate.format('D MMM YYYY');
  }
  return `${startDate.format('D')} - ${endDate.format('D MMM YYYY')}`;
};

const MyLeaveRequest: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: leaveRequests, isLoading } = useGetUserLeaveRequests(userId);
  const { setIsShowLeaveRequestSidebar } = useMyTimesheetStore();
  return (
    <Card bodyStyle={{ padding: '10px 16px' }} className="shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[16px] font-semibold">My Leave Requests</h3>
        <Button
          onClick={() => setIsShowLeaveRequestSidebar(true)}
          type="primary"
        >
          Request
        </Button>
      </div>
      <div className="flex flex-col h-48 overflow-y-auto scrollbar-none">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        )}
        {leaveRequests?.myLeaveRequests?.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-500 font-semibold">
              No leave requests found
            </p>
          </div>
        )}
        {leaveRequests?.myLeaveRequests?.map((req: LeaveRequest) => {
          const status =
            req.status.charAt(0).toUpperCase() + req.status.slice(1);
          return (
            <div key={req.id} className="mb-2 border p-2 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className=" text-sm font-normal">{req.leaveType.title}</p>
                  <p className="font-medium text-sm">
                    {formatDateRange(req.startDate, req.endDate)}
                  </p>
                </div>
                <div className="flex flex-col justify-end items-end">
                  <p className="text-xs">
                    Requested on
                    <strong>{dayjs(req.createdAt).format('D MMM YYYY')}</strong>
                  </p>
                  <Tag
                    style={{ marginInlineEnd: 0, border: 'none' }}
                    className={
                      status === 'Approved'
                        ? ' bg-green-500/20 text-green-700 font-semibold'
                        : status === 'Pending'
                          ? 'text-yellow-500 bg-yellow-500/20 font-semibold '
                          : 'text-red-500 bg-red-500/20 font-semibold'
                    }
                  >
                    {status}
                  </Tag>{' '}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <LeaveRequestSidebar />
    </Card>
  );
};

export default MyLeaveRequest;
