import React from 'react';
import { Avatar } from 'antd';
import { FaBomb } from 'react-icons/fa';
import { LuAward, LuUsers } from 'react-icons/lu';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';
import { Card, Skeleton } from 'antd';

interface FeedbackCardProps {
  appreciationPercentage: string;
  appreciationText?: string;
  total: number;
  contributorCount: number;
  type: string;
  textType: string;
}

export function FeedbackCard({
  appreciationPercentage,
  appreciationText,
  total,
  contributorCount,
  type,
  textType,
}: FeedbackCardProps) {
  return (
    <div>
      <Card className="bg-gray-100">
        <div className="flex justify-between">
          <Avatar
            className={`${type === 'appreciation' ? 'text-green-800 bg-gray-300' : 'text-red-400: bg-[#FF782D33]'} -mt-2`}
          >
            {type === 'appreciation' ? (
              <LuAward />
            ) : (
              <FaBomb className="text-red-600" />
            )}
          </Avatar>
          <div className="flex text-xs text-gray-400">
            <span className="flex text-green-800 mx-2">
              {!isNaN(Number(appreciationPercentage)) ? (
                Math.floor(Number(appreciationPercentage)) > 0 ? (
                  <>
                    <GoArrowUp /> {appreciationPercentage}%
                  </>
                ) : (
                  <>
                    <GoArrowDown /> {appreciationPercentage}%
                  </>
                )
              ) : (
                <>{appreciationPercentage}</>
              )}
            </span>
            Vs Last Week
          </div>
        </div>
        <div className="text-gray-400  my-1">
          {textType === 'appreciationIssued' && (
            <div>
              <span>Total number of Appreciations Issued</span>
            </div>
          )}
          {textType === 'appreciationReceived' && (
            <div>
              <span>Total number of Appreciations Received</span>
            </div>
          )}
          {textType === 'reprimandIssued' && (
            <div>
              <span>Total number of Reprimand Issued</span>
            </div>
          )}
          {textType === 'reprimandReceived' && (
            <div>
              <span>Total number of Reprimand Received</span>
            </div>
          )}
          {appreciationText}
        </div>
        <div className="font-bold text-lg">{total}</div>
        <div className="flex justify-end text-xs text-gray-400 space-x-2">
          <LuUsers />
          <span>{contributorCount} employees contributed</span>
        </div>
      </Card>
    </div>
  );
}

export const FeedbackCardSkeleton = () => {
  return (
    <div>
      <Card className="bg-gray-100 animate-pulse">
        <div className="flex justify-between">
          <Skeleton.Avatar
            active
            size="large"
            className="bg-gray-300"
            shape="circle"
          />
          <Skeleton.Button active size="small" shape="round" className="w-16" />
        </div>
        <div className="text-gray-400">
          <Skeleton.Input active size="small" className="w-3/4" />
          <Skeleton.Input active size="small" className="w-full mt-1" />
        </div>
        <div className="font-bold text-lg">
          <Skeleton.Input active size="default" className="w-1/4" />
        </div>
        <div className="flex justify-end text-xs text-gray-400 space-x-2 mt-1">
          <Skeleton.Avatar active size="small" shape="circle" />
          <Skeleton.Input active size="small" className="w-1/2" />
        </div>
      </Card>
    </div>
  );
};
