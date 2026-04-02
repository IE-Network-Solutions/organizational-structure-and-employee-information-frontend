import React from 'react';
import { Skeleton } from 'antd';

interface ApprovalStatusCardSkeletonProps {
  dataCyPrefix?: string;
  /** When true, omits the user placeholder (level + status icon only). */
  hideApproverSkeleton?: boolean;
}

const ApprovalStatusCardSkeleton: React.FC<ApprovalStatusCardSkeletonProps> = ({
  dataCyPrefix = 'approval-status-card-skeleton',
  hideApproverSkeleton = false,
}) => {
  return (
    <div className="border-b border-gray-200" data-cy={`${dataCyPrefix}`}>
      <div className="flex items-center px-3 py-4 gap-4">
        <Skeleton.Input
          active
          size="small"
          style={{ width: 60, height: 20 }}
          data-cy={`${dataCyPrefix}-level`}
        />
        <Skeleton.Avatar
          active
          size={24}
          shape="square"
          data-cy={`${dataCyPrefix}-icon`}
        />
        {!hideApproverSkeleton && (
          <div className="flex-1">
            <Skeleton
              active
              avatar={{ size: 32, shape: 'circle' }}
              paragraph={{ rows: 1, width: ['60%'] }}
              title={false}
              data-cy={`${dataCyPrefix}-user`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatusCardSkeleton;
