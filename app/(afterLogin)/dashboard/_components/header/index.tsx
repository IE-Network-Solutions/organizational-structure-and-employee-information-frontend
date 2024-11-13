'use client';
import RookStarsList from '@/app/(afterLogin)/(okr)/_components/rookStarsList';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ListData } from '@/types/dashboard/okr';
import { Card, Progress } from 'antd';
import { GoGoal } from 'react-icons/go';
import ApprovalStatus from '../approval-status';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import { MdKey } from 'react-icons/md';

const listData: ListData[] = [
  {
    key: '1',
    name: 'Samuel Anteneh',
    title: 'Software Engineer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    completion: 95,
  },
  {
    key: '2',
    name: 'John Doe',
    title: 'Project Manager',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    completion: 92,
  },
  {
    key: '3',
    name: 'Jane Smith',
    title: 'UI/UX Designer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
    completion: 96,
  },
  {
    key: '4',
    name: 'Emily Johnson',
    title: 'Product Owner',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
    completion: 98,
  },
  {
    key: '5',
    name: 'Michael Brown',
    title: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=5',
    completion: 94,
  },
];

const Header = () => {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } =
    useGetUserObjectiveDashboard(userId);
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();

  return (
    <>
      {/* Cards Section */}
      <div className="flex space-x-4  overflow-x-auto overflow-y-hidden scrollbar-none  max-h-36 w-full mb-4">
        <Card
          loading={isLoading}
          className="rounded-lg min-w-[300px] bg-white  relative p-2"
          bordered={false}
          bodyStyle={{ padding: '10px' }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152F3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>

          <div className="flex flex-col">
            <div className="">
              <div className="text-2xl font-bold ">
                {objectiveDashboard?.userOkr || 0} %
              </div>
            </div>

            <div className="text-gray-500  w-full text-start text-xs">
              Average OKR Score
            </div>
          </div>

          {/* <div className="text-gray-500  w-full text-start text-xs">
            Total Planned
          </div>
          <div className="flex justify-end">
            <div className="bg-light_purple text-purple px-4 py-1  rounded-lg min-w-28">
              {item.label}
            </div>
          </div> */}
        </Card>
        <Card
          loading={isLoading}
          className="rounded-lg min-w-[300px] bg-white  relative p-2"
          bordered={false}
          bodyStyle={{ padding: '10px' }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152F3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>

          <div className="flex flex-col">
            <div className="">
              <div className="text-2xl font-bold ">
                {objectiveDashboard?.supervisorOkr || 0} %
              </div>
            </div>

            <div className="text-gray-500  w-full text-start text-xs">
              Supervisor OKR score
            </div>
          </div>

          {/* <div className="text-gray-500  w-full text-start text-xs">
            Total Planned
          </div>
          <div className="flex justify-end">
            <div className="bg-light_purple text-purple px-4 py-1  rounded-lg min-w-28">
              {item.label}
            </div>
          </div> */}
        </Card>
        <Card
          loading={isLoading}
          className="rounded-lg min-w-[300px] bg-white  relative p-2"
          bordered={false}
          bodyStyle={{ padding: '10px' }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <GoGoal size={12} className="text-[#7152F3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>

          <div className="flex flex-col">
            <div className="">
              <div className="text-2xl font-bold ">
                {objectiveDashboard?.companyOkr || 0} %
              </div>
            </div>

            <div className="text-gray-500  w-full text-start text-xs">
              Company OKR score
            </div>
          </div>

          {/* <div className="text-gray-500  w-full text-start text-xs">
            Total Planned
          </div>
          <div className="flex justify-end">
            <div className="bg-light_purple text-purple px-4 py-1  rounded-lg min-w-28">
              {item.label}
            </div>
          </div> */}
        </Card>
        <Card
          loading={isLoading}
          className="rounded-lg shadow-lg min-w-[300px] bg-light_purple text-center relative p-2"
          bordered={false}
          bodyStyle={{ padding: '10px' }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-100 rounded-md">
              <MdKey size={12} className="text-[#7152F3] w-8 h-8 p-2" />
            </div>
            {/* <div className=" text-green-500 text-xs font-bold">12.7 ↑</div> */}
          </div>

          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-xl font-bold ">
                {objectiveDashboard?.keyResultCount || 0}
              </div>
            </div>
            <div className="">
              <div className="text-xs text-gray-400 text-end">
                <span className="text-blue">
                  {' '}
                  {`${Number(objectiveDashboard?.okrCompleted || 0)} / ${Number(objectiveDashboard?.keyResultCount || 0)}`}
                </span>{' '}
                Key Results achieved
              </div>
              <Progress
                percent={
                  (Number(objectiveDashboard?.okrCompleted || 0) /
                    Number(objectiveDashboard?.keyResultCount || 0)) *
                  100
                }
                showInfo={false}
                strokeColor="#4c6ef5"
                trailColor="#f5f5f5"
              />
            </div>
          </div>

          <div className="text-gray-500  w-full text-start text-xs">
            Total Planned
          </div>
        </Card>
      </div>

      {/* Bottom Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <RookStarsList
            planningPeriodId={'planningPeriodId'}
            title="Rock Star Of The Week"
          />
          <ApprovalStatus />
        </div>

        {/* Right Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <RookStarsList
            planningPeriodId={'planningPeriodId'}
            title="Leaders Board"
          />
          <CardList
            type="birthday"
            title="Whose Birthday is today?"
            people={birthDays || []}
            loading={birthdayLoading}
          />
          <CardList
            type="anniversary"
            title="Work Anniversary"
            people={workAnniversary || []}
            loading={workLoading}
          />
        </div>
      </div>
    </>
  );
};

export default Header;
