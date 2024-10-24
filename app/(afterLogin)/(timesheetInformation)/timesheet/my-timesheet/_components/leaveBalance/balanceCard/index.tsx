import React from 'react';
import { Button } from 'antd';
import { FiInfo } from 'react-icons/fi';

interface LeaveBalanceCardProps {
  title: string;
  duration: string | number;
}

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({
  title = '',
  duration = '',
}) => {
  return (
    <div className="w-full h-[88px] rounded-[10px] bg-white py-4 px-6">
      <div className="flex item-center justify-between">
        <div className="text-base font-bold text-gray-900">{title}</div>
        <Button
          className="w-5 h-5"
          id={`leaveBalanceCardInfo${title}Id`}
          type="text"
          icon={<FiInfo size={18} className="text-gray-500" />}
        />
      </div>
      <div className="mt-2.5 text-sm font-medium text-gray-500">{duration}</div>
    </div>
  );
};

export default LeaveBalanceCard;
