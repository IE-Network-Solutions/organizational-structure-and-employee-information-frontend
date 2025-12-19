import React from 'react';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PlanStatus } from './types';

interface StatusBadgeProps {
  status: PlanStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isClosed = status.label === 'Closed';
  const displayedLabel = status.label === 'Open' ? 'Pending' : status.label;
  const formattedDate = status.updatedAt
    ? dayjs(status.updatedAt).format('MMMM D YYYY, h:mm:ss A')
    : '';

  // Map tone string to actual color values
  const getBackgroundColor = () => {
    if (status.tone === 'success' || isClosed) {
      return '#10B981'; // Green for closed/success
    }
    if (status.tone === 'warning' || !isClosed) {
      return '#F59E0B'; // Amber/Orange for open/warning
    }
    // Fallback to the tone value if it's already a color code
    return status.tone;
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div
        className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full text-white flex-shrink-0"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {isClosed ? <CheckOutlined className="text-sm md:text-lg" /> : <MoreOutlined className="text-sm md:text-lg" />}
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-xs md:text-sm font-bold leading-tight text-[#161A2C] line-clamp-1">
          {displayedLabel}
        </p>
        {formattedDate && (
          <p className="text-[10px] md:text-xs leading-tight text-[#8F94A3] hidden md:block">
            {formattedDate}
          </p>
        )}
      </div>
    </div>
  );
}
