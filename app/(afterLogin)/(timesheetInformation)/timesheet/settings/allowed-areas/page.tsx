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
      <PageHeader title="Allowed Areas" size="small">
        <AccessGuard permissions={[Permissions.CreateAllowedArea]}>
          <Button
            icon={<LuPlus size={18} />}
            type="primary"
            size="large"
            id="newLocationCreateButtonId"
            onClick={() => setIsShowLocationSidebar(true)}
          >
            New Location
          </Button>
        </AccessGuard>
      </PageHeader>
      <div className="mt-6">
        {data &&
          data.items.map((item) => <AreaCard key={item.id} item={item} />)}
      </div>

      <LocationSidebar />
    </>
  );
};

export default Page;
