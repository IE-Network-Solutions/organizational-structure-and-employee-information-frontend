import React, { FC } from 'react';
import Image from 'next/image';
import UserCard from '@/components/common/userCard/userCard';

export interface RequestUserCardProps {
  name: string;
  status: string;
}

const RequestUserCard: FC<RequestUserCardProps> = ({ name, status }) => {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Image width={24} height={24} src={status} alt="" />
        <UserCard name={name} size="small" />
      </div>
      <div className="flex items-center justify-center gap-3 text-xs text-gray-900 mt-6">
        <span className="text-[10px] text-gray-500">Status</span>
        <span>Approved</span>
      </div>
    </div>
  );
};

export default RequestUserCard;
