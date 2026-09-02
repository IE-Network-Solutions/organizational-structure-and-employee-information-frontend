'use client';

import { useSearchParams } from 'next/navigation';

/** Query fields attached by `resolveNotificationPath` when a notification is opened. */
export function useNotificationDeepLink() {
  const searchParams = useSearchParams();
  const employeeId =
    searchParams.get('employeeId') || searchParams.get('userId') || '';
  return {
    employeeId: employeeId && employeeId !== 'all' ? employeeId : '',
    type: searchParams.get('type') || '',
    tab: searchParams.get('tab') || '',
    jobId: searchParams.get('jobId') || '',
    candidateId: searchParams.get('candidateId') || '',
    departmentId: searchParams.get('departmentId') || '',
    id: searchParams.get('id') || '',
    leaveRequestId: searchParams.get('leaveRequestId') || '',
    approvalWorkflowId: searchParams.get('approvalWorkflowId') || '',
  };
}
