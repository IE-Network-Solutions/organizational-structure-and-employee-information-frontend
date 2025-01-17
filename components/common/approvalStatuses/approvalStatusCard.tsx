import React from 'react';
import Image from 'next/image';
import UserCard from '@/components/common/userCard/userCard';

const ApprovalStatusCard = ({
  data,
  userName,
}: {
  data: any;
  userName: (a: string) => string;
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center px-3 py-4 gap-4">
        <div>Level {data?.stepOrder}</div>
        <Image
          width={24}
          height={24}
          src={
            data?.status === 'Approved'
              ? '/icons/status/verify.svg'
              : data?.status === 'Pending'
                ? '/icons/status/information.svg'
                : data?.status === 'Rejected'
                  ? '/icons/status/reject.svg'
                  : ''
          }
          alt={data?.status}
        />
        <UserCard name={userName(String(data?.userId))} size="small" />
      </div>
      {data?.approvalComments?.length > 0 && (
        <div className="flex items-center gap-4 mb-2 px-5">
          <div className="text-[10px] text-gray-500">Reason</div>
          <div className="text-xs text-gray-900">
            {data?.approvalComments?.[0]?.comment}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalStatusCard;
