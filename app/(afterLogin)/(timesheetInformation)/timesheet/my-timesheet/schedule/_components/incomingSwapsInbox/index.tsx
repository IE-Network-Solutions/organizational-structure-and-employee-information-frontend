'use client';

import { Button, Tag } from 'antd';
import { SwapRequestView } from '@/types/timesheet/workSchedule';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { usePeerRespondToSwap } from '@/store/server/features/timesheet/workSchedule/mutation';

interface IncomingSwapsInboxProps {
  personaId: string;
  incoming: SwapRequestView[];
  outgoing: SwapRequestView[];
}

const IncomingSwapsInbox = ({
  personaId,
  incoming,
  outgoing,
}: IncomingSwapsInboxProps) => {
  const { mutate: respond, isLoading } = usePeerRespondToSwap();

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"
      data-cy="time-attendance-my-schedule-swap-inbox"
    >
      <div
        className="border border-gray-200 rounded-xl p-4 bg-white"
        data-cy="time-attendance-my-schedule-incoming-card"
      >
        <h3
          className="text-sm font-semibold text-[#4d4d4d] mb-3"
          data-cy="time-attendance-my-schedule-incoming-title"
        >
          Incoming swap requests
        </h3>
        {incoming.length === 0 && (
          <p
            className="text-sm text-gray-500 mb-0"
            data-cy="time-attendance-my-schedule-incoming-empty"
          >
            No incoming requests for this demo persona.
          </p>
        )}
        <div
          className="flex flex-col gap-3"
          data-cy="time-attendance-my-schedule-incoming-list"
        >
          {incoming.map((swap) => (
            <div
              key={swap.id}
              className="border border-gray-200 rounded-lg p-3"
              data-cy={`time-attendance-my-schedule-incoming-swap-${swap.id}`}
            >
              <p
                className="mb-1 text-sm font-medium text-[#4d4d4d]"
                data-cy={`time-attendance-my-schedule-incoming-swap-title-${swap.id}`}
              >
                {getEmployeeDisplayName(swap.requester)} wants to swap
              </p>
              <p
                className="mb-2 text-xs text-gray-500"
                data-cy={`time-attendance-my-schedule-incoming-swap-detail-${swap.id}`}
              >
                Their {swap.requesterShift.date} (
                {formatTimeRange(
                  swap.requesterShift.startTime,
                  swap.requesterShift.endTime,
                )}
                ) for your {swap.targetShift.date} (
                {formatTimeRange(
                  swap.targetShift.startTime,
                  swap.targetShift.endTime,
                )}
                )
              </p>
              {swap.reason && (
                <p
                  className="mb-2 text-xs text-gray-500"
                  data-cy={`time-attendance-my-schedule-incoming-swap-reason-${swap.id}`}
                >
                  “{swap.reason}”
                </p>
              )}
              <div
                className="flex gap-2"
                data-cy={`time-attendance-my-schedule-incoming-swap-actions-${swap.id}`}
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
            </div>
          ))}
        </div>
      </div>

      <div
        className="border border-gray-200 rounded-xl p-4 bg-white"
        data-cy="time-attendance-my-schedule-outgoing-card"
      >
        <h3
          className="text-sm font-semibold text-[#4d4d4d] mb-3"
          data-cy="time-attendance-my-schedule-outgoing-title"
        >
          My swap requests
        </h3>
        {outgoing.length === 0 && (
          <p
            className="text-sm text-gray-500 mb-0"
            data-cy="time-attendance-my-schedule-outgoing-empty"
          >
            You have not requested any swaps yet.
          </p>
        )}
        <div
          className="flex flex-col gap-2"
          data-cy="time-attendance-my-schedule-outgoing-list"
        >
          {outgoing.map((swap) => (
            <div
              key={swap.id}
              className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2"
              data-cy={`time-attendance-my-schedule-outgoing-item-${swap.id}`}
            >
              <span
                className="text-xs text-[#4d4d4d]"
                data-cy={`time-attendance-my-schedule-outgoing-text-${swap.id}`}
              >
                {swap.requesterShift.date} ↔ {swap.targetShift.date} with{' '}
                {getEmployeeDisplayName(swap.target)}
              </span>
              <Tag>{swap.status.replace(/_/g, ' ')}</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncomingSwapsInbox;
