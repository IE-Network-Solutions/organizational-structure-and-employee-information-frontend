// components/ApprovalRequestCard.tsx
import { FC } from 'react';
import { Button } from 'antd';

interface ApprovalRequestCardProps {
  name: string;
  date: string;
  time: string;
  type: string;
}

const ApprovalRequestCard: FC<ApprovalRequestCardProps> = ({
  name,
  date,
  time,
  type,
}) => {
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm mb-3">
      <div className="flex items-center space-x-3">
        <img
          src="https://randomuser.me/api/portraits/women/1.jpg"
          alt={name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{type}</p>
          <p className="text-xs text-gray-500">
            {date} • {time}
          </p>
          <p className="text-xs text-gray-500">{name}</p>
        </div>
      </div>
      <div className="space-x-1">
        <Button type="default" size="small" danger>
          Reject
        </Button>
        <Button type="primary" size="small">
          Approve
        </Button>
      </div>
    </div>
  );
};

export default ApprovalRequestCard;
