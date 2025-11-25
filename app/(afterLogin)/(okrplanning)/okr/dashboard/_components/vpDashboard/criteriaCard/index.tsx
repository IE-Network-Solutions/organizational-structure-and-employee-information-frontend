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
    <div
      className="relative my-10 mx-2"
      id="okr-criteriacard-container-display-div"
      data-cy="okr-criteriacard-container-display-div"
    >
      {isResponseLoading || !criteriaCardData ? (
        <Skeleton
          active
     
          data-cy="okr-criteriacard-loading-skeleton-display-skeleton"
        />
      ) : (
        <Row
          className=""
          gutter={[16, 16]}
          id="okr-criteriacard-row-display-row"
          data-cy="okr-criteriacard-row-display-row"
        >
          {criteriaCardData?.criteria?.map((item: any, index: any) => {
            const change =
              item?.score.toFixed(2) - item?.previousScore.toFixed(2);
            const achievedPercentage = Number(
              ((item?.score / item?.weight) * 100).toFixed(1),
            );
            return (
              <Col
                key={index}
                xs={24}
                sm={12}
                md={12}
                lg={8}
                id={`okr-criteriacard-col-display-col-${index}`}
                data-cy={`okr-criteriacard-col-display-col-${index}`}
              >
                <Card
                  bodyStyle={{ padding: '0px', margin: '0px' }}
                  className=" bg-[#FAFAFA] p-3"
                  bordered={false}
                  id={`okr-criteriacard-card-display-card-${index}`}
                  data-cy={`okr-criteriacard-card-display-card-${index}`}
                >
                  <h3
                    className="text-xs font-normal text-gray-500 mb-2"
                    id={`okr-criteriacard-name-display-h3-${index}`}
                    data-cy={`okr-criteriacard-name-display-h3-${index}`}
                  >
                    {item?.name}
                  </h3>
                  <div
                    className="flex  items-center justify-between gap-2"
                    id={`okr-criteriacard-score-section-display-div-${index}`}
                    data-cy={`okr-criteriacard-score-section-display-div-${index}`}
                  >
                    <p
                      className="text-2xl font-bold text-gray-900"
                      id={`okr-criteriacard-score-value-display-p-${index}`}
                      data-cy={`okr-criteriacard-score-value-display-p-${index}`}
                    >
                      {Number(item?.score?.toFixed(2))}%
                    </p>
                    <div
                      className="flex flex-col"
                      id={`okr-criteriacard-progress-wrapper-display-div-${index}`}
                      data-cy={`okr-criteriacard-progress-wrapper-display-div-${index}`}
                    >
                      <p
                        className="text-[10px] font-extralight text-end text-gray-500"
                        id={`okr-criteriacard-progress-text-display-p-${index}`}
                        data-cy={`okr-criteriacard-progress-text-display-p-${index}`}
                      >
                        {`${Number(item?.score) ? Number(item?.score).toFixed(1) : 0} % achieved out of ${item?.weight || 0}%`}
                      </p>
                      <Progress
                        percent={achievedPercentage}
                        showInfo={false}
                        strokeColor={item?.isDeduction ? '#ff0000' : '#3636F0'}
                        data-cy={`okr-criteriacard-progress-bar-display-progress-${index}`}
                      />
                    </div>
                  </div>
                  <div
                    className="flex items-center mt-1 text-xs font-extralight text-gray-500 justify-end"
                    id={`okr-criteriacard-change-section-display-div-${index}`}
                    data-cy={`okr-criteriacard-change-section-display-div-${index}`}
                  >
                    <span
                      className={` flex items-center ${
                        change > 0
                          ? 'text-[#0BA259]'
                          : change < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                      }`}
                      id={`okr-criteriacard-change-value-display-span-${index}`}
                      data-cy={`okr-criteriacard-change-value-display-span-${index}`}
                    >
                      {change?.toFixed(2) || 0}
                      {change > 0 ? (
                        <GoArrowUp data-cy="okr-criteriacard-change-value-display-span-icon-display-icon" />
                      ) : change < 0 ? (
                        <GoArrowDown data-cy="okr-criteriacard-change-value-display-span-icon-display-icon" />
                      ) : (
                        '  '
                      )}
                    </span>
                    <span
                      className=""
                      id={`okr-criteriacard-change-label-display-span-${index}`}
                      data-cy={`okr-criteriacard-change-label-display-span-${index}`}
                    >
                      {' '}
                      vs last month
                    </span>
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
