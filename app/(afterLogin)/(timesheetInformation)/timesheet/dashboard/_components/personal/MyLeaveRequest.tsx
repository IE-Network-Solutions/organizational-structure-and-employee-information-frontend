import { useGetUserLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Card, Skeleton, Tag } from 'antd';
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
    <Card
      bodyStyle={{ padding: '10px 16px' }}
      className="shadow"
      id="time-attendance-personal-leave-request-card-container"
      data-cy="time-attendance-personal-leave-request-card-container"
    >
      <div
        className="flex justify-between items-center mb-2"
        id="time-attendance-personal-leave-request-header-row"
        data-cy="time-attendance-personal-leave-request-header-row"
      >
        <h3
          className="text-[16px] font-semibold"
          id="time-attendance-personal-leave-request-title-heading"
          data-cy="time-attendance-personal-leave-request-title-heading"
        >
          My Leave Requests
        </h3>
        <Button
          onClick={() => setIsShowLeaveRequestSidebar(true)}
          type="primary"
          id="time-attendance-personal-leave-request-action-button"
          data-cy="time-attendance-personal-leave-request-action-button"
        >
          <span
            data-cy="dashboard-components-personal-myleaverequest-tsx-myleaverequest-span-63"
            className="hidden md:block"
          >
            Request
          </span>
        </Button>
      </div>
      <div
        className="flex flex-col h-48 overflow-y-auto scrollbar-none"
        id="time-attendance-personal-leave-request-list-scroll"
        data-cy="time-attendance-personal-leave-request-list-scroll"
      >
        {isLoading && (
          <div
            className="flex justify-center items-center h-full"
            id="time-attendance-personal-leave-request-loading-state"
            data-cy="time-attendance-personal-leave-request-loading-state"
          >
            <Skeleton
              active
              data-cy="time-attendance-personal-leave-request-loading-spin"
            />
          </div>
        )}
        {leaveRequests?.myLeaveRequests?.length === 0 && (
          <div
            className="flex justify-center items-center h-full"
            id="time-attendance-personal-leave-request-empty-state"
            data-cy="time-attendance-personal-leave-request-empty-state"
          >
            <p
              className="text-sm text-gray-500 font-semibold"
              id="time-attendance-personal-leave-request-empty-text"
              data-cy="time-attendance-personal-leave-request-empty-text"
            >
              No leave requests found
            </p>
          </div>
        )}
        {leaveRequests?.myLeaveRequests?.map((req: LeaveRequest) => {
          const status =
            req.status.charAt(0).toUpperCase() + req.status.slice(1);
          return (
            <div
              key={req.id}
              className="mb-2 border p-2 rounded-md"
              id={`time-attendance-personal-leave-request-record-${req.id}`}
              data-cy={`time-attendance-personal-leave-request-record-${req.id}`}
            >
              <div
                className="flex justify-between items-center"
                id={`time-attendance-personal-leave-request-record-${req.id}-content-row`}
                data-cy={`time-attendance-personal-leave-request-record-${req.id}-content-row`}
              >
                <div
                  id={`time-attendance-personal-leave-request-record-${req.id}-info-column`}
                  data-cy={`time-attendance-personal-leave-request-record-${req.id}-info-column`}
                >
                  <p
                    className=" text-sm font-normal"
                    id={`time-attendance-personal-leave-request-record-${req.id}-type-text`}
                    data-cy={`time-attendance-personal-leave-request-record-${req.id}-type-text`}
                  >
                    {req.leaveType.title}
                  </p>
                  <p
                    className="font-medium text-sm"
                    id={`time-attendance-personal-leave-request-record-${req.id}-date-range-text`}
                    data-cy={`time-attendance-personal-leave-request-record-${req.id}-date-range-text`}
                  >
                    {formatDateRange(req.startDate, req.endDate)}
                  </p>
                </div>
                <div
                  className="flex flex-col justify-end items-end"
                  id={`time-attendance-personal-leave-request-record-${req.id}-meta-column`}
                  data-cy={`time-attendance-personal-leave-request-record-${req.id}-meta-column`}
                >
                  <p
                    className="text-xs"
                    id={`time-attendance-personal-leave-request-record-${req.id}-requested-label`}
                    data-cy={`time-attendance-personal-leave-request-record-${req.id}-requested-label`}
                  >
                    Requested on{' '}
                    <strong
                      id={`time-attendance-personal-leave-request-record-${req.id}-requested-value`}
                      data-cy={`time-attendance-personal-leave-request-record-${req.id}-requested-value`}
                    >
                      {dayjs(req.createdAt).format('D MMM YYYY')}
                    </strong>
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
                    id={`time-attendance-personal-leave-request-record-${req.id}-status-tag`}
                    data-cy={`time-attendance-personal-leave-request-record-${req.id}-status-tag`}
                  >
                    {status}
                  </Tag>{' '}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <LeaveRequestSidebar data-cy="time-attendance-personal-leave-request-sidebar-component" />
    </Card>
  );
};

export default MyLeaveRequest;
