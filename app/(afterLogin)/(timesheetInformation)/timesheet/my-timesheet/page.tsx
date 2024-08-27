'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { AiOutlineReload } from 'react-icons/ai';
import { LuPlus } from 'react-icons/lu';
import HistoryTable from './_components/historyTable';
import AttendanceTable from './_components/attendanceTable';
import LeaveBalance from './_components/leaveBalance';
import ViewAttendanceSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/viewAttendanceSidebar';
import NewLeaveRequestSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/newLeaveRequestSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CheckOutSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/checkOutSidebar';
import CheckControl from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/checkControls/inedx';

const MyTimesheet = () => {
  const { setIsShowNewLeaveRequestSidebar } = useMyTimesheetStore();

  return (
    <>
      <div className="h-auto w-auto pr-6 pb-6 pl-3">
        <PageHeader title="My Attendance" description="Manage your Attendance">
          <CheckControl />
        </PageHeader>

        <div className="mt-6">
          <LeaveBalance />
        </div>

        <BlockWrapper className="mt-[30px]">
          <div className="flex items-center mb-6">
            <div className="flex-1 flex items-center gap-0.5">
              <div className="text-2xl font-bold text-gray-900">
                Leave History
              </div>
              <Button
                type="text"
                size="small"
                icon={<AiOutlineReload size={14} className="text-gray-600" />}
              ></Button>
            </div>

            <Button
              size="large"
              type="primary"
              icon={<LuPlus size={16} />}
              className="h-12"
              onClick={() => setIsShowNewLeaveRequestSidebar(true)}
            >
              Add New Request
            </Button>
          </div>

          <HistoryTable />
        </BlockWrapper>

        <BlockWrapper className="mt-6">
          <div className="flex items-center gap-0.5 mb-6">
            <div className="text-2xl font-bold text-gray-900">Attendance</div>
            <Button
              type="text"
              size="small"
              icon={<AiOutlineReload size={14} className="text-gray-600" />}
            ></Button>
          </div>

          <AttendanceTable />
        </BlockWrapper>
      </div>

      <ViewAttendanceSidebar />
      <NewLeaveRequestSidebar />
      <CheckOutSidebar />
    </>
  );
};

export default MyTimesheet;
