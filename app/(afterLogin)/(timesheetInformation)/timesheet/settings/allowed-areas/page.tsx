'use client';
import React from 'react';
import { useGetAllowedAreas } from '@/store/server/features/timesheet/allowedArea/queries';
import AreaCard from './_components/areaCard';
import LocationSidebar from './_components/locationSidebar';

const Page = () => {
  const { data } = useGetAllowedAreas();

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-allowed-areas-container"
      data-cy="time-attendance-settings-allowed-areas-container"
    >
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
