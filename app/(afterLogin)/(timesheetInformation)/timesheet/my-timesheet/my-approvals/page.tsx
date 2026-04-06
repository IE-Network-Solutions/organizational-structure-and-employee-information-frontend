'use client';

import ApprovalTable from '../_components/approvalTable';

export default function MyApprovalsPage() {
  return (
    <div
      id="time-attendance-my-timesheet-my-approvals-page"
      data-cy="time-attendance-my-timesheet-my-approvals-page"
    >
      <ApprovalTable />
    </div>
  );
}
