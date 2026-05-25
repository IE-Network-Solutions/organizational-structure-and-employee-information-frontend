'use client';

import React from 'react';
import { Popover } from 'antd';

interface AttendanceTimeWithImagePopoverProps {
  imageUrl: string | null;
  allowedAreaName?: string | null;
  /** e.g. "Check in", "Check out" */
  eventLabel?: string | null;
  /** e.g. "07:35 AM" */
  timeLabel?: string | null;
  children: React.ReactNode;
  dataCy?: string;
}

const AttendanceTimeWithImagePopover: React.FC<
  AttendanceTimeWithImagePopoverProps
> = ({
  imageUrl,
  allowedAreaName,
  eventLabel,
  timeLabel,
  children,
  dataCy,
}) => {
  if (!imageUrl) {
    return <>{children}</>;
  }

  const title = allowedAreaName?.trim() || 'Attendance location';
  const subtitle = eventLabel?.trim() || null;

  return (
    <Popover
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.2}
      overlayClassName="attendance-image-hover-popover"
      overlayInnerStyle={{ padding: 0 }}
      content={
        <div
          className="flex min-w-[400px] max-w-[480px] items-center gap-10 rounded-xl bg-white p-4 pl-4 pr-7 shadow-[0_4px_16px_rgba(15,23,42,0.12)]"
          data-cy={dataCy ? `${dataCy}-popover-content` : undefined}
        >
          <div
            className="h-[92px] w-[168px] shrink-0 overflow-hidden bg-slate-100"
            data-cy={dataCy ? `${dataCy}-popover-image-wrap` : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              data-cy={dataCy ? `${dataCy}-popover-image` : undefined}
            />
          </div>
          <div
            className="ml-auto flex min-w-[160px] flex-1 flex-col justify-center gap-1 py-1 pl-6"
            data-cy={dataCy ? `${dataCy}-popover-text` : undefined}
          >
            <p
              className="m-0 truncate text-base font-semibold leading-snug text-gray-900"
              data-cy={dataCy ? `${dataCy}-popover-allowed-area` : undefined}
            >
              {title}
            </p>
            {subtitle ? (
              <p
                className="m-0 text-[15px] font-normal leading-snug text-slate-500"
                data-cy={dataCy ? `${dataCy}-popover-event-label` : undefined}
              >
                {subtitle}
              </p>
            ) : null}
            {timeLabel ? (
              <p
                className="m-0 text-[15px] font-normal leading-snug text-slate-500"
                data-cy={dataCy ? `${dataCy}-popover-time` : undefined}
              >
                {timeLabel}
              </p>
            ) : null}
          </div>
        </div>
      }
      data-cy={dataCy}
    >
      <div
        className="inline-block cursor-pointer transition-colors hover:text-primary"
        data-cy={dataCy ? `${dataCy}-trigger` : undefined}
      >
        {children}
      </div>
    </Popover>
  );
};

export default AttendanceTimeWithImagePopover;
