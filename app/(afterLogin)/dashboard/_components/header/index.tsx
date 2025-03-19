'use client';
import RookStarsList from '@/app/(afterLogin)/(okr)/_components/rookStarsList';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card, Progress } from 'antd';
import { GoGoal } from 'react-icons/go';
import ApprovalStatus from '../approval-status';
import CardList from '../card-list';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import { MdKey } from 'react-icons/md';
import PermissionWraper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRef } from 'react';

const Header = () => {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } =
    useGetUserObjectiveDashboard(userId);
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const { data: workAnniversary, isLoading: workLoading } =
    useGetWorkAnniversary();
  const { data: allPlanningPeriods } = useGetAllPlanningPeriods();
  const planningPeriod = allPlanningPeriods?.items?.find(
    (planningPeriod) => planningPeriod.name == 'Weekly',
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth =
        scrollContainerRef.current.children[0]?.clientWidth || 0;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <div className="relative w-full flex items-center">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 bg-white p-2 shadow-md rounded-full"
        >
          <FaChevronLeft className="text-xl" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4  overflow-x-auto overflow-y-hidden scrollbar-none  max-h-36 mb-4 scroll-smooth no-scrollbar w-[90%] mx-auto"
        >
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
            </div>

            <div className="flex items-center justify-between">
              <div className="">
                <div className="text-xl font-bold ">
                  {Number(objectiveDashboard?.userOkr?.toFixed(2))}
                </div>
              </div>
              <div className="">
                <div className="text-xs text-gray-400 text-end">
                  <span className="text-blue">
                    {Number(objectiveDashboard?.userOkr?.toFixed(1) || 0)}%
                  </span>{' '}
                  Average OKR
                </div>
                <Progress
                  percent={Number(objectiveDashboard?.userOkr || 0)}
                  showInfo={false}
                  strokeColor="#3636ee"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div className="text-gray-500  w-full text-start text-xs">
              Average OKR Score
            </div>
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

            <div className="flex items-center justify-between">
              <div className="">
                <div className="text-xl font-bold ">
                  {Number(objectiveDashboard?.supervisorOkr?.toFixed(2))}
                </div>
              </div>
              <div className="">
                <div className="text-xs text-gray-400 text-end">
                  <span className="text-blue">
                    {Number(objectiveDashboard?.supervisorOkr?.toFixed(1) || 0)}
                    %
                  </span>{' '}
                  Supervisor OKR
                </div>
                <Progress
                  percent={Number(objectiveDashboard?.supervisorOkr || 0)}
                  showInfo={false}
                  strokeColor="#4c6ef5"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
            <div className="text-gray-500  w-full text-start text-xs">
              Supervisor OKR score
            </div>
          </Card>
          <PermissionWraper permissions={[Permissions.ViewCompanyOkr]}>
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
              </div>

              <div className="flex items-center justify-between">
                <div className="">
                  <div className="text-xl font-bold ">
                    {objectiveDashboard?.companyOkr.toFixed(2) || 0}
                  </div>
                </div>
                <div className="">
                  <div className="text-xs text-gray-400 text-end">
                    <span className="text-blue">
                      {Number(
                        objectiveDashboard?.companyOkr.toFixed(1),
                      )?.toLocaleString() || 0}{' '}
                      %
                    </span>{' '}
                    Company OKR
                  </div>
                  <Progress
                    percent={Number(objectiveDashboard?.companyOkr || 0)}
                    showInfo={false}
                    strokeColor="#4c6ef5"
                    trailColor="#f5f5f5"
                  />
                </div>
              </div>
              <div className="text-gray-500  w-full text-start text-xs">
                Company OKR score
              </div>
            </Card>
          </PermissionWraper>
          <Card
            loading={isLoading}
            className="rounded-lg min-w-[300px] bg-white text-center relative p-2"
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
        {/* Right Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow-md rounded-full z-10"
        >
          <FaChevronRight className="text-xl" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <RookStarsList
            planningPeriodId={planningPeriod ? planningPeriod.id : ''}
            title="Rock Star Of The Week"
          />
          <ApprovalStatus />
        </div>

        {/* Right Column */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <RookStarsList
            planningPeriodId={planningPeriod ? planningPeriod.id : ''}
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
