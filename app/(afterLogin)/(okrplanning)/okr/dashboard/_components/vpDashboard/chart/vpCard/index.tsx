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
      className="border-[1px] border-gray-200 p-3 shadow-none h-full"
      bodyStyle={{ padding: '0px', margin: '0px' }}
      id="okr-vppaycard-card-display-card"
      data-cy="okr-vppaycard-card-display-card"
    >
      <div
        className="py-1 flex flex-col gap-1 "
        id="okr-vppaycard-body-display-div"
        data-cy="okr-vppaycard-body-display-div"
      >
        <div
          id="okr-vppaycard-content-wrapper-display-div"
          data-cy="okr-vppaycard-content-wrapper-display-div"
        >
          <div
            className="flex items-center justify-start"
            id="okr-vppaycard-header-display-div"
            data-cy="okr-vppaycard-header-display-div"
          >
            <p
              className="text-gray-400 text-xs font-normal my-1"
              id="okr-vppaycard-title-display-p"
              data-cy="okr-vppaycard-title-display-p"
            >
              Total VP Score
            </p>

            <Button
              type="text"
              size="small"
              icon={
                <AiOutlineReload
                  data-cy="okr-vppaycard-refresh-button-icon-display-icon"
                  size={14}
                  className=" cursor-pointer text-gray-400"
                />
              }
              onClick={() => {
                refetch();
              }}
              id="okr-vppaycard-refresh-button-display-button"
              data-cy="okr-vppaycard-refresh-button-display-button"
            />
          </div>
          <div
            className="flex items-center justify-between  my-1 "
            id="okr-vppaycard-score-section-display-div"
            data-cy="okr-vppaycard-score-section-display-div"
          >
            {(isResponseLoading && !vpScore) ||
            isUpdatedLoading ||
            isRefetching ? (
              <Skeleton
                active
                paragraph={false}
                title={{ width: 80 }}
                data-cy="okr-vppaycard-loading-skeleton-display-skeleton"
              />
            ) : (
              <div
                className="text-4xl font-bold"
                id="okr-vppaycard-score-value-display-div"
                data-cy="okr-vppaycard-score-value-display-div"
              >
                {Number(vpScore?.score).toFixed(2)}%
              </div>
            )}

            <div
              className="flex flex-wrap flex-col"
              id="okr-vppaycard-progress-wrapper-display-div"
              data-cy="okr-vppaycard-progress-wrapper-display-div"
            >
              <p
                className="text-xs font-extralight text-end text-gray-400"
                id="okr-vppaycard-progress-text-display-p"
                data-cy="okr-vppaycard-progress-text-display-p"
              >
                {`${Number(vpScore?.score) ? Number(vpScore?.score).toFixed(2) : 0} % achieved out of ${vpScore?.maxScore || 0}%`}
              </p>
              <Progress
                percent={achievedPercentage}
                showInfo={false}
                strokeColor="#3636F0"
                data-cy="okr-vppaycard-progress-bar-display-progress"
              />
            </div>
          </div>
        </div>
        <div
          className="flex items-center mt-1 text-sm text-gray-500 justify-start"
          id="okr-vppaycard-change-section-display-div"
          data-cy="okr-vppaycard-change-section-display-div"
        >
          <span
            className={`text-xs font-extralight flex items-center ${
              vpScore?.score - vpScore?.previousScore >= 0
                ? 'text-[#0BA259]'
                : 'text-red-500'
            }`}
            id="okr-vppaycard-change-value-display-span"
            data-cy="okr-vppaycard-change-value-display-span"
          >
            {((vpScore?.score ?? 0) - (vpScore?.previousScore ?? 0)).toFixed(2)}
            {vpScore?.score - vpScore?.previousScore >= 0 ? (
              <GoArrowUp data-cy="okr-vppaycard-change-value-display-span-icon-display-icon" />
            ) : (
              <GoArrowDown data-cy="okr-vppaycard-change-value-display-span-icon-display-icon" />
            )}
          </span>
          <span
            className="text-gray-400 text-xs font-extralight"
            id="okr-vppaycard-change-label-display-span"
            data-cy="okr-vppaycard-change-label-display-span"
          >
            vs last month
          </span>
        </div>
      </div>
    </Card>
  );
};

export default VPPayCard;
