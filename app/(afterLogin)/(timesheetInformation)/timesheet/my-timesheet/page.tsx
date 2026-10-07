'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const MY_TIMESHEET_BASE = '/timesheet/my-timesheet';

function MyTimesheetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const tab = (searchParams.get('tab') ?? '').toLowerCase();
    const type = (searchParams.get('type') ?? '').toLowerCase();
    let dest = `${MY_TIMESHEET_BASE}/overview`;
    if (
      tab === 'my-approvals' ||
      tab === 'approvals' ||
      type === 'leave' ||
      type === 'workfromhome' ||
      type === 'work-from-home' ||
      type === 'wfh'
    ) {
      dest = `${MY_TIMESHEET_BASE}/my-approvals`;
    } else if (tab === 'leave') {
      dest = `${MY_TIMESHEET_BASE}/leave`;
    } else if (tab === 'attendance') {
      dest = `${MY_TIMESHEET_BASE}/attendance`;
    } else if (tab === 'work-from-home' || tab === 'wfh') {
      dest = `${MY_TIMESHEET_BASE}/work-from-home`;
    }
    router.replace(qs ? `${dest}?${qs}` : dest);
  }, [router, searchParams]);

  return null;
}

export default MyTimesheetPage;
