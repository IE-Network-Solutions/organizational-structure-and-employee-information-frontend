'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button } from 'antd';
import ClosedDateTable from './_components/closedDateTable';
import ClosedDateSidebar from './_components/closedDateSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } =
    useTimesheetSettingsStore();

  return (
    <div className="p-5 rounded-2xl bg-white ">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">Closed Date</h1>

        <AccessGuard permissions={[Permissions.CreateClosedDate]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            className="h-10 w-10 sm:w-auto"
            onClick={() => {
              setSelectedClosedDate(null);
              setIsShowClosedDateSidebar(true);
            }}
          >
            <span className="hidden sm:inline"> New Closed Date</span>
          </Button>
        </AccessGuard>
      </div>

      <div className="w-full overflow-x-auto scrollbar-none">
        <ClosedDateTable />
      </div>

      <ClosedDateSidebar />
    </div>
  );
};

export default Page;
