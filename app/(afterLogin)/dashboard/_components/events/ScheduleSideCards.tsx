'use client';

import React from 'react';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

/** Birthday, Leader, Anniversary, Employee — stacked beside Schedules. */
export default function ScheduleSideCards() {
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();
  const { data: rockStarData, isLoading: rockLoading } = useGetRockStar();
  const { data: weeklyLeaderData, isLoading: leaderLoading } =
    useGetWeeklyLeader();

  return (
    <div
      className="flex h-full flex-col gap-4"
      data-cy="dashboard-schedule-side-cards"
    >
      <div data-cy="dashboard-card-birthday">
        <CardList
          type="birthday"
          title="Today's Birthday"
          people={birthDays || []}
          loading={birthdayLoading}
        />
      </div>
      <div data-cy="dashboard-card-weekly-leader">
        <CardList
          type="Leader"
          title="Leader of the Week"
          people={weeklyLeaderData || []}
          loading={leaderLoading}
        />
      </div>
      <div data-cy="dashboard-card-anniversary">
        <CardList
          type="anniversary"
          title="Work Anniversary"
          people={workAnniversary || []}
          loading={workLoading}
        />
      </div>
      <div data-cy="dashboard-card-rockstar">
        <CardList
          type="Employee"
          title="Employee of the Week"
          people={rockStarData || []}
          loading={rockLoading}
        />
      </div>
    </div>
  );
}
