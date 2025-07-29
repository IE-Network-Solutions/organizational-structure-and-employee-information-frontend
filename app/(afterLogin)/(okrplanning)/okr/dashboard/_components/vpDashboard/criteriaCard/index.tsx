import React from 'react';
import { Card, Col, Progress, Row, Skeleton } from 'antd';
import { GoArrowUp, GoArrowDown } from 'react-icons/go';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface CriteriaCardProps {
  id?: string;
}
const CriteriaCard: React.FC<CriteriaCardProps> = ({ id }) => {
  const userId = useAuthenticationStore.getState().userId;
  const identifier = id ?? userId;

  const { data: criteriaCardData, isLoading: isResponseLoading } =
    useGetVPScore(identifier);

  return (
    <div className="relative my-10 mx-5">
      {isResponseLoading || !criteriaCardData ? (
        <Skeleton active />
      ) : (
        <Row className="" gutter={[16, 16]}>
          {criteriaCardData?.criteria?.map((item: any, index: any) => {
            const change =
              item?.score.toFixed(2) - item?.previousScore.toFixed(2);
            const achievedPercentage = Number(
              ((item?.score / item?.weight) * 100).toFixed(1),
            );
            return (
              <Col key={index} xs={24} sm={12} md={12} lg={8}>
                <Card
                  bodyStyle={{ padding: '0px', margin: '0px' }}
                  className=" bg-[#FAFAFA] p-3"
                  bordered={false}
                >
                  <h3 className="text-xs font-normal text-gray-500 mb-2">
                    {item?.name}
                  </h3>
                  <div className="flex  items-center justify-between gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(item?.score?.toFixed(2))}%
                    </p>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-extralight text-end text-gray-500">
                        {`${Number(item?.score) ? Number(item?.score).toFixed(1) : 0} % achieved out of ${item?.weight || 0}%`}
                      </p>
                      <Progress percent={achievedPercentage} showInfo={false} />
                    </div>
                  </div>
                  <div className="flex items-center mt-1 text-xs font-extralight text-gray-500 justify-end">
                    <span
                      className={` flex items-center ${
                        change > 0
                          ? 'text-[#0BA259]'
                          : change < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                      }`}
                    >
                      {change?.toFixed(2) || 0}
                      {change > 0 ? (
                        <GoArrowUp />
                      ) : change < 0 ? (
                        <GoArrowDown />
                      ) : (
                        ' '
                      )}
                    </span>
                    <span className="">vs last month</span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default CriteriaCard;
