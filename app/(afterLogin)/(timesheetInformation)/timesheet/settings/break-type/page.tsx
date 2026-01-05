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
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-break-type-container"
      data-cy="time-attendance-settings-break-type-container"
    >
      <div
        className="flex justify-between mb-4"
        id="time-attendance-settings-break-type-header"
        data-cy="time-attendance-settings-break-type-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-break-type-title"
          data-cy="time-attendance-settings-break-type-title"
        >
          Break Type
        </h1>

        <AccessGuard
          permissions={[Permissions.CreateBreakType]}
          data-cy="time-attendance-settings-break-type-add-button-access-guard"
        >
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            data-cy="time-attendance-settings-break-type-add-button-id"
            icon={<FaPlus />}
            className="h-10 w-10 sm:w-auto"
            onClick={() => {
              setIsShowBreakTypeSidebar(true);
            }}
          >
            <span className="hidden md:inline"> New Break Type</span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="w-full overflow-x-auto scrollbar-none"
        id="time-attendance-settings-break-type-table-container"
        data-cy="time-attendance-settings-break-type-table-container"
      >
        <BreakTypeTable data-cy="time-attendance-settings-break-type-table" />
      </div>
      <BreakTypeSidebar data-cy="time-attendance-settings-break-type-sidebar" />
    </div>
  );
};

export default Page;
