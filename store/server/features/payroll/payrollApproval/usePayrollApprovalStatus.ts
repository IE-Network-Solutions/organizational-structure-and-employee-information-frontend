import { useMemo } from 'react';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetPayrollApprovalByPayPeriodId,
  useGetPayrollApprovalLogs,
  useGetPayrollApprovalStatus,
  useGetPendingPayrollApprovals,
} from './queries';
import { getPendingApprovalForPeriod } from './payrollApprovalVisibility';

export type PayrollApprovalLevelStatus = {
  stepOrder: number;
  userId: string;
  displayUserId: string;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Waiting';
};

type ApprovalRecord = {
  approverId: string;
  userId: string;
  approvedUserId?: string;
  displayUserId?: string;
  stepOrder: number;
  status: 'Approved' | 'Rejected' | 'Pending';
};

type HistoricalLog = {
  stepOrder: number;
  action: string;
  approvedUserId: string;
  approvalWorkflowId?: string;
};

function normalizeArrayResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

function isApprovedAction(action?: string) {
  return String(action || '').toLowerCase() === 'approved';
}

function isRejectedAction(action?: string) {
  return String(action || '').toLowerCase() === 'rejected';
}

function resolveLevelStatus(
  approval: ApprovalRecord,
  historicalRecord?: HistoricalLog,
): PayrollApprovalLevelStatus['status'] {
  const hasHistoricalAction =
    historicalRecord &&
    (isApprovedAction(historicalRecord.action) ||
      isRejectedAction(historicalRecord.action));

  if (hasHistoricalAction) {
    return isApprovedAction(historicalRecord!.action) ? 'Approved' : 'Rejected';
  }

  const apiStatus = String(approval.status || '').toLowerCase();
  if (apiStatus === 'approved') return 'Approved';
  if (apiStatus === 'rejected') return 'Rejected';
  return 'Pending';
}

function buildMergedApprovalLevels(
  workflowApprovers: { stepOrder: number; userId: string }[],
  statusRecords: ApprovalRecord[],
  historicalLogs: HistoricalLog[],
  hasRequestStarted: boolean,
): PayrollApprovalLevelStatus[] {
  const statusByStep = new Map(
    statusRecords.map((record) => [Number(record.stepOrder), record]),
  );

  const sourceApprovers =
    workflowApprovers.length > 0
      ? workflowApprovers
      : statusRecords.map((record) => ({
          stepOrder: record.stepOrder,
          userId: record.userId,
        }));

  return [...sourceApprovers]
    .sort((a, b) => Number(a.stepOrder) - Number(b.stepOrder))
    .map((approver) => {
      const stepOrder = Number(approver.stepOrder);
      const historicalRecord = historicalLogs.find(
        (log) => Number(log.stepOrder) === stepOrder,
      );
      const statusRecord = statusByStep.get(stepOrder);
      const hasHistoricalAction =
        historicalRecord &&
        (isApprovedAction(historicalRecord.action) ||
          isRejectedAction(historicalRecord.action));

      if (hasHistoricalAction) {
        return {
          stepOrder,
          userId: approver.userId,
          displayUserId: historicalRecord!.approvedUserId,
          status: isApprovedAction(historicalRecord!.action)
            ? ('Approved' as const)
            : ('Rejected' as const),
        };
      }

      if (statusRecord) {
        return {
          stepOrder,
          userId: statusRecord.userId,
          displayUserId: statusRecord.userId,
          status: resolveLevelStatus(statusRecord, historicalRecord),
        };
      }

      return {
        stepOrder,
        userId: approver.userId,
        displayUserId: approver.userId,
        status: hasRequestStarted ? ('Pending' as const) : ('Waiting' as const),
      };
    });
}

function getUserFullName(
  users: { items?: { id: string; firstName?: string; middleName?: string; }[] } | undefined,
  userId: string,
) {
  const user = users?.items?.find((item) => item.id === userId);
  if (!user) return '';
  return `${user.firstName || ''} ${user.middleName || ''}`.trim();
}

function resolvePayrollWorkflowId(
  configuredWorkflows: { id: string }[],
  workflowFromPending?: string,
  workflowFromLogs?: string,
): string | undefined {
  if (!configuredWorkflows.length) {
    return workflowFromPending || workflowFromLogs;
  }

  const knownIds = new Set(configuredWorkflows.map((workflow) => workflow.id));

  if (workflowFromPending && knownIds.has(workflowFromPending)) {
    return workflowFromPending;
  }
  if (workflowFromLogs && knownIds.has(workflowFromLogs)) {
    return workflowFromLogs;
  }

  return configuredWorkflows[0]?.id;
}

