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
    <div className="space-y-4">
      {actionHistoryData?.map((history, index) => (
        <div key={index} className="flex items-start gap-4">
          <Avatar
            src={history?.profileImage}
            size={50}
            icon={<UserOutlined />}
            className="flex-shrink-0"
          />
          <div className="flex-grow">
            <div className="text-[12px] text-gray-700">
              <span className="font-semibold">{history?.userName}</span>
              {history?.action}
              <span className="font-semibold">{history?.fromStage}</span> to
              <span className="font-semibold">{history?.toStage}</span>
            </div>
            <div className="text-xs text-gray-400">{history?.timeAgo}</div>
            {history?.reason && (
              <div className="mt-1 text-xs text-gray-500">
                <span className="font-semibold">Reason: </span>
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
