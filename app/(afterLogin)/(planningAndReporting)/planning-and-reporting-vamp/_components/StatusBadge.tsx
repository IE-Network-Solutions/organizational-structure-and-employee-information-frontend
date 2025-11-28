import React from 'react';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import { PlanStatus } from './types';

interface StatusBadgeProps {
  status: PlanStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isClosed = status.label === 'Closed';

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: status.tone }}
      >
        {isClosed ? <CheckOutlined className="text-lg" /> : <MoreOutlined className="text-lg" />}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-bold leading-tight text-[#161A2C]">
          {status.label}
        </p>
        <p className="text-xs leading-tight text-[#8F94A3]">{status.updatedAt}</p>
      </div>
    </div>
  );
}
