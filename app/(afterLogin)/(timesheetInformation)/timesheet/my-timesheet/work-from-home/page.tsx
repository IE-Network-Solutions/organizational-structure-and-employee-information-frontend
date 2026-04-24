'use client';

import { useSearchParams } from 'next/navigation';
import WorkFromHomeMyRequestsTable from '../_components/workFromHome/WorkFromHomeMyRequestsTable';

export default function WorkFromHomePage() {
  const searchParams = useSearchParams();
  const scope = searchParams.get('scope');
  const showAllEmployees = scope === 'all';

  return (
    <div
      className="space-y-2 w-full max-w-full"
      id="time-attendance-my-timesheet-work-from-home-page"
      data-cy="time-attendance-my-timesheet-work-from-home-page"
    >
      <div className="pt-4" data-cy="my-timesheet-wfh-requests-panel">
        <WorkFromHomeMyRequestsTable showAllEmployees={showAllEmployees} />
      </div>
    </div>
  );
}
