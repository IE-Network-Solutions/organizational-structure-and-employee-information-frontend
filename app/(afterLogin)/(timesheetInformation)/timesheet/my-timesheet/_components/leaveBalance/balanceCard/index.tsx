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
    <div className="w-full h-[88px] rounded-xl bg-white m-2 py-4 px-4 sm:px-6 shadow-[0px_8px_9px_2px_rgba(0,_0,_0,_0.1)] transition-shadow duration-200">
      <div className="flex justify-between gap-[10px]">
        <div className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 my-1">
          {title}
        </div>
        <Button
          className="w-5 h-5 flex-shrink-0 my-1"
          id={`leaveBalanceCardInfo${title}Id`}
          type="text"
          icon={<FiInfo size={18} className="text-gray-400" />}
        />
      </div>
      <div className="text-sm font-medium text-gray-500">
        {duration}
        <span className="text-sm sm:text-base font-medium text-gray-500 ml-1">
          days
        </span>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
