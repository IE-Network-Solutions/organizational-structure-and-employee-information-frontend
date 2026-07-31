import React from 'react';
import Image from 'next/image';
import UserCard from '@/components/common/userCard/userCard';

const ApprovalStatusCard = ({
  data,
  userName,
  userImage,
}: {
  data: any;
  userName: (a: string) => string;
  userImage: (a: any) => any;
}) => {
  // Use displayUserId if provided (from enriched data)
  // Otherwise, fallback logic: use approvedUserId if action taken, else userId
  const displayUserId =
    data?.displayUserId ||
    ((data?.status === 'Approved' || data?.status === 'Rejected') &&
    data?.approvedUserId
      ? data.approvedUserId // Historical approver who took action
      : data?.userId); // Current approver (for pending)

  return (
    <div className="border-b border-gray-200" data-cy="approval-status-card">
      <div
        className="flex items-center px-3 py-4 gap-4"
        data-cy="approval-status-card-content"
      >
        <div data-cy="approval-status-card-level">Level {data?.stepOrder}</div>
        <Image
          unoptimized
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
        <UserCard
          data={data}
          name={userName(String(displayUserId))}
          profileImage={displayUserId && userImage(String(displayUserId))}
          size="small"
        />
      </div>
      {data?.approvalComments?.length > 0 && (
        <div
          data-cy="components-common-approvalstatuses-approvalstatuscard-tsx-approvalstatuscard-div-52"
          className="flex items-center gap-4 mb-2 px-5"
        >
          <div
            data-cy="components-common-approvalstatuses-approvalstatuscard-tsx-approvalstatuscard-div-53"
            className="text-[10px] text-gray-500"
          >
            Reason
          </div>
          <div
            data-cy="components-common-approvalstatuses-approvalstatuscard-tsx-approvalstatuscard-div-54"
            className="text-xs text-gray-900"
          >
            {data?.approvalComments?.[0]?.comment}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalStatusCard;
