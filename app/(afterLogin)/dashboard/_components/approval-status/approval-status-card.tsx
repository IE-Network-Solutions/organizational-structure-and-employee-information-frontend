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
    <div className="flex items-center justify-between bg-white p-2 rounded-lg  overflow-y-auto scrollbar-none mb-3">
      <div className="flex items-center space-x-3">
        <img
          src="https://randomuser.me/api/portraits/women/1.jpg"
          alt={name}
          className="w-7 h-7 rounded-full"
        />
        <div className="flex flex-col">
          <p className="font-bold text-[12px]">{type}</p>
          <p className="text-[10px] text-gray-500">
            {date} • {time}
          </p>
          <p className="text-[10px] text-gray-500">{name}</p>
        </div>
      </div>
      <div className="space-x-1 space-y-1 ">
        <Button
          className="text-[10px] border-black"
          type="default"
          size="small"
        >
          Reject
        </Button>
        <Button className="text-[10px]" type="primary" size="small">
          Approve
        </Button>
      </div>
    </div>
  );
};

export default ApprovalRequestCard;
