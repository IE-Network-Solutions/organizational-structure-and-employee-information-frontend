import React from 'react';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import { PlanStatus } from './types';

interface StatusBadgeProps {
  status: PlanStatus;
  /** Optional formatted timestamp (e.g. plan created date) shown under the label */
  timeLabel?: string;
}

export default function StatusBadge({ status, timeLabel }: StatusBadgeProps) {
  const isClosed = status.label === 'Closed';
  const displayedLabel =
    status.label === 'Open'
      ? 'Pending'
      : status.label === 'Closed'
        ? 'Approved'
        : status.label;

  const secondaryLine =
    timeLabel ||
    (status.updatedAt
      ? new Date(status.updatedAt).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      : '');

  const isSuccess = status.tone === 'success' || isClosed;

  const pillBg = isSuccess ? '#DCFCE7' : '#FEF3C7';
  const pillText = isSuccess ? '#166534' : '#B45309';
  const iconCircleBg = isSuccess ? '#BBF7D0' : '#FDE68A';
  const iconColor = isSuccess ? '#15803D' : '#D97706';

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-div-31"
      className="flex flex-col items-end gap-1"
    >
      <div
        className="inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 md:px-3 md:py-2"
        style={{
          backgroundColor: pillBg,
          color: pillText,
        }}
        data-cy="planning-reporting-status-pill"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8"
          style={{
            backgroundColor: iconCircleBg,
            color: iconColor,
          }}
          data-cy="planning-reporting-status-pill-icon"
        >
          {isSuccess ? (
            <CheckOutlined className="text-xs md:text-sm" />
          ) : (
            <MoreOutlined className="text-base md:text-lg" />
          )}
        </span>
        <span
          data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-p-43"
          className="pr-0.5 text-xs font-bold leading-none md:text-sm"
        >
          {displayedLabel}
        </span>
      </div>
      {secondaryLine ? (
        <p
          data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-p-47"
          className="max-w-[220px] text-right text-[10px] leading-snug text-[#8F94A3] md:max-w-none md:text-xs"
        >
          {secondaryLine}
        </p>
      ) : null}
    </div>
  );
}
