'use client';

import { Button, Tag } from 'antd';
import EmptyState from '@/components/empty';
import { useGetSwapRequests } from '@/store/server/features/timesheet/workSchedule/queries';
import { useAdminRespondToSwap } from '@/store/server/features/timesheet/workSchedule/mutation';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { SWAP_STATUS_LABEL } from '@/types/timesheet/workSchedule';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const statusColor: Record<string, string> = {
  PENDING_PEER: 'gold',
  PENDING_ADMIN: 'blue',
  APPROVED: 'success',
  REJECTED_PEER: 'red',
  REJECTED_ADMIN: 'red',
  EXPIRED: 'default',
  CANCELLED: 'default',
};

const SwapApprovalQueue = () => {
  const { data: swaps = [], isLoading } = useGetSwapRequests();
  const { mutate: respond, isLoading: isResponding } = useAdminRespondToSwap();
  const canApprove = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateWorkingSchedule],
  });

  const pendingAdmin = swaps.filter((item) => item.status === 'PENDING_ADMIN');
  const others = swaps.filter((item) => item.status !== 'PENDING_ADMIN');

  if (!isLoading && swaps.length === 0) {
    return (
      <div
        className="border border-[#D9D9D9] rounded-lg p-4"
        data-cy="time-attendance-settings-work-schedule-swap-empty"
      >
        <EmptyState
          title="No swap requests"
          description="Peer-accepted swap requests will appear here for admin approval."
          compact
        />
      </div>
    );
  }

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg p-4"
      data-cy="time-attendance-settings-work-schedule-swap-queue"
      id="time-attendance-settings-work-schedule-swap-queue"
    >
      <h3
        className="text-base font-semibold text-[#4d4d4d] mb-3"
        data-cy="time-attendance-settings-work-schedule-swap-pending-title"
      >
        Pending admin approval
      </h3>
      {pendingAdmin.length === 0 && (
        <p
          className="text-sm text-gray-500 mb-6"
          data-cy="time-attendance-settings-work-schedule-swap-pending-empty"
        >
          No requests are waiting for admin approval.
        </p>
      )}
      <div
        className="flex flex-col gap-3 mb-6"
        data-cy="time-attendance-settings-work-schedule-swap-pending-list"
      >
        {pendingAdmin.map((swap) => (
          <div
            key={swap.id}
            className="border border-gray-200 rounded-xl p-4 bg-white"
            data-cy={`time-attendance-settings-work-schedule-swap-card-${swap.id}`}
          >
            <div
              className="flex flex-wrap items-start justify-between gap-3 mb-3"
              data-cy={`time-attendance-settings-work-schedule-swap-card-header-${swap.id}`}
            >
              <div
                data-cy={`time-attendance-settings-work-schedule-swap-card-people-${swap.id}`}
              >
                <p
                  className="mb-1 text-sm font-semibold text-[#4d4d4d]"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-names-${swap.id}`}
                >
                  {getEmployeeDisplayName(swap.requester)} →{' '}
                  {getEmployeeDisplayName(swap.target)}
                </p>
                <p
                  className="mb-0 text-xs text-gray-500"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-reason-${swap.id}`}
                >
                  {swap.reason || 'No reason provided'}
                </p>
              </div>
              <Tag color={statusColor[swap.status]}>
                {SWAP_STATUS_LABEL[swap.status]}
              </Tag>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3"
              data-cy={`time-attendance-settings-work-schedule-swap-card-shifts-${swap.id}`}
            >
              <div
                className="rounded-lg border border-gray-200 p-3"
                data-cy={`time-attendance-settings-work-schedule-swap-card-initiator-${swap.id}`}
              >
                <p
                  className="text-xs text-gray-500 mb-1"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-initiator-label-${swap.id}`}
                >
                  Initiator shift
                </p>
                <p
                  className="mb-0 text-sm font-medium"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-initiator-value-${swap.id}`}
                >
                  {swap.requesterShift.date} ·{' '}
                  {formatTimeRange(
                    swap.requesterShift.startTime,
                    swap.requesterShift.endTime,
                  )}
                </p>
              </div>
              <div
                className="rounded-lg border border-gray-200 p-3"
                data-cy={`time-attendance-settings-work-schedule-swap-card-target-${swap.id}`}
              >
                <p
                  className="text-xs text-gray-500 mb-1"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-target-label-${swap.id}`}
                >
                  Target shift
                </p>
                <p
                  className="mb-0 text-sm font-medium"
                  data-cy={`time-attendance-settings-work-schedule-swap-card-target-value-${swap.id}`}
                >
                  {swap.targetShift.date} ·{' '}
                  {formatTimeRange(
                    swap.targetShift.startTime,
                    swap.targetShift.endTime,
                  )}
                </p>
              </div>
            </div>
            <div
              className={`rounded-lg px-3 py-2 text-sm mb-3 ${
                swap.impact.overtimeTriggered
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
              data-cy={`time-attendance-settings-work-schedule-swap-card-impact-${swap.id}`}
            >
              {swap.impact.overtimeTriggered
                ? `Overtime triggered after swap (threshold 40h). Initiator ${swap.impact.requesterBefore}h → ${swap.impact.requesterAfter}h, peer ${swap.impact.targetBefore}h → ${swap.impact.targetAfter}h.`
                : `No overtime triggered. Initiator ${swap.impact.requesterBefore}h → ${swap.impact.requesterAfter}h, peer ${swap.impact.targetBefore}h → ${swap.impact.targetAfter}h.`}
            </div>
            {canApprove && (
              <div
                className="flex gap-2"
                data-cy={`time-attendance-settings-work-schedule-swap-card-actions-${swap.id}`}
              >
                <Button
                  type="primary"
                  loading={isResponding}
                  onClick={() => respond({ id: swap.id, accept: true })}
                  data-cy={`time-attendance-settings-work-schedule-swap-approve-${swap.id}`}
                >
                  Approve
                </Button>
                <Button
                  loading={isResponding}
                  onClick={() => respond({ id: swap.id, accept: false })}
                  data-cy={`time-attendance-settings-work-schedule-swap-reject-${swap.id}`}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3
        className="text-base font-semibold text-[#4d4d4d] mb-3"
        data-cy="time-attendance-settings-work-schedule-swap-all-title"
      >
        All swap requests
      </h3>
      <div
        className="flex flex-col gap-3"
        data-cy="time-attendance-settings-work-schedule-swap-all-list"
      >
        {others.map((swap) => (
          <div
            key={swap.id}
            className="border border-gray-200 rounded-xl p-4 bg-white"
            data-cy={`time-attendance-settings-work-schedule-swap-history-${swap.id}`}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2"
              data-cy={`time-attendance-settings-work-schedule-swap-history-row-${swap.id}`}
            >
              <p
                className="mb-0 text-sm text-[#4d4d4d]"
                data-cy={`time-attendance-settings-work-schedule-swap-history-text-${swap.id}`}
              >
                {getEmployeeDisplayName(swap.requester)} ↔{' '}
                {getEmployeeDisplayName(swap.target)} ·{' '}
                {swap.requesterShift.date} / {swap.targetShift.date}
              </p>
              <Tag color={statusColor[swap.status]}>
                {SWAP_STATUS_LABEL[swap.status]}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwapApprovalQueue;
