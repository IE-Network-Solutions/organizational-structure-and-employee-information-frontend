'use client';

import {
  BirthdayEventCard,
  AnniversaryEventCard,
  WeeklyLeaderEventCard,
  RockstarEventCard,
} from './EventWidgets';

export default function EventsCard() {
  return (
    <div
      className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible scrollbar-none md:grid md:grid-cols-12 overscroll-x-contain"
      data-cy="dashboard-left-bar-cards"
    >
      <div className="min-w-0 md:col-span-3" data-cy="dashboard-card-birthday">
        <BirthdayEventCard />
      </div>
      <div
        className="min-w-0 md:col-span-3"
        data-cy="dashboard-card-anniversary"
      >
        <AnniversaryEventCard />
      </div>
      <div
        className="min-w-0 md:col-span-3"
        data-cy="dashboard-card-weekly-leader"
      >
        <WeeklyLeaderEventCard />
      </div>
      <div className="min-w-0 md:col-span-3" data-cy="dashboard-card-rockstar">
        <RockstarEventCard />
      </div>
    </div>
  );
}
