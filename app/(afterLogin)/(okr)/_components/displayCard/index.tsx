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
  const success =
    parseFloat(score?.achievement || '0') / parseFloat(score?.score) || score;
  return (
    <Col span={span}>
      <Card
        loading={isLoading}
        bodyStyle={{ padding: '10px' }}
        bordered={false}
        className={cardColor ? cardColor : ''}
      >
        <div className="mt-2 ">
          <div className="flex justify-between">
            <div className="text-md gap-2 flex items-center mb-2">
              {icon}
              {isTop ? '' : title}
            </div>
            <div className=" flex gap-1 items-center">
              {score?.progress}
              {score?.progressType ? (
                <FaArrowUp className="text-green-500" />
              ) : (
                <FaArrowDown className="text-red-500" />
              )}
            </div>
          </div>
          <div className=" flex  ">
            <div className="w-full">
              <h4>
                {score?.score} {score?.achievement ? '' : '%'}
              </h4>
              {isTop ? <div className="mb-2">{title}</div> : ''}
            </div>
            <div className=" w-[80%] ">
              {score?.achievement ? (
                <div className="">
                  <div className="flex justify-end font-thin text-xs ">
                    {score?.achievement} key result archived
                  </div>
                  <div className="w-full">
                    <Tooltip title={` ${isNaN(success) ? 0 : success * 100} %`}>
                      <Progress
                        percent={isNaN(success) ? 0 : success * 100}
                        showInfo={false}
                        size={{ height: 10 }}
                        className="w-[100%]"
                      />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="flex justify-end font-light">
            Updated: {updatedAt}
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default DashboardCard;
