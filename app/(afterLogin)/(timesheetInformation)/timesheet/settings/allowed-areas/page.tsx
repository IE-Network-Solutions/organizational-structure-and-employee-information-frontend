'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import { Button } from 'antd';
import AreaCard from './_components/areaCard';
import LocationSidebar from './_components/locationSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const { setIsShowLocationSidebar } = useTimesheetSettingsStore();
  const { data } = useGetAllowedAreas();

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-allowed-areas-container"
      data-cy="time-attendance-settings-allowed-areas-container"
    >
      <div
        className="flex items-center justify-between mb-4"
        id="time-attendance-settings-allowed-areas-header"
        data-cy="time-attendance-settings-allowed-areas-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-allowed-areas-title"
          data-cy="time-attendance-settings-allowed-areas-title"
        >
          Allowed Areas
        </h1>

        <AccessGuard
          permissions={[Permissions.CreateAllowedArea]}
          data-cy="time-attendance-settings-allowed-areas-add-button-access-guard"
        >
          <Button
            icon={
              <FaPlus data-cy="time-attendance-settings-allowed-areas-add-button-icon" />
            }
            className="h-10 w-10 sm:w-auto"
            type="primary"
            id="time-attendance-settings-allowed-areas-add-button"
            data-cy="time-attendance-settings-allowed-areas-add-button"
            onClick={() => setIsShowLocationSidebar(true)}
          >
            <span
              id="time-attendance-settings-allowed-areas-add-button-label"
              data-cy="time-attendance-settings-allowed-areas-add-button-label"
              className="hidden md:inline"
            >
              {' '}
              New Location
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="w-full overflow-x-auto scrollbar-none"
        id="time-attendance-settings-allowed-areas-cards-container"
        data-cy="time-attendance-settings-allowed-areas-cards-container"
      >
        {data &&
          data.items.map((item) => (
            <AreaCard
              key={item.id}
              item={item}
              data-cy={`time-attendance-settings-allowed-areas-card-${item.id}`}
            />
          ))}
      </div>

      <LocationSidebar data-cy="time-attendance-settings-allowed-areas-sidebar" />
    </div>
  );
};

export default Page;
