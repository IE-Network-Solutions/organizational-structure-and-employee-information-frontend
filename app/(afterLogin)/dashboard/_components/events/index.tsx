import React from 'react';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

export default function EventsCard() {
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();
  const { data: rockStarData } = useGetRockStar();
  const { data: weeklyLeaderData } = useGetWeeklyLeader();
  return (
    <div
      className="flex flex-nowrap gap-4 pb-5 overflow-x-auto overflow-y-visible scrollbar-none md:grid md:grid-cols-12 overscroll-x-contain"
      data-cy="dashboard-left-bar-cards"
    >
      <div
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-3 overscroll-x-contain"
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
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-3 overscroll-x-contain"
        data-cy="dashboard-card-anniversary"
      >
        <CardList
          type="anniversary"
          title="Work Anniversary"
          people={workAnniversary || []}
          loading={workLoading}
        />
      </div>
      <div
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-3 overscroll-x-contain"
        data-cy="dashboard-card-weekly-leader"
      >
        <CardList
          type="Leader"
          title="Leader of the Week"
          people={weeklyLeaderData || []}
          loading={workLoading}
        />
      </div>
      <div
        className="min-w-[260px] flex-none md:min-w-0 md:col-span-3 overscroll-x-contain"
        data-cy="dashboard-card-rockstar"
      >
        <CardList
          type="Employee"
          title="Employee of the Week"
          people={rockStarData || []}
          loading={workLoading}
        />
      </div>
    </div>
  );
}
