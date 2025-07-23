'use client';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card, Progress } from 'antd';
// import { useRouter } from 'next/navigation';
import { GoGoal } from 'react-icons/go';

const Header = () => {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } =
    useGetUserObjectiveDashboard(userId);
  const { data: vpScore } = useGetVPScore(userId);
  // const router = useRouter();

  const onDetail = () => {
    // router.push(`/okr/vp`);
  };

  return (
    <>
      <div className="  w-full mb-4 flex overflow-x-auto  2xl:grid 2xl:grid-cols-5 gap-4 scrollbar-none">
        <Card
          loading={isLoading}
          bordered={false}
          bodyStyle={{ padding: '10px' }}
          className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-56  sm:shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">
                {Number(objectiveDashboard?.userOkr?.toFixed(2))}
              </div>
            </div>
            <div className="xl:min-w-28">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-[#3636F0]">
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
          <div className="text-gray-500  w-full text-start text-xs">
            Average OKR
          </div>
        </Card>
        <Card
          loading={isLoading}
          bordered={false}
          bodyStyle={{ padding: '10px' }}
          className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>

          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">
                {Number(objectiveDashboard?.supervisorOkr?.toFixed(2))}
              </div>
            </div>
            <div className="xl:min-w-28">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-[#3636F0]">
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
                    Number(objectiveDashboard?.supervisorKeyResultCount || 1)) *
                    100,
                )}
                showInfo={false}
                strokeColor="#3636F0"
                trailColor="#f5f5f5"
              />
            </div>
          </div>
          <div className="text-gray-500  w-full text-start text-xs">
            Supervisor OKR
          </div>
        </Card>
        <Card
          loading={isLoading}
          bordered={false}
          bodyStyle={{ padding: '10px' }}
          className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">
                {objectiveDashboard?.companyOkr.toFixed(2) || 0}
              </div>
            </div>
            <div className="xl:min-w-28">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-[#3636F0]">
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
          <div className="text-gray-500  w-full text-start text-xs">
            Company OKR
          </div>
        </Card>
        <Card
          loading={isLoading}
          bordered={false}
          bodyStyle={{ padding: '10px' }}
          className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-xl "
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>
          <div className="flex items-center justify-between">
            <div className="">
              <span className="text-xl font-bold ">
                {`${Number(objectiveDashboard?.okrCompleted || 0)} / `}
              </span>
              <span className="text-xs font-bold ">
                {Number(objectiveDashboard?.keyResultCount || 0)}
              </span>
            </div>
            <div className=" xl:min-w-28">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-[#3636F0]">
                  {`${Number(objectiveDashboard?.okrCompleted || 0)} / ${Number(objectiveDashboard?.keyResultCount || 0)}`}
                </span>{' '}
                achieved
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
          <div className="text-gray-500  w-full text-start text-xs">
            KR Planned
          </div>
        </Card>
        <Card
          loading={isLoading}
          bordered={false}
          bodyStyle={{ padding: '10px' }}
          className="flex flex-col gap-4 rounded-lg bg-white p-2 min-w-52  sm:shrink-0 shadow-xl"
          onClick={() => onDetail()}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152f3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>
          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">{vpScore?.score || 0} %</div>
            </div>
            <div className="xl:min-w-28">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-[#3636F0]">
                  {`${Math.round(Number(vpScore?.score || 0))}`} %
                </span>{' '}
                Achieved out of 30
              </div>
              <Progress
                percent={(Number(vpScore?.score || 0) / 30) * 100}
                showInfo={false}
                strokeColor="#3636F0"
                trailColor="#f5f5f5"
              />
            </div>
          </div>
          <div className="text-gray-500  w-full text-start text-xs">
            Total VP Score
          </div>
        </Card>
      </div>
    </>
  );
};

export default Header;
