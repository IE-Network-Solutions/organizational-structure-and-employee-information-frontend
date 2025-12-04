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
    <div
      className="p-5 rounded-2xl bg-white "
      id="time-attendance-settings-closed-date-container"
      data-cy="time-attendance-settings-closed-date-container"
    >
      <div
        className="flex justify-between mb-4"
        id="time-attendance-settings-closed-date-header"
        data-cy="time-attendance-settings-closed-date-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-closed-date-title"
          data-cy="time-attendance-settings-closed-date-title"
        >
          Closed Date
        </h1>

        <AccessGuard
          permissions={[Permissions.CreateClosedDate]}
          data-cy="time-attendance-settings-closed-date-add-button-access-guard"
        >
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            data-cy="time-attendance-settings-closed-date-add-button-id"
            icon={<FaPlus data-cy="time-attendance-settings-closed-date-add-button-icon" />}
            className="h-10 w-10 sm:w-auto"
            onClick={() => {
              setSelectedClosedDate(null);
              setIsShowClosedDateSidebar(true);
            }}
          >
            <span
              className="hidden sm:inline"
              id="time-attendance-settings-closed-date-add-button-label"
              data-cy="time-attendance-settings-closed-date-add-button-label"
            >
              New Closed Date
            </span>
          </Button>
        </AccessGuard>
      </div>

      <div
        className="w-full overflow-x-auto scrollbar-none"
        id="time-attendance-settings-closed-date-table-container"
        data-cy="time-attendance-settings-closed-date-table-container"
      >
        <ClosedDateTable data-cy="time-attendance-settings-closed-date-table" />
      </div>

      <ClosedDateSidebar data-cy="time-attendance-settings-closed-date-sidebar" />
    </div>
  );
};

export default Page;
