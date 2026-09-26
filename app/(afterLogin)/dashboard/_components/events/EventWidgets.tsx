'use client';

import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

export function BirthdayEventCard() {
  const { data: birthDays, isLoading } = useGetBirthDay();
  return (
    <CardList
      type="birthday"
      title="Today's Birthday"
      people={birthDays || []}
      loading={isLoading}
    />
  );
}

export function AnniversaryEventCard() {
  const { data: workAnniversary, isLoading } = useGetWorkAnniversary();
  return (
    <CardList
      type="anniversary"
      title="Work Anniversary"
      people={workAnniversary || []}
      loading={isLoading}
    />
  );
}

export function WeeklyLeaderEventCard() {
  const { data: weeklyLeaderData, isLoading } = useGetWeeklyLeader();
  return (
    <CardList
      type="Leader"
      title="Leader of the Week"
      people={weeklyLeaderData || []}
      loading={isLoading}
    />
  );
}

export function RockstarEventCard() {
  const { data: rockStarData, isLoading } = useGetRockStar();
  return (
    <CardList
      type="Employee"
      title="Employee of the Week"
      people={rockStarData || []}
      loading={isLoading}
    />
  );
}
