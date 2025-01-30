import {
  useGetVpScoreCalculate,
  useGetVPScore,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Card, Progress, Skeleton, Typography } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

const { Title } = Typography;
const VPPayCard: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { data: vpScore, isLoading: isResponseLoading } = useGetVPScore(userId);

  const {
    isLoading: isUpdatedLoading,
    refetch,
    isRefetching,
  } = useGetVpScoreCalculate(userId, false);

  const achievedPercentage =
    (parseInt(vpScore?.score, 10) / 100) * vpScore?.maxScore;

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
                ></Button>
              </div>
              <div className="relative ">
                <div className="flex flex-wrap items-center justify-between">
                  <Title className=" font-bold text-gray-900">
                    {(isResponseLoading && !vpScore) ||
                    isUpdatedLoading ||
                    isRefetching ? (
                      <Skeleton
                        active
                        paragraph={false}
                        title={{ width: 80 }}
                      />
                    ) : (
                      `${vpScore?.score}`
                    )}
                  </Title>

                  <div className="flex flex-wrap flex-col">
                    <p className="text-sm text-end text-gray-500">
                      {`${achievedPercentage ? achievedPercentage.toFixed(1) : 0} % achieved out of ${vpScore?.maxScore || 0}%`}
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
