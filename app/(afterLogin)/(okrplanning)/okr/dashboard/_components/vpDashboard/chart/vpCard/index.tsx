import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card, Progress, Skeleton, Typography } from 'antd';
import React from 'react';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

const { Title } = Typography;
const VPPayCard: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;

  const { data: vpScore, isLoading: isResponseLoading } = useGetVPScore(userId);

  const achievedPercentage =
    (parseInt(vpScore?.score, 10) / vpScore?.maxScore) * 100;

  return (
    <Card size="default" bordered={false}>
      {isResponseLoading ? (
        <Skeleton active />
      ) : (
        <>
          <div className="flex flex-col items-start justify-center">
            <p className="text-3xl font-extrabold text-gray-800 my-3">VP</p>
            <p className="text-[16px] font-medium text-gray-500">
              Manage your Variable Pay
            </p>
          </div>
          <div className="mx-4">
            <div className="mt-[60px]">
              <div className="flex items-center justify-start">
                <p className="text-gray-500 text-md font-medium my-3 mr-3">
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
                <div className="flex flex-wrap items-center justify-between">
                  <Title className=" font-bold text-gray-900">
                    {parseInt(vpScore?.score, 10) || 0}%
                  </Title>
                  <div className="flex flex-wrap flex-col">
                    <p className="text-sm text-end text-gray-500">
                      {`${achievedPercentage ? achievedPercentage.toFixed(0) : 0} % achieved out of ${vpScore?.maxScore || 0}%`}
                    </p>
                    <Progress percent={achievedPercentage} showInfo={false} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500 justify-end">
              <span
                className={`font-medium flex items-center ${
                  vpScore?.previousScore >= 0
                    ? 'text-[#0BA259]'
                    : 'text-red-500'
                }`}
              >
                {vpScore?.previousScore}
                {vpScore?.previousScore >= 0 ? <GoArrowUp /> : <GoArrowDown />}
              </span>
              <span className="text-gray-400 text-md font-light">
                vs last month
              </span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default VPPayCard;
