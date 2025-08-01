import {
  useGetVpScoreCalculate,
  useGetVPScore,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Card, Progress, Skeleton } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

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
    <Card
      loading={isResponseLoading}
      size="default"
      bordered={false}
      className="border-[1px] border-gray-200 p-3 shadow-none "
      bodyStyle={{ padding: '0px', margin: '0px' }}
    >
      <div className="py-1 flex flex-col gap-1 ">
        <div className="">
          <div className="flex items-center justify-start">
            <p className="text-gray-400 text-xs font-normal my-1">
              Total VP Score
            </p>

            <Button
              type="text"
              size="small"
              icon={
                <AiOutlineReload
                  size={14}
                  className=" cursor-pointer text-gray-400"
                />
              }
              onClick={() => {
                refetch();
              }}
            />
          </div>
          <div className="flex items-center justify-between  my-1 ">
            {(isResponseLoading && !vpScore) ||
            isUpdatedLoading ||
            isRefetching ? (
              <Skeleton active paragraph={false} title={{ width: 80 }} />
            ) : (
              <div className="text-4xl font-bold">
                {Number(vpScore?.score).toFixed(2)}%
              </div>
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
          </div>
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-500 justify-start">
          <span
            className={`text-xs font-extralight flex items-center ${
              vpScore?.score - vpScore?.previousScore >= 0
                ? 'text-[#0BA259]'
                : 'text-red-500'
            }`}
          >
            {((vpScore?.score ?? 0) - (vpScore?.previousScore ?? 0)).toFixed(2)}
            {vpScore?.score - vpScore?.previousScore >= 0 ? (
              <GoArrowUp />
            ) : (
              <GoArrowDown />
            )}
          </span>
          <span className="text-gray-400 text-xs font-extralight">
            vs last month
          </span>
        </div>
      </div>
    </Card>
  );
};

export default VPPayCard;
