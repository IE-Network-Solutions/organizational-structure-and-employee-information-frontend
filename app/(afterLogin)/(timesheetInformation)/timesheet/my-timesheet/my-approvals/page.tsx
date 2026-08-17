'use client';

import { useState } from 'react';
import { Button } from 'antd';
import ApprovalTable from '../_components/approvalTable';
import ShiftSwapApprovals from '../_components/shiftSwapApprovals';

type ApprovalType = 'Leave' | 'WorkFromHome' | 'ShiftSwap';

const pills: Array<{ id: ApprovalType; label: string }> = [
  { id: 'Leave', label: 'Leave' },
  { id: 'WorkFromHome', label: 'Work From Home' },
  { id: 'ShiftSwap', label: 'Shift Swap' },
];

export default function MyApprovalsPage() {
  const [approvalType, setApprovalType] = useState<ApprovalType>('Leave');

  return (
    <div
      id="time-attendance-my-timesheet-my-approvals-page"
      data-cy="time-attendance-my-timesheet-my-approvals-page"
    >
      <div
        className="mb-3 flex flex-wrap gap-2"
        data-cy="time-attendance-my-approvals-type-pills"
      >
        {pills.map((pill) => {
          const isSelected = approvalType === pill.id;
          return (
            <Button
              key={pill.id}
              type="default"
              size="small"
              onClick={() => setApprovalType(pill.id)}
              data-cy={`time-attendance-my-approvals-type-pill-${pill.id}`}
              className={
                isSelected
                  ? '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-[#1d4ed8] text-[#1d4ed8] !bg-white hover:!bg-[#FAFAFA] hover:!border-[#1d4ed8] hover:!text-[#1d4ed8]'
                  : '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-gray-200 text-gray-700 !bg-white hover:!bg-gray-50 hover:!border-gray-300 hover:!text-gray-800'
              }
            >
              {pill.label}
            </Button>
          );
        })}
      </div>

      {approvalType === 'ShiftSwap' ? (
        <ShiftSwapApprovals />
      ) : (
        <ApprovalTable
          controlledApprovalType={approvalType}
          hideTypePills
        />
      )}
    </div>
  );
}
