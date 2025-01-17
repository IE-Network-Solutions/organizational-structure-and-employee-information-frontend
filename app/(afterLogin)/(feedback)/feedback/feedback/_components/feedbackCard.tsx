import React from 'react';
import { Avatar, Card } from 'antd';
import { FaBomb, FaLongArrowAltUp } from 'react-icons/fa';
import { LuAward, LuUsers } from 'react-icons/lu';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

interface FeedbackCardProps {
  appreciationPercentage: string;
  appreciationText?: string;
  total: number;
  contributorCount: number;
  type: string;
  textType: string;
}

function FeedbackCard({
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
          <p className="flex text-xs text-gray-400">
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
          </p>
        </div>
        <p className="text-gray-400  my-1">
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

          {/* {textType === 'appreciation' ? (
            <div>

              <span>Total number of Appreciations issued</span>
            </div>) : 
            <div>

              <span>Total number of Appreciations issued</span>
            </div>

          ) : (
            <div>
              <span>Total number of Appreciations issued</span>
              <span>Total number of Appreciations Received</span>
            </div>
          )} */}
          {appreciationText}
        </p>
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
