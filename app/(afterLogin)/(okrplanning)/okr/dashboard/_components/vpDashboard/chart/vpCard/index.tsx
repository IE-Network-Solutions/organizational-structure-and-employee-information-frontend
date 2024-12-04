import { useVariablePayStore } from '@/store/uistate/features/okrplanning/VP';
import { Card, Flex, Progress, Typography } from 'antd';
import React from 'react';

const { Title } = Typography;
const VPPayCard: React.FC = () => {
  const { score, maxScore, change } = useVariablePayStore();

  const achievedPercentage = (score / maxScore) * 100;

  return (
    <div>
      <div className="flex flex-col items-start justify-center">
        <p className="text-3xl font-bold text-gray-800">VP</p>
        <p className="text-[16px] text-gray-500">Manage your Variable Pay</p>
      </div>
      <div className="mx-2">
        <div className="mt-12">
          <div className="flex items-center justify-start">
            <p className="text-gray-500 text-sm font-medium my-3">
              Total VP Score
            </p>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.0781 19C10.1241 19 8.46879 18.3223 7.11212 16.967C5.75612 15.611 5.07813 13.9563 5.07812 12.003C5.07812 10.0497 5.75612 8.39433 7.11212 7.037C8.46812 5.67967 10.1235 5.00067 12.0781 5C13.2668 5 14.3798 5.28233 15.4171 5.847C16.4538 6.41167 17.2895 7.2 17.9241 8.212V5H18.9241V10.23H13.6941V9.23H17.3941C16.8728 8.23333 16.1401 7.44567 15.1961 6.867C14.2521 6.28833 13.2128 5.99933 12.0781 6C10.4115 6 8.99479 6.58333 7.82812 7.75C6.66146 8.91667 6.07812 10.3333 6.07812 12C6.07812 13.6667 6.66146 15.0833 7.82812 16.25C8.99479 17.4167 10.4115 18 12.0781 18C13.3615 18 14.5198 17.6333 15.5531 16.9C16.5865 16.1667 17.3115 15.2 17.7281 14H18.7901C18.3488 15.4973 17.5108 16.705 16.2761 17.623C15.0415 18.541 13.6421 19 12.0781 19Z"
                fill="#687588"
              />
            </svg>
          </div>
          <div className="relative ">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-gray-900">{score}%</span>
              <div className="flex flex-col">
                <p
                // className="absolute top-1/2 transform -translate-y-1/2 textx-sm right-0 text-gray-500"
                >
                  {`${achievedPercentage.toFixed(0)}% achieved out of ${maxScore}%`}
                </p>
                <Flex gap="small" vertical>
                  <Progress percent={70} size={4} />
                </Flex>
              </div>
            </div>
          </div>
          {/* <div className="mt-4 h-2 rounded bg-gray-200">
            <div
              className="h-2 rounded bg-blue-600"
              style={{ width: `${achievedPercentage}%` }}
            />
          </div> */}
        </div>
        <div className="mt-4 text-sm">
          <span className="text-green-600 font-medium">{change} ↑</span>
          <span className="text-gray-400 ml-1 text-sm font-light">
            vs last month
          </span>
        </div>
      </div>
    </div>
  );
};

export default VPPayCard;
