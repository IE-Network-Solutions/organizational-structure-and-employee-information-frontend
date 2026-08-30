'use client';

import React from 'react';
import CardList from '../card-list';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

/** Leader / Employee of the Week — stacked under attendance. */
export default function WeeklyRecognitionCards() {
  const { data: rockStarData, isLoading: rockLoading } = useGetRockStar();
  const { data: weeklyLeaderData, isLoading: leaderLoading } =
    useGetWeeklyLeader();

  return (
    <div
      className="flex flex-col gap-4"
      data-cy="dashboard-weekly-recognition-cards"
    >
      <div data-cy="dashboard-card-weekly-leader">
        <CardList
          type="Leader"
          title="Leader of the Week"
          people={weeklyLeaderData || []}
          loading={leaderLoading}
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
