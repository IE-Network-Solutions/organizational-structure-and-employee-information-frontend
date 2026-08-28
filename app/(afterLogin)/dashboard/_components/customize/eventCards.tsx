'use client';

import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

/**
 * The four celebration cards used to live inside a single `EventsCard` row.
 * They are split into standalone widgets so each one can be shown, hidden,
 * moved and resized on its own. React Query dedupes the shared requests.
 */

export function BirthdaysWidget() {
  const { data, isLoading } = useGetBirthDay();
  return (
    <CardList
      type="birthday"
      title="Today's Birthday"
      people={data || []}
      loading={isLoading}
    />
  );
}

export function WorkAnniversariesWidget() {
  const { data, isLoading } = useGetWorkAnniversary();
  return (
    <CardList
      type="anniversary"
      title="Work Anniversary"
      people={data || []}
      loading={isLoading}
    />
  );
}

export function LeaderOfTheWeekWidget() {
  const { data, isLoading } = useGetWeeklyLeader();
  return (
    <CardList
      type="Leader"
      title="Leader of the Week"
      people={data || []}
      loading={isLoading}
    />
  );
}

export function EmployeeOfTheWeekWidget() {
  const { data, isLoading } = useGetRockStar();
  return (
    <CardList
      type="Employee"
      title="Employee of the Week"
      people={data || []}
      loading={isLoading}
    />
  );
}
