import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { Card, Progress, Tooltip } from 'antd';

const DashboardCard: React.FC<OKRProps> = ({
  userOkr,
  updatedAt,
  title,
  icon,
  isTop,
  cardColor,
  okrCompleted,
  keyResultCount,
}) => {
  const success = keyResultCount / okrCompleted;
  return (
    <Card
      bodyStyle={{ padding: '10px' }}
      bordered={false}
      className={cardColor ? cardColor : ''}
    >
      <div className="mt-2">
        <div className="flex justify-between">
          <div className="text-md gap-2 flex items-center mb-2">
            {icon}
            {isTop ? '' : title}
          </div>
          <div className="flex gap-1 items-center">
            {userOkr}
            {/* {score?.progressType ? (
              <FaArrowUp className="text-green-500" />
            ) : (
              <FaArrowDown className="text-red-500" />
            )} */}
          </div>
        </div>
        <div className=" flex  ">
          <div className="w-full">
            <h4>{/* {score?.score} {score?.achievement ? '' : '%'} */}</h4>
            {isTop ? <div className="mb-2">{title}</div> : ''}
          </div>
          <div className=" w-[80%] ">
            {okrCompleted ? (
              <div className="">
                <div className="flex justify-end font-thin text-xs ">
                  {okrCompleted} key result archived
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
        <div className="flex justify-end font-light">Updated: {updatedAt}</div>
      </div>
    </Card>
  );
};

export default DashboardCard;
