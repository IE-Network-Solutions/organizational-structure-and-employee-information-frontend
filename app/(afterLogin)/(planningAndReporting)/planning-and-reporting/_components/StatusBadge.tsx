import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
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

  if (isSuccess) {
    return (
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-div-31"
        className="flex h-11 w-[214px] shrink-0 items-center gap-[11px]"
        style={{ fontFamily: 'Calibri' }}
      >
        <span
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[16px] bg-[#52C41A]"
          data-cy="planning-reporting-status-pill-icon"
        >
          <DoneOutlinedIcon
            sx={{
              width: 16,
              height: 16,
              fontSize: 16,
              color: '#FFFFFF',
            }}
          />
        </span>

        <span
          className="flex h-11 w-[175px] flex-col items-start p-0"
          data-cy="planning-reporting-status-text-block"
        >
          <span
            data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-p-43"
            className="flex h-[22px] w-[56px] items-center text-left text-sm font-normal leading-[22px]"
            style={{ color: '#111827' }}
          >
            {displayedLabel}
          </span>
          {secondaryLine ? (
            <span
              data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-p-47"
              className="block h-[22px] w-[175px] shrink-0 self-stretch whitespace-nowrap text-left font-normal"
              style={{
                color: '#656972',
                letterSpacing: '0',
                fontSize: '12px',
                lineHeight: '22px',
              }}
            >
              {secondaryLine}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  const pillBg = '#FEF3C7';
  const pillText = '#B45309';
  const iconCircleBg = '#FDE68A';
  const iconColor = '#D97706';

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-div-31"
      className="flex flex-col items-end gap-0.5"
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
          <MoreOutlined className="text-base md:text-lg" />
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
          className="max-w-[220px] text-right text-[11px] leading-snug text-[#656972] md:max-w-none md:text-xs"
        >
          {secondaryLine}
        </p>
      ) : null}
    </div>
  );
}
