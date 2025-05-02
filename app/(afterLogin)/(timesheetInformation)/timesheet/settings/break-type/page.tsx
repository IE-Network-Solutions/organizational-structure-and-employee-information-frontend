'use client';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button } from 'antd';
import React from 'react';
import BreakTypeSidebar from './_component/brakTypeSidebar';
import BreakTypeTable from './_component/breakTypeTable/inex';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const { setIsShowBreakTypeSidebar } = useTimesheetSettingsStore();

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">Break Type</h1>

        <AccessGuard permissions={[Permissions.CreateBreakType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {
              setIsShowBreakTypeSidebar(true);
            }}
          >
            <span className="hidden md:inline"> New Break Type</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="w-full overflow-x-auto scrollbar-none">
        <BreakTypeTable />
      </div>
      <BreakTypeSidebar />
    </div>
  );
};

export default Page;
