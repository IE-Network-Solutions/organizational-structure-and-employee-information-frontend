'use client';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { Card, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { GoGoal } from 'react-icons/go';

const Header = () => {
  const { userId, tenantId } = useAuthenticationStore();
  const { data: subscriptionResp } = useGetSubscriptionByTenant(
    tenantId as string,
    !!tenantId,
  );
  const hasOKR = !!(subscriptionResp as any)?.plan?.modules?.some(
    (m: any) => m?.module?.description === '/okr',
  );
  const { data: objectiveDashboard, isLoading } = useGetUserObjectiveDashboard(
    userId,
    undefined,
    undefined,
    hasOKR,
  );
  const { data: vpScore } = useGetVPScore(userId, hasOKR);
  const router = useRouter();

  const onDetail = () => {
    router.push(`/dashboard/vp`);
  };

  return (
    <>
      {hasOKR && (
        <div
          className="  w-full pb-6 flex overflow-x-auto  2xl:grid 2xl:grid-cols-5 gap-4 scrollbar-none"
          data-cy="okr-header-cards"
        >
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: '10px' }}
            className="flex flex-col gap-3 rounded-lg bg-white p-2 min-w-56  sm:shrink-0 shadow-lg"
            data-cy="okr-card-average-okr"
          >
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-header"
            >
              <div
                className="bg-gray-100 rounded-md"
                data-cy="okr-card-icon-container"
              >
                <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
              </div>
            </div>
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-content"
            >
              <div className="" data-cy="okr-card-value-container">
                <div className="text-xl font-bold " data-cy="okr-card-value">
                  {Number(objectiveDashboard?.userOkr?.toFixed(2))}
                </div>
              </div>
              <div className="xl:min-w-28" data-cy="okr-card-details">
                <div
                  className="text-xs text-gray-400 text-end"
                  data-cy="okr-card-details-text"
                >
                  <span
                    className="text-[#3636F0]"
                    data-cy="okr-card-completed-count"
                  >
                    {Number(objectiveDashboard?.okrCompleted || 0)}
                  </span>{' '}
                  Key Results Achieved
                </div>
                <Progress
                  percent={Number(
                    (Number(objectiveDashboard?.okrCompleted || 0) /
                      Number(objectiveDashboard?.keyResultCount || 1)) *
                      100,
                  )}
                  showInfo={false}
                  strokeColor="#3636F0"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>

            <div
              className="text-gray-500  w-full text-start text-xs"
              data-cy="okr-card-label"
            >
              Average OKR
            </div>
          </Card>
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: '10px' }}
            className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-lg"
            data-cy="okr-card-supervisor-okr"
          >
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-header"
            >
              <div
                className="bg-gray-100 rounded-md"
                data-cy="okr-card-icon-container"
              >
                <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
              </div>
              {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
            </div>

            <div
              className="flex items-center justify-between"
              data-cy="okr-card-content"
            >
              <div className="" data-cy="okr-card-value-container">
                <div className="text-xl font-bold " data-cy="okr-card-value">
                  {Number(objectiveDashboard?.supervisorOkr?.toFixed(2))}
                </div>
              </div>
              <div className="xl:min-w-28" data-cy="okr-card-details">
                <div
                  className="text-xs text-gray-400 text-end"
                  data-cy="okr-card-details-text"
                >
                  <span
                    className="text-[#3636F0]"
                    data-cy="okr-card-completed-count"
                  >
                    {Number(
                      objectiveDashboard?.supervisorKeyResultAchieved?.toFixed(
                        1,
                      ) || 0,
                    )}
                  </span>{' '}
                  Key Results Achieved
                </div>
                <Progress
                  percent={Number(
                    (Number(
                      objectiveDashboard?.supervisorKeyResultAchieved || 0,
                    ) /
                      Number(
                        objectiveDashboard?.supervisorKeyResultCount || 1,
                      )) *
                      100,
                  )}
                  showInfo={false}
                  strokeColor="#3636F0"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div
              className="text-gray-500  w-full text-start text-xs"
              data-cy="okr-card-label"
            >
              Supervisor OKR
            </div>
          </Card>
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: '10px' }}
            className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-lg"
            data-cy="okr-card-company-okr"
          >
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-header"
            >
              <div
                className="bg-gray-100 rounded-md"
                data-cy="okr-card-icon-container"
              >
                <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
              </div>
            </div>

            <div
              className="flex items-center justify-between"
              data-cy="okr-card-content"
            >
              <div className="" data-cy="okr-card-value-container">
                <div className="text-xl font-bold " data-cy="okr-card-value">
                  {objectiveDashboard?.companyOkr?.toFixed(2) || 0}
                </div>
              </div>
              <div className="xl:min-w-28" data-cy="okr-card-details">
                <div
                  className="text-xs text-gray-400 text-end"
                  data-cy="okr-card-details-text"
                >
                  <span
                    className="text-[#3636F0]"
                    data-cy="okr-card-completed-count"
                  >
                    {Number(
                      objectiveDashboard?.companyOkr.toFixed(1),
                    )?.toLocaleString() || 0}{' '}
                  </span>{' '}
                  OKR Achieved
                </div>
                <Progress
                  percent={Number(objectiveDashboard?.companyOkr || 0)}
                  showInfo={false}
                  strokeColor="#3636F0"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div
              className="text-gray-500  w-full text-start text-xs"
              data-cy="okr-card-label"
            >
              Company OKR
            </div>
          </Card>
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: '10px' }}
            className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-lg "
            data-cy="okr-card-kr-planned"
          >
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-header"
            >
              <div
                className="bg-gray-100 rounded-md"
                data-cy="okr-card-icon-container"
              >
                <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
              </div>
              {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
            </div>
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-content"
            >
              <div className="" data-cy="okr-card-value-container">
                <span
                  className="text-xl font-bold "
                  data-cy="okr-card-value-completed"
                >
                  {`${Number(objectiveDashboard?.okrCompleted || 0)} / `}
                </span>
                <span
                  className="text-xs font-bold "
                  data-cy="okr-card-value-total"
                >
                  {Number(objectiveDashboard?.keyResultCount || 0)}
                </span>
              </div>
              <div className=" xl:min-w-28" data-cy="okr-card-details">
                <div
                  className="text-xs text-gray-400 text-end"
                  data-cy="okr-card-details-text"
                >
                  <span
                    className="text-[#3636F0]"
                    data-cy="okr-card-achieved-ratio"
                  >
                    {`${Number(objectiveDashboard?.okrCompleted || 0)} / ${Number(objectiveDashboard?.keyResultCount || 0)}`}
                  </span>{' '}
                  Achieved
                </div>
                <Progress
                  percent={
                    (Number(objectiveDashboard?.okrCompleted || 0) /
                      Number(objectiveDashboard?.keyResultCount || 0)) *
                    100
                  }
                  showInfo={false}
                  strokeColor="#3636F0"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div
              className="text-gray-500  w-full text-start text-xs"
              data-cy="okr-card-label"
            >
              KR Planned
            </div>
          </Card>
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: '10px' }}
            className="flex flex-col gap-[10px] rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-lg"
            onClick={() => onDetail()}
            data-cy="okr-card-vp-score"
          >
            <div
              className="flex items-center justify-between"
              data-cy="okr-card-header"
            >
              <div
                className="bg-gray-100 rounded-md"
                data-cy="okr-card-icon-container"
              >
                <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
              </div>
              {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
            </div>
            <div
              className="flex items-center justify-between "
              data-cy="okr-card-content"
            >
              <div className="" data-cy="okr-card-value-container">
                <div className="text-xl font-bold " data-cy="okr-card-value">
                  {vpScore?.score || 0} %
                </div>
              </div>
              <div className="xl:min-w-28 " data-cy="okr-card-details">
                <div
                  className="text-xs text-gray-400 text-end"
                  data-cy="okr-card-details-text"
                >
                  <span
                    className="text-[#3636F0]"
                    data-cy="okr-card-vp-achieved"
                  >
                    {`${Math.round(Number(vpScore?.score || 0))}`} /
                    {`${Math.round(Number(vpScore?.maxScore || 0))}`}
                  </span>{' '}
                  Achieved
                </div>
                <Progress
                  percent={(Number(vpScore?.score || 0) / 30) * 100}
                  showInfo={false}
                  strokeColor="#3636F0"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div
              className="text-gray-500  w-full text-start text-xs"
              data-cy="okr-card-label"
            >
              Total VP Score
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Header;
