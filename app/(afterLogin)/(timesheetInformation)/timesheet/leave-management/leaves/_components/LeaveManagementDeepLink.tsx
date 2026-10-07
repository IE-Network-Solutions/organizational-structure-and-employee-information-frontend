'use client';

import { useEffect, useRef } from 'react';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import { useGetSingleLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';

/** Opens the leave detail modal when arriving from a notification deep link. */
export default function LeaveManagementDeepLink() {
  const { leaveRequestId, approvalWorkflowId } = useNotificationDeepLink();
  const {
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
    setIsShowLeaveRequestManagementSidebar,
  } = useLeaveManagementStore();
  const openedRef = useRef<string | null>(null);

  const needsWorkflowLookup = !!leaveRequestId && !approvalWorkflowId;
  const { data: singleLeaveData, isFetched: singleLeaveFetched } =
    useGetSingleLeaveRequest(needsWorkflowLookup ? leaveRequestId : '');

  useEffect(() => {
    if (!leaveRequestId) return;
    if (openedRef.current === leaveRequestId) return;

    const workflowFromLeave = (
      singleLeaveData?.items as { approvalWorkflowId?: string } | undefined
    )?.approvalWorkflowId;
    const workflowId = approvalWorkflowId || workflowFromLeave;

    if (!workflowId && needsWorkflowLookup && !singleLeaveFetched) {
      return;
    }

    setLeaveRequestId(leaveRequestId);
    if (workflowId) {
      setLeaveRequestWorkflowId(workflowId);
    }
    setIsShowLeaveRequestManagementSidebar(true);
    openedRef.current = leaveRequestId;
  }, [
    leaveRequestId,
    approvalWorkflowId,
    needsWorkflowLookup,
    singleLeaveFetched,
    singleLeaveData,
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
    setIsShowLeaveRequestManagementSidebar,
  ]);

  return null;
}
