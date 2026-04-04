'use client';

import React, { FC } from 'react';
import { LeaveRequestStatus } from '@/types/timesheet/settings';

const STATUS_CONFIG: Record<
  LeaveRequestStatus,
  { backgroundColor: string; color: string; borderColor: string; label: string }
> = {
  [LeaveRequestStatus.APPROVED]: {
    backgroundColor: '#E6F0FF',
    color: '#1677FF',
    borderColor: '#B3CCFF',
    label: 'Approved',
  },
  [LeaveRequestStatus.PENDING]: {
    backgroundColor: '#FFF7E6',
    color: '#FA8C16',
    borderColor: '#FFC069',
    label: 'Pending',
  },
  [LeaveRequestStatus.DECLINED]: {
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    borderColor: '#FCA5A5',
    label: 'Rejected',
  },
};

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-md border border-solid py-0.5 px-2.5 text-xs font-semibold';

interface LeaveRequestStatusTagProps {
  status: LeaveRequestStatus;
  dataCy?: string;
  id?: string;
}

const LeaveRequestStatusTag: FC<LeaveRequestStatusTagProps> = ({
  status,
  dataCy = 'time-attendance-leave-request-status-tag',
  id,
}) => {
  const config = STATUS_CONFIG[status] ?? {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderColor: '#e5e7eb',
    label: status?.charAt(0)?.toUpperCase() + (status?.slice(1) ?? '') || '',
  };

  return (
    <span
      className={BASE_CLASS}
      style={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
      data-cy={dataCy}
      id={id}
    >
      {config.label}
    </span>
  );
};

export default LeaveRequestStatusTag;
