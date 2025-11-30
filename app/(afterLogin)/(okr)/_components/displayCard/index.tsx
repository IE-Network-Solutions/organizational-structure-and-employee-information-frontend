import { DashboardCardProps } from '@/types/dashboard/okr';
import { Card, Col, Progress, Tooltip } from 'antd';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const DashboardCard: React.FC<DashboardCardProps> = ({
  score,
  updatedAt,
  title,
  icon,
  span,
  isTop,
  cardColor,
  isLoading,
}) => {
  return (
    <Col
      span={span}
      id={`okr-dashboard-card-col-${title}`}
      data-cy={`okr-dashboard-card-col-${title}`}
    >
      <Card
        loading={isLoading}
        bodyStyle={{ padding: '10px' }}
        bordered={false}
        className={cardColor ? cardColor : ''}
        id={`okr-dashboard-card-${title}`}
        data-cy={`okr-dashboard-card-${title}`}
      >
        <div
          className="mt-2 "
          id={`okr-dashboard-card-body-${title}`}
          data-cy={`okr-dashboard-card-body-${title}`}
        >
          <div
            className="flex justify-between"
            id={`okr-dashboard-card-header-${title}`}
            data-cy={`okr-dashboard-card-header-${title}`}
          >
            <div
              className="text-md gap-2 flex items-center mb-2"
              id={`okr-dashboard-card-title-wrapper-${title}`}
              data-cy={`okr-dashboard-card-title-wrapper-${title}`}
            >
              {icon}
              {isTop ? '' : title}
            </div>
            <div
              className=" flex gap-1 items-center"
              id={`okr-dashboard-card-score-wrapper-${title}`}
              data-cy={`okr-dashboard-card-score-wrapper-${title}`}
            >
              {score?.progress}
              {score?.progressType ? (
                <FaArrowUp
                  className="text-green-500"
                  id={`okr-dashboard-card-arrow-up-${title}`}
                  data-cy={`okr-dashboard-card-arrow-up-${title}`}
                />
              ) : (
                <FaArrowDown
                  className="text-red-500"
                  id={`okr-dashboard-card-arrow-down-${title}`}
                  data-cy={`okr-dashboard-card-arrow-down-${title}`}
                />
              )}
            </div>
          </div>
          <div
            className=" flex  "
            id={`okr-dashboard-card-content-${title}`}
            data-cy={`okr-dashboard-card-content-${title}`}
          >
            <div
              className="w-full"
              id={`okr-dashboard-card-score-content-${title}`}
              data-cy={`okr-dashboard-card-score-content-${title}`}
            >
              <h4
                id={`okr-dashboard-card-score-text-${title}`}
                data-cy={`okr-dashboard-card-score-text-${title}`}
              >
                {score?.score} {score?.achievement ? '' : '%'}
              </h4>
              {isTop ? (
                <div
                  className="mb-2"
                  id={`okr-dashboard-card-subtitle-${title}`}
                  data-cy={`okr-dashboard-card-subtitle-${title}`}
                >
                  {title}
                </div>
              ) : (
                ''
              )}
            </div>
            <div
              className=" w-[80%] "
              id={`okr-dashboard-card-progress-section-${title}`}
              data-cy={`okr-dashboard-card-progress-section-${title}`}
            >
              {score?.achievement ? (
                <div
                  className=""
                  id={`okr-dashboard-card-achievement-wrapper-${title}`}
                  data-cy={`okr-dashboard-card-achievement-wrapper-${title}`}
                >
                  <div
                    className="flex justify-end font-thin text-xs "
                    id={`okr-dashboard-card-achievement-text-${title}`}
                    data-cy={`okr-dashboard-card-achievement-text-${title}`}
                  >
                    {score?.achievement} key result archived
                  </div>
                  <div
                    className="w-full"
                    id={`okr-dashboard-card-progress-wrapper-${title}`}
                    data-cy={`okr-dashboard-card-progress-wrapper-${title}`}
                  >
                    <Tooltip
                      title={0}
                      id={`okr-dashboard-card-progress-tooltip-${title}`}
                      data-cy={`okr-dashboard-card-progress-tooltip-${title}`}
                    >
                      <Progress
                        percent={0}
                        showInfo={false}
                        size={{ height: 10 }}
                        className="w-[100%]"
                        data-cy={`okr-dashboard-card-progress-${title}`}
                      />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div
            className="flex justify-end font-light"
            id={`okr-dashboard-card-updated-${title}`}
            data-cy={`okr-dashboard-card-updated-${title}`}
          >
            Updated: {updatedAt}
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default DashboardCard;
