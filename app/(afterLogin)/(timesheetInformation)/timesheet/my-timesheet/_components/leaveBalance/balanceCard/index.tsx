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
    <div className="w-full h-[120px] rounded-xl bg-white py-4 px-4 sm:px-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
          {title}
        </div>
        <Button
          className="w-5 h-5 flex-shrink-0"
          id={`leaveBalanceCardInfo${title}Id`}
          type="text"
          icon={<FiInfo size={18} className="text-gray-500" />}
        />
      </div>
      <div className="mt-4 text-2xl sm:text-3xl font-bold text-primary">
        {duration}
        <span className="text-sm sm:text-base font-medium text-gray-500 ml-1">
          days
        </span>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
