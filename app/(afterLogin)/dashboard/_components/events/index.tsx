import React from 'react';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';

export default function EventsCard() {
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();

  return (
    <div
      className="flex flex-nowrap gap-4 pb-5 overflow-x-auto overflow-y-visible scrollbar-none md:grid md:grid-cols-12 overscroll-x-contain"
      data-cy="dashboard-left-bar-cards"
    >
      <div
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-6 overscroll-x-contain"
        data-cy="dashboard-card-birthday"
      >
        <CardList
          type="birthday"
          title="Today's Birthday"
          people={birthDays || []}
          loading={birthdayLoading}
        />
      </div>
      <div
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-6 overscroll-x-contain"
        data-cy="dashboard-card-anniversary"
      >
        <CardList
          type="anniversary"
          title="Work Anniversary"
          people={workAnniversary || []}
          loading={workLoading}
        />
      </div>
    </div>
  );
}
