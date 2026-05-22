'use client';

import React from 'react';
import { Image, Popover } from 'antd';

interface AttendanceTimeWithImagePopoverProps {
  imageUrl: string | null;
  allowedAreaName?: string | null;
  children: React.ReactNode;
  dataCy?: string;
}

const AttendanceTimeWithImagePopover: React.FC<
  AttendanceTimeWithImagePopoverProps
> = ({ imageUrl, allowedAreaName, children, dataCy }) => {
  if (!imageUrl) {
    return <>{children}</>;
  }

  return (
    <Popover
      trigger="hover"
      placement="right"
      mouseEnterDelay={0.2}
      overlayClassName="attendance-image-hover-popover"
      content={
        <div
          className="p-1"
          data-cy={dataCy ? `${dataCy}-popover-content` : undefined}
        >
          {allowedAreaName ? (
            <p
              className="text-sm font-semibold text-gray-900 mb-2 m-0"
              data-cy={dataCy ? `${dataCy}-popover-allowed-area` : undefined}
            >
              {allowedAreaName}
            </p>
          ) : null}
          <Image
            src={imageUrl}
            alt={allowedAreaName ?? 'Attendance photo'}
            width={220}
            preview={false}
            className="rounded-md object-cover"
            data-cy={dataCy ? `${dataCy}-popover-image` : undefined}
          />
        </div>
      }
      data-cy={dataCy}
    >
      <div
        className="inline-block cursor-pointer hover:text-primary transition-colors"
        data-cy={dataCy ? `${dataCy}-trigger` : undefined}
      >
        {children}
      </div>
    </Popover>
  );
};

export default AttendanceTimeWithImagePopover;
