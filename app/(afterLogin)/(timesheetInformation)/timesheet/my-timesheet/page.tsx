'use client';

import { redirect } from 'next/navigation';

const MY_TIMESHEET_BASE = '/timesheet/my-timesheet';

function MyTimesheetPage() {
  redirect(`${MY_TIMESHEET_BASE}/overview`);
  return null;
}

export default MyTimesheetPage;