export function usePayrollApprovalStatus(payPeriodId?: string) {
  const { data: payrollApproval, isLoading: isPayrollApprovalLoading } =
    useGetPayrollApprovalByPayPeriodId(payPeriodId);
  const { data: pendingApprovals } = useGetPendingPayrollApprovals(
    payPeriodId,
    1,
    10,
  );
  const { data: workflows, isLoading: isWorkflowLoading } = useApprovalFilter(
    100,
    1,
    '',
    '',
    '',
    APPROVALTYPES.PAYROLL,
  );
  const { data: users, isLoading: isUsersLoading } = useGetAllUsers();

  const configuredWorkflowItems = Array.isArray(workflows?.items)
    ? workflows.items
    : [];

  const pendingItem = getPendingApprovalForPeriod(pendingApprovals, payPeriodId || '');
  const requestId = payrollApproval?.id as string | undefined;

  const { data: approverLog, isLoading: isLogsLoading } =
    useGetPayrollApprovalLogs(requestId);

  const historicalLogsForWorkflow = normalizeArrayResponse<HistoricalLog>(approverLog);
  const hasApprovalLogs = historicalLogsForWorkflow.length > 0;
  const workflowFromPending = pendingItem?.approvalWorkflowId as string | undefined;
  const workflowFromLogs = historicalLogsForWorkflow.find(
    (log) => log.approvalWorkflowId,
  )?.approvalWorkflowId;

  const workflowId = resolvePayrollWorkflowId(
    configuredWorkflowItems,
    workflowFromPending,
    workflowFromLogs,
  );

  const configuredWorkflow = configuredWorkflowItems.find(
    (item: { id: string }) => item.id === workflowId,
  );
  const workflowApprovers = Array.isArray(configuredWorkflow?.approvers)
    ? configuredWorkflow.approvers
    : [];

  // Status API fails when logs reference a deleted workflow; logs + settings are enough.
  const shouldFetchStatus = Boolean(requestId && workflowId && !hasApprovalLogs);

  const { data: statusData, isLoading: isStatusLoading } =
    useGetPayrollApprovalStatus(requestId, workflowId, shouldFetchStatus);

  const isFullyApproved = payrollApproval?.approved === true;

  const approvalLevels = useMemo((): PayrollApprovalLevelStatus[] => {
    const historicalLogs = normalizeArrayResponse<HistoricalLog>(approverLog);
    const statusRecords = normalizeArrayResponse<ApprovalRecord>(statusData);

    let enriched = buildMergedApprovalLevels(
      workflowApprovers,
      statusRecords,
      historicalLogs,
      Boolean(requestId),
    );

    const currentPendingStep = Number(
      pendingItem?.nextApprover?.[0]?.stepOrder || 0,
    );
    if (currentPendingStep > 1) {
      enriched = enriched.map((level) =>
        Number(level.stepOrder) < currentPendingStep &&
        level.status === 'Pending'
          ? { ...level, status: 'Approved' as const }
          : level,
      );
    }

    if (isFullyApproved && enriched.length > 0) {
      return enriched.map((level) => ({
        ...level,
        status: level.status === 'Rejected' ? 'Rejected' : 'Approved',
      }));
    }

    const firstPendingIdx = enriched.findIndex(
      (level) => level.status === 'Pending',
    );
    if (firstPendingIdx < 0) return enriched;

    return enriched.map((level, idx) => {
      if (level.status !== 'Pending') return level;
      if (idx > firstPendingIdx) {
        return { ...level, status: 'Waiting' as const };
      }
      return level;
    });
  }, [
    approverLog,
    isFullyApproved,
    pendingItem,
    requestId,
    statusData,
    workflowApprovers,
  ]);

  const getApproverName = (userId: string) => getUserFullName(users, userId);

  const isLoading =
    isPayrollApprovalLoading ||
    isWorkflowLoading ||
    isUsersLoading ||
    isLogsLoading ||
    (shouldFetchStatus && isStatusLoading);

  return {
    approvalLevels,
    isLoading,
    isFullyApproved,
    hasWorkflow: workflowApprovers.length > 0,
    getApproverName,
  };
}
