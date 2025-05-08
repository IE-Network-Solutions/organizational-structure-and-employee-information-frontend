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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg text-bold">Allowed Areas</h1>

        <AccessGuard permissions={[Permissions.CreateAllowedArea]}>
          <Button
            icon={<FaPlus />}
            className="h-10 w-10 sm:w-auto"
            type="primary"
            id="newLocationCreateButtonId"
            onClick={() => setIsShowLocationSidebar(true)}
          >
            <span className="hidden md:inline"> New Location</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="w-full overflow-x-auto scrollbar-none">
        {data &&
          data.items.map((item) => <AreaCard key={item.id} item={item} />)}
      </div>

      <LocationSidebar />
    </div>
  );
};

export default Page;
