'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AreaCard from './_components/areaCard';
import LocationSidebar from './_components/locationSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Page = () => {
  const { setIsShowLocationSidebar } = useTimesheetSettingsStore();
  const { data } = useGetAllowedAreas();
  return (
    <>
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1/2 mb-4 ">
          <PageHeader title="Allowed Areas" size="small">
            <AccessGuard permissions={[Permissions.CreateAllowedArea]}>
              <Button
                icon={<LuPlus size={18} />}
                type="primary"
                size="large"
                id="newLocationCreateButtonId"
                onClick={() => setIsShowLocationSidebar(true)}
              >
                <span className="hidden md:inline"> New Location</span>
              </Button>
            </AccessGuard>
          </PageHeader>
        </div>
      </div>
      <div className="w-full overflow-x-auto p-2 mt-12">
        {data &&
          data.items.map((item) => <AreaCard key={item.id} item={item} />)}
      </div>

      <LocationSidebar />
    </>
  );
};

export default Page;
