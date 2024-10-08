import React, { FC } from 'react';
import Image from 'next/image';
import UserCard from '@/components/common/userCard/userCard';

export interface ApprovalStatusCardProps {
  employee: {
    img?: string;
    name: string;
    description: string;
  };
  status: string;
  reason?: string;
}

const ApprovalStatusCard: FC<ApprovalStatusCardProps> = ({
  employee,
  reason,
  status,
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center px-3 py-4 gap-4">
        <Image width={24} height={24} src={status} alt="" />
        <UserCard
          name={employee.name}
          description={employee.description}
          size="small"
        />
      </div>

      {reason && (
        <div className="flex items-center gap-4 mb-2 px-5">
          <div className="text-[10px] text-gray-500">Reason</div>
          <div className="text-xs text-gray-900">{reason}</div>
        </div>
      )}
    </div>
  );
};

export default ApprovalStatusCard;
