import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import AreaCard from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/allowedAreas/areaCard';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import LocationSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/allowedAreas/locationSidebar';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';

const AllowedAreas = () => {
  const { setIsShowLocationSidebar } = useTimesheetSettingsStore();
  const { data } = useGetAllowedAreas(23.5, 44.5);
  return (
    <>
      <PageHeader title="Allowed Areas" size="small">
        <Button
          icon={<LuPlus size={18} />}
          type="primary"
          size="large"
          onClick={() => setIsShowLocationSidebar(true)}
        >
          New Location
        </Button>
      </PageHeader>
      <div className="mt-6">
        {data &&
          data.items.map((item) => <AreaCard key={item.id} item={item} />)}
      </div>

      <LocationSidebar />
    </>
  );
};

export default AllowedAreas;
