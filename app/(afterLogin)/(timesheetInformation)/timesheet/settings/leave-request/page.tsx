'use client';
import React from 'react';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Spin } from 'antd';
import LeaveRequestCard from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/leaveRequest/leaveRequestCard';
import LeaveRequestSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/leaveRequest/leaveRequestSidebar';

const Page = () => {
  const { data, isFetching } = useGetLeaveRequest(
    { page: '1', limit: '100' },
    {
      filter: {
        status: LeaveRequestStatus.PENDING,
      },
    },
  );
  return (
    <>
      <PageHeader title="Leave Requests" size="small" />

      {data &&
        data.items?.map((item) => (
          <div className="mt-6" key={item.id}>
            <Spin spinning={isFetching}>
              <LeaveRequestCard item={item} />
            </Spin>
          </div>
        ))}

      <LeaveRequestSidebar />
    </>
  );
};

export default Page;
