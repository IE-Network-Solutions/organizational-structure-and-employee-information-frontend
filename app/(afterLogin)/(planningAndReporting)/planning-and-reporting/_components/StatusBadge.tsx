import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { PiDotsThreeCircle } from 'react-icons/pi';
import { PlanStatus } from './types';

interface StatusBadgeProps {
  status: PlanStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isClosed = status.label === 'Closed';
  const displayedLabel = status.label === 'Open' ? 'Pending' : status.label;

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-statusbadge-tsx-statusbadge-div-31"
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold ${
        isClosed ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEF3C7] text-[#92400E]'
      }`}
    >
      {isClosed ? (
        <CheckOutlined className="text-[11px]" />
      ) : (
        <PiDotsThreeCircle className="text-[14px]" />
      )}
      {displayedLabel}
    </div>
  );
}
