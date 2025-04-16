import {
  useGetVpScoreCalculate,
  useGetVPScore,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Card, Progress, Skeleton, Typography } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

const { Title } = Typography;
interface PayCardInterface {
  id?: string;
}
const VPPayCard: React.FC<PayCardInterface> = ({ id }) => {
  const userId = useAuthenticationStore.getState().userId;
  const identifier = id ?? userId;

  const { data: vpScore, isLoading: isResponseLoading } =
    useGetVPScore(identifier);

  const {
    isLoading: isUpdatedLoading,
    refetch,
    isRefetching,
  } = useGetVpScoreCalculate(identifier, false);

  const achievedPercentage =
    (parseInt(vpScore?.score, 10) / vpScore?.maxScore) * 100;

  return (
    <Card size="default" bordered={false} className="border-none shadow-none">
      {isResponseLoading ? (
        <Skeleton active />
      ) : (
        <>
          <div className="">
            <div className="mt-[10px]">
              <div className="flex items-center justify-start">
                <p className="text-gray-500 text-md font-medium my-3 mr-3">
                  Total VP Score
                </p>

                <Button
                  type="text"
                  size="small"
                  icon={
                    <AiOutlineReload
                      size={14}
                      className=" cursor-pointer text-gray-600"
                    />
                  }
                  onClick={() => {
                    refetch();
                  }}
                />
              </div>
              <div className="relative ">
                <div className="">
                  <Title className=" font-bold text-gray-700 flex flex-wrap justify-between  ">
                    {(isResponseLoading && !vpScore) ||
                    isUpdatedLoading ||
                    isRefetching ? (
                      <Skeleton
                        active
                        paragraph={false}
                        title={{ width: 80 }}
                      />
                    ) : (
                      `${Number(vpScore?.score).toFixed(2)}%`
                    )}

                    <div className="flex flex-wrap flex-col">
                      <p className="text-xs font-extralight text-end text-gray-400">
                        {`${Number(vpScore?.score) ? Number(vpScore?.score).toFixed(2) : 0} % achieved out of ${vpScore?.maxScore || 0}%`}
                      </p>
                      <Progress
                        percent={achievedPercentage}
                        showInfo={false}
                        strokeColor="#3636F0"
                      />
                    </div>
                  </Title>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500 justify-start">
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
