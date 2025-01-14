import React from 'react';
import { Avatar, Card } from 'antd';
import { FaBomb, FaLongArrowAltUp } from 'react-icons/fa';
import { LuAward, LuUsers } from 'react-icons/lu';

interface FeedbackCardProps {
  appreciationPercentage: string;
  appreciationText: string;
  total: number;
  contributorCount: number;
  type: string;
}

function FeedbackCard({
  appreciationPercentage,
  appreciationText,
  total,
  contributorCount,
  type,
}: FeedbackCardProps) {
  return (
    <div>
      <Card className="bg-gray-100">
        <div className="flex justify-between">
          <Avatar
            className={`bg-gray-300 ${type === 'appreciation' ? 'text-green-800' : 'text-red-400'} -mt-2`}
          >
            {type === 'appreciation' ? (
              <LuAward />
            ) : (
              <FaBomb className="text-red-600" />
            )}
          </Avatar>
          <p className="flex text-xs text-gray-400">
            <span className="flex text-green-800 mx-2">
              <FaLongArrowAltUp /> {appreciationPercentage}%
            </span>
            Vs Last Week
          </p>
        </div>
        <p className="text-gray-400 capitalize my-1">{appreciationText}</p>
        <p className="font-bold text-lg">{total}</p>
        <p className="flex justify-end text-xs text-gray-400 space-x-2">
          <LuUsers />
          <span>{contributorCount} employees contributed</span>
        </p>
      </Card>
    </div>
  );
}

export default FeedbackCard;
