import { Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';

interface ActionHistory {
  userName: string;
  profileImage?: string;
  action: string;
  fromStage: string;
  toStage: string;
  reason?: string;
  timeAgo: string;
}

interface ActivityProps {
  selectedCandidate: any;
}

const actionHistoryData: ActionHistory[] = [
  {
    userName: 'Ermias Wubet',
    profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
    action: 'moved candidate from stage',
    fromStage: 'Rejected',
    toStage: 'Applied',
    timeAgo: '1m ago',
  },
  {
    userName: 'Dawit Gebeyehu',
    profileImage: 'https://randomuser.me/api/portraits/men/46.jpg',
    action: 'moved candidate from stage',
    fromStage: 'Applied',
    toStage: 'Rejected',
    reason: 'Because his CV and other related updates are not rightfully done.',
    timeAgo: '5m ago',
  },
];

const CandidateActivity: React.FC<ActivityProps> = () => {
  return (
    <div
      className="space-y-4"
      id="talent-acquisition-candidate-tab-activity-container"
      data-cy="talent-acquisition-candidate-tab-activity-container"
    >
      {actionHistoryData?.map((history, index) => (
        <div
          key={index}
          className="flex items-start gap-4"
          data-cy={`talent-acquisition-candidate-tab-activity-entry-${index}`}
        >
          <Avatar
            src={history?.profileImage}
            size={50}
            icon={<UserOutlined />}
            className="flex-shrink-0"
            data-cy={`talent-acquisition-candidate-tab-activity-avatar-${index}`}
          />
          <div
            className="flex-grow"
            data-cy={`talent-acquisition-candidate-tab-activity-details-${index}`}
          >
            <div
              className="text-[12px] text-gray-700"
              data-cy={`talent-acquisition-candidate-tab-activity-description-${index}`}
            >
              <span
                data-cy="-components-tabs-activity-index-tsx-index-span-67"
                className="font-semibold"
              >
                {history?.userName}
              </span>
              {history?.action}
              <span
                data-cy="-components-tabs-activity-index-tsx-index-span-69"
                className="font-semibold"
              >
                {history?.fromStage}
              </span>{' '}
              to
              <span
                data-cy="-components-tabs-activity-index-tsx-index-span-70"
                className="font-semibold"
              >
                {history?.toStage}
              </span>
            </div>
            <div
              className="text-xs text-gray-400"
              data-cy={`talent-acquisition-candidate-tab-activity-time-${index}`}
            >
              {history?.timeAgo}
            </div>
            {history?.reason && (
              <div
                className="mt-1 text-xs text-gray-500"
                data-cy={`talent-acquisition-candidate-tab-activity-reason-${index}`}
              >
                <span
                  data-cy="-components-tabs-activity-index-tsx-index-span-83"
                  className="font-semibold"
                >
                  Reason:{' '}
                </span>
                {history?.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidateActivity;
