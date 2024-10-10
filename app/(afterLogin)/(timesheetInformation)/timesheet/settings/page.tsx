'use client';

import { redirect } from 'next/navigation';

const TimesheetSettings = () => {
  redirect('/timesheet/settings/closed-date');
  return null;
};

export default TimesheetSettings;
