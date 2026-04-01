'use client';
import React from 'react';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import CarryOverCard from './_components/carryOverCard';
import CarryOverSidebar from './_components/carryOverSidebar';

const Page = () => {
  const { data } = useGetCarryOverRules();
  return (
    <div
      id="time-attendance-settings-carry-over-rule-container"
      data-cy="time-attendance-settings-carry-over-rule-container"
    >
      {/* Scrollable Container for Horizontal Scroll */}
      <div
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border border-[#D9D9D9] rounded-lg p-4"
        id="time-attendance-settings-carry-over-rule-cards-container"
        data-cy="time-attendance-settings-carry-over-rule-cards-container"
      >
        {data &&
          data.items.map((item) => (
            <CarryOverCard
              key={item.id}
              item={item}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}`}
            />
          ))}
      </div>
      <CarryOverSidebar data-cy="time-attendance-settings-carry-over-rule-sidebar" />
    </div>
  );
};

export default Page;
