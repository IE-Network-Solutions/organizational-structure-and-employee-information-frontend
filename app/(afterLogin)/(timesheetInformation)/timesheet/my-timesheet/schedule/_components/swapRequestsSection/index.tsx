'use client';

import { useState } from 'react';
import { Button, Card, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  SWAP_STATUS_LABEL,
  SwapRequestStatus,
  SwapRequestView,
} from '@/types/timesheet/workSchedule';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { usePeerRespondToSwap } from '@/store/server/features/timesheet/workSchedule/mutation';

type SwapRequestTab = 'pending' | 'approved' | 'rejected';

interface SwapRequestsSectionProps {
  personaId: string;
  swaps: SwapRequestView[];
}

const PENDING_STATUSES = new Set<SwapRequestStatus>([
  'PENDING_PEER',
  'PENDING_ADMIN',
]);
const APPROVED_STATUSES = new Set<SwapRequestStatus>(['APPROVED']);
const REJECTED_STATUSES = new Set<SwapRequestStatus>([
  'REJECTED_PEER',
  'REJECTED_ADMIN',
  'CANCELLED',
  'EXPIRED',
]);

const statusColor = (status: SwapRequestStatus) => {
  if (PENDING_STATUSES.has(status)) return 'processing';
  if (APPROVED_STATUSES.has(status)) return 'success';
  return 'error';
};

const SwapRequestsSection = ({
  personaId,
  swaps,
}: SwapRequestsSectionProps) => {
  const [activeTab, setActiveTab] = useState<SwapRequestTab>('pending');
  const { mutate: respond, isLoading } = usePeerRespondToSwap();

  const grouped = {
    pending: swaps.filter((swap) => PENDING_STATUSES.has(swap.status)),
    approved: swaps.filter((swap) => APPROVED_STATUSES.has(swap.status)),
    rejected: swaps.filter((swap) => REJECTED_STATUSES.has(swap.status)),
  };

  const items = grouped[activeTab];

  const tabs: Array<{ id: SwapRequestTab; label: string; count: number }> = [
    { id: 'pending', label: 'Pending', count: grouped.pending.length },
    { id: 'approved', label: 'Approved', count: grouped.approved.length },
    { id: 'rejected', label: 'Rejected', count: grouped.rejected.length },
  ];

  return (
    <Card
      className="shadow-sm rounded-lg border border-gray-200"
      data-cy="time-attendance-my-schedule-swap-requests"
    >
      <div
        className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        data-cy="time-attendance-my-schedule-swap-header"
      >
        <div data-cy="time-attendance-my-schedule-swap-title-block">
          <p
            className="mb-0 text-lg font-semibold text-gray-900"
            data-cy="time-attendance-my-schedule-swap-title"
          >
            Swap Requests
          </p>
          <p
            className="mb-0 text-xs text-gray-500"
            data-cy="time-attendance-my-schedule-swap-subtitle"
          >
            Pending, approved, and rejected shift swap requests
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          data-cy="time-attendance-my-schedule-swap-tabs"
        >
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                type="default"
                size="small"
                onClick={() => setActiveTab(tab.id)}
                data-cy={`time-attendance-my-schedule-swap-tab-${tab.id}`}
                className={
                  selected
                    ? '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-[#1d4ed8] text-[#1d4ed8] !bg-white'
                    : '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-gray-200 text-gray-700 !bg-white'
                }
              >
                {tab.label} ({tab.count})
              </Button>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <p
          className="mb-0 text-sm text-gray-500"
          data-cy="time-attendance-my-schedule-swap-empty"
        >
          No {activeTab} swap requests.
        </p>
      ) : (
        <div
          className="flex flex-col gap-2"
          data-cy="time-attendance-my-schedule-swap-list"
        >
          {items.map((swap) => {
            const isIncoming =
              swap.targetUserId === personaId && swap.status === 'PENDING_PEER';
            const isOutgoing = swap.requesterId === personaId;
            const counterpart = isOutgoing ? swap.target : swap.requester;

            return (
              <div
                key={swap.id}
                className="rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2.5"
                data-cy={`time-attendance-my-schedule-swap-item-${swap.id}`}
              >
                <div
                  className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                  data-cy={`time-attendance-my-schedule-swap-item-body-${swap.id}`}
                >
                  <div
                    className="min-w-0"
                    data-cy={`time-attendance-my-schedule-swap-item-details-${swap.id}`}
                  >
                    <div
                      className="mb-1 flex flex-wrap items-center gap-2"
                      data-cy={`time-attendance-my-schedule-swap-item-meta-${swap.id}`}
                    >
                      <Tag
                        color={statusColor(swap.status)}
                        className="!m-0 !text-[10px]"
                      >
                        {SWAP_STATUS_LABEL[swap.status]}
                      </Tag>
                      <span
                        className="text-xs text-gray-500"
                        data-cy={`time-attendance-my-schedule-swap-item-direction-${swap.id}`}
                      >
                        {isOutgoing ? 'Outgoing' : 'Incoming'} ·{' '}
                        {getEmployeeDisplayName(counterpart)}
                      </span>
                    </div>
                    <p
                      className="mb-0 text-sm text-[#4d4d4d]"
                      data-cy={`time-attendance-my-schedule-swap-item-times-${swap.id}`}
                    >
                      {dayjs(swap.requesterShift.date).format('MMM D')} (
                      {formatTimeRange(
                        swap.requesterShift.startTime,
                        swap.requesterShift.endTime,
                      )}
                      ) ↔ {dayjs(swap.targetShift.date).format('MMM D')} (
                      {formatTimeRange(
                        swap.targetShift.startTime,
                        swap.targetShift.endTime,
                      )}
                      )
                    </p>
                    {swap.reason ? (
                      <p
                        className="mb-0 mt-1 text-xs text-gray-500"
                        data-cy={`time-attendance-my-schedule-swap-item-reason-${swap.id}`}
                      >
                        “{swap.reason}”
                      </p>
                    ) : null}
                  </div>

                  {isIncoming ? (
                    <div
                      className="flex gap-2 shrink-0"
                      data-cy={`time-attendance-my-schedule-swap-item-actions-${swap.id}`}
                    >
                      <Button
                        type="primary"
                        size="small"
                        loading={isLoading}
                        onClick={() =>
                          respond({
                            id: swap.id,
                            accept: true,
                            actorUserId: personaId,
                          })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        loading={isLoading}
                        onClick={() =>
                          respond({
                            id: swap.id,
                            accept: false,
                            actorUserId: personaId,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default SwapRequestsSection;
