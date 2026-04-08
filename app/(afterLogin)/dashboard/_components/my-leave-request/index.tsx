/* Dashboard My Leave Request component */
'use client';

import React from 'react';
import { Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';

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
    return startDate.format('MMM D, YYYY');
  }

  return `${startDate.format('MMM D')} - ${endDate.format('MMM D, YYYY')}`;
};

const MyLeaveRequestSkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="flex items-center justify-between rounded-lg px-3 py-2 bg-white border border-gray-200"
    data-cy={`dashboard-my-leave-request-record-skeleton-${index}`}
  >
    <div
      className="flex flex-col gap-0.5 flex-1 pr-2"
      data-cy={`dashboard-my-leave-request-record-skeleton-${index}-details`}
    >
      <Skeleton.Input active size="small" className="!h-4 !w-48 !min-w-0" />
      <Skeleton.Input
        active
        size="small"
        className="!h-3 !w-[220px] !min-w-0"
      />
    </div>
    <Skeleton.Input
      active
      size="small"
      className="!h-6 !w-28 rounded-md !min-w-0"
      data-cy={`dashboard-my-leave-request-record-skeleton-${index}-status`}
    />
  </div>
);

const MyLeaveRequestDashboard: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: leaveRequests, isLoading } = useGetUserLeaveRequests(userId);

  const items = leaveRequests?.myLeaveRequests ?? [];

  return (
    <div
      className="shadow-none bg-white"
      data-cy="dashboard-my-leave-request-card"
    >
      <div
        className="flex flex-col gap-2  overflow-y-auto scrollbar-none"
        data-cy="dashboard-my-leave-request-list"
      >
        {isLoading ? (
          <div
            className="flex flex-col gap-2 px-3"
            data-cy="dashboard-my-leave-request-loading"
          >
            {Array.from({ length: 4 }).map((unusedValue, index) => {
              // `unusedValue` is only needed to satisfy linting rules.
              void unusedValue;
              return <MyLeaveRequestSkeletonRow key={index} index={index} />;
            })}
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <div
            className="flex justify-center items-center h-24"
            data-cy="dashboard-my-leave-request-empty"
          >
            <p
              className="text-xs text-gray-500 font-medium"
              data-cy="dashboard-my-leave-request-empty-text"
            >
              No leave requests found
            </p>
          </div>
        ) : null}

        {!isLoading &&
          items.map((req: LeaveRequest) => {
            const status =
              req.status.charAt(0).toUpperCase() + req.status.slice(1);

            const statusClasses =
              status === 'Approved'
                ? 'bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]'
                : status === 'Pending'
                  ? 'bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]'
                  : 'bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]';

            return (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 bg-white border border-gray-200"
                data-cy={`dashboard-my-leave-request-record-${req.id}`}
              >
                <div
                  className="flex flex-col gap-0.5"
                  data-cy={`dashboard-my-leave-request-record-${req.id}-details`}
                >
                  <span
                    className="text-[12px] font-semibold text-gray-800"
                    data-cy={`dashboard-my-leave-request-record-${req.id}-leave-type`}
                  >
                    {req.leaveType.title}
                  </span>
                  <span
                    className="text-[12px] text-gray-500"
                    data-cy={`dashboard-my-leave-request-record-${req.id}-date-range`}
                  >
                    {formatDateRange(req.startDate, req.endDate)} ({req.days}{' '}
                    {req.days === 1 ? 'day' : 'days'}
                    {req.isHalfday ? ', half day' : ''})
                  </span>
                </div>
                <div
                  className="flex items-center justify-end"
                  data-cy={`dashboard-my-leave-request-record-${req.id}-status`}
                >
                  <Tag
                    className={`text-[12px] font-medium px-2 py-0 rounded-md ${statusClasses}`}
                    style={{ marginInlineEnd: 0 }}
                    data-cy={`dashboard-my-leave-request-record-${req.id}-status-tag`}
                  >
                    {status}
                  </Tag>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MyLeaveRequestDashboard;
