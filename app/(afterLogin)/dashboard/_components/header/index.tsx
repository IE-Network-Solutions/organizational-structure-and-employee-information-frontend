'use client';
import { useEffect, useState } from 'react';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useGetPersonalRecognition } from '@/store/server/features/CFR/recognition/queries';
import { Card, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { GoGoal } from 'react-icons/go';
import { PiUsersThreeBold } from 'react-icons/pi';
import { PiBuildingOfficeBold } from 'react-icons/pi';
import { PiShuffleAngularBold } from 'react-icons/pi';
import { PiCurrencyDollarSimpleBold } from 'react-icons/pi';
import { MdOutlineMilitaryTech, MdReportGmailerrorred } from 'react-icons/md';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';

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
  const { data: personalRecognition } = useGetPersonalRecognition();

  const totalAppreciationEngagement =
    (personalRecognition?.feedbackIssued?.Engagement?.appreciations || 0) +
    (personalRecognition?.feedbackReceived?.Engagement?.appreciations || 0);

  const totalAppreciationKpi =
    (personalRecognition?.feedbackIssued?.KPI?.appreciations || 0) +
    (personalRecognition?.feedbackReceived?.KPI?.appreciations || 0);

  const totalReprimandEngagement =
    (personalRecognition?.feedbackIssued?.Engagement?.reprimands || 0) +
    (personalRecognition?.feedbackReceived?.Engagement?.reprimands || 0);

  const totalReprimandKpi =
    (personalRecognition?.feedbackIssued?.KPI?.reprimands || 0) +
    (personalRecognition?.feedbackReceived?.KPI?.reprimands || 0);

  const appreciationStats = [
    {
      id: 'engagement',
      label: 'Engagement',
      value: totalAppreciationEngagement,
      trendLabel: '5% Last Week',
      trendDirection: 'up' as const,
    },
    {
      id: 'kpi',
      label: 'KPI',
      value: totalAppreciationKpi,
      trendLabel: '5% Last Week',
      trendDirection: 'up' as const,
    },
  ];

  const reprimandStats = [
    {
      id: 'engagement',
      label: 'Engagement',
      value: totalReprimandEngagement,
      trendLabel: '5% Last Week',
      trendDirection: 'down' as const,
    },
    {
      id: 'kpi',
      label: 'KPI',
      value: totalReprimandKpi,
      trendLabel: '5% Last Week',
      trendDirection: 'down' as const,
    },
  ];

  const [appreciationIndex, setAppreciationIndex] = useState(0);
  const [reprimandIndex, setReprimandIndex] = useState(0);
  const [isAppreciationAnimating, setIsAppreciationAnimating] = useState(false);
  const [isReprimandAnimating, setIsReprimandAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAppreciationIndex((prev) => (prev + 1) % appreciationStats.length);
      setReprimandIndex((prev) => (prev + 1) % reprimandStats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hasOKR) return;

    setIsAppreciationAnimating(true);
    const timeout = setTimeout(() => {
      setIsAppreciationAnimating(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [appreciationIndex, hasOKR]);

  useEffect(() => {
    if (!hasOKR) return;

    setIsReprimandAnimating(true);
    const timeout = setTimeout(() => {
      setIsReprimandAnimating(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [reprimandIndex, hasOKR]);

  const currentAppreciation = appreciationStats[appreciationIndex];
  const currentReprimand = reprimandStats[reprimandIndex];

  const onDetail = () => {
    router.push(`/dashboard/vp`);
  };

  return (
    <>
      {hasOKR && (
        <div
          className="w-full pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4 overflow-x-auto scrollbar-none"
          data-cy="okr-header-cards"
        >
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0"
            data-cy="okr-card-average-okr"
          >
            <div className="flex items-center justify-between" data-cy="okr-card-header">
              <div className="rounded-xl bg-[#e6edff] flex items-center justify-center w-10 h-10" data-cy="okr-card-icon-container">
                {/* <GoGoal size={18} className="text-[#2952e3]" /> */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1E40AF"><path d="M480-300q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm-28.5-151.5Q440-463 440-480t11.5-28.5Q463-520 480-520t28.5 11.5Q520-497 520-480t-11.5 28.5Q497-440 480-440t-28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
              </div>
              <div
                className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
                data-cy="okr-card-value"
              >
                {Number(objectiveDashboard?.userOkr?.toFixed(0) || 0)}%
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <div className=" text-gray-500 w-full text-start text-sm" data-cy="okr-card-label">
                Your Average OKR
              </div>
              <div className=" flex gap-2 items-center" data-cy="okr-card-details">
                <Progress
                  percent={Number(objectiveDashboard?.userOkr || 0)}
                  showInfo={false}
                  strokeColor="#1f4fd8"
                  trailColor="#e5e7eb"
                />
                <div className="flex justify-end text-sm text-gray-500">
                  {Number(objectiveDashboard?.userOkr?.toFixed(0) || 0)}%
                </div>
              </div>
            </div>
          </Card>
          {/* <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0"
            data-cy="okr-card-supervisor-okr"
          >
            <div className="flex items-center justify-between" data-cy="okr-card-header">
              <div className="rounded-xl bg-[#F6FFED] flex items-center justify-center w-10 h-10" data-cy="okr-card-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#52C41A"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" /></svg>              </div>
              <div className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900" data-cy="okr-card-value">
                {Number(objectiveDashboard?.supervisorOkr?.toFixed(0) || 0)}%
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <div className=" text-gray-500 w-full text-start text-sm" data-cy="okr-card-label">
                Supervisor OKR
              </div>
              <div className=" flex gap-2 items-center" data-cy="okr-card-details">
                <Progress
                  percent={Number(objectiveDashboard?.supervisorOkr || 0)}
                  showInfo={false}
                  strokeColor="#1f4fd8"
                  trailColor="#e5e7eb"
                />
                <div className="flex justify-end text-sm text-gray-500">
                  {Number(objectiveDashboard?.supervisorOkr?.toFixed(0) || 0)}%
                </div>
              </div>
            </div>
          </Card> */}
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0"
            data-cy="okr-card-company-okr"
          >
            <div className="flex items-center justify-between" data-cy="okr-card-header">
              <div className="rounded-xl bg-[#F9F0FF] flex items-center justify-center w-10 h-10" data-cy="okr-card-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#722ED1"><path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z" /></svg>              </div>
              <div className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900" data-cy="okr-card-value">
                {Number(objectiveDashboard?.companyOkr?.toFixed(0) || 0)}%
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <div className=" text-gray-500 w-full text-start text-sm" data-cy="okr-card-label">
                Company OKR
              </div>
              <div className=" flex gap-2 items-center" data-cy="okr-card-details">
                <Progress
                  percent={Number(objectiveDashboard?.companyOkr || 0)}
                  showInfo={false}
                  strokeColor="#1f4fd8"
                  trailColor="#e5e7eb"
                />
                <div className="flex justify-end text-sm text-gray-500">
                  {Number(objectiveDashboard?.companyOkr?.toFixed(0) || 0)}%
                </div>
              </div>
            </div>
          </Card>
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className={`flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0 transition-transform duration-300 `}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-[#F6FFED] flex items-center justify-center w-10 h-10">
              <MdOutlineMilitaryTech size={24} className="text-green-500" />
              </div>
              <div
                className={`font-semibold text-[27px] leading-7 tracking-normal text-gray-900 transition-all duration-300 ${
                  isAppreciationAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                }`}
              >
                {currentAppreciation.value}
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <div className="text-gray-500 w-full text-start text-sm">
                Appreciation
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className={`text-gray-500 transition-all duration-300 ${
                  isAppreciationAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                }`}>{currentAppreciation.label}</span>
                <span
                  className={
                    `${currentAppreciation.trendDirection === 'up'
                      ? 'text-[#52C41A]'
                      : 'text-red-500'
                    } flex items-center gap-1 transition-all duration-300 ${
                      isAppreciationAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                    }`
                  }
                >
                  <IoMdTrendingUp size={14} className={currentAppreciation.trendDirection === 'up' ? 'text-[#52C41A]' : 'text-red-500'} />
                  {currentAppreciation.trendLabel}
                </span>
              </div>
            </div>
          </Card>
          <Card
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className={`flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-[#FFF2F0] flex items-center justify-center w-10 h-10">
              <MdReportGmailerrorred size={24} className="text-red-500" />
              </div>
              <div
                className={`font-semibold text-[27px] leading-7 tracking-normal text-gray-900 transition-all duration-300 ${
                  isReprimandAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                }`}
              >
                {currentReprimand.value}
              </div>
            </div>
            <div className="flex flex-col mt-3">
              <div className="text-gray-500 w-full text-start text-sm">
                Reprimand
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className={`text-gray-500 transition-all duration-300 ${
                  isReprimandAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                }`}>{currentReprimand.label}</span>
                <span
                  className={
                    `${currentReprimand.trendDirection === 'down'
                      ? 'text-red-500'
                      : 'text-[#52C41A]'
                    } flex items-center gap-1 transition-all duration-300 ${
                      isReprimandAnimating ? 'opacity-0 translate-x-1' : 'opacity-100 translate-x-0'
                    }`
                  }
                >
                    <IoMdTrendingDown size={14} className={currentReprimand.trendDirection === 'down' ? 'text-red-500' : 'text-[#52C41A]'} />
                  {currentReprimand.trendLabel}
                </span>
              </div>
            </div>
          </Card>
          {/* <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0"
            data-cy="okr-card-kr-planned"
          >
            <div className="flex items-center justify-between" data-cy="okr-card-header">
              <div className="rounded-xl bg-[#FFFBE6] flex items-center justify-center w-10 h-10" data-cy="okr-card-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FAAD14"><path d="m576-160-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm79-360L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z" /></svg>              </div>
              <div className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900" data-cy="okr-card-value">
                {Number(
                  (
                    (Number(objectiveDashboard?.okrCompleted || 0) /
                      Number(objectiveDashboard?.keyResultCount || 1)) * 100
                  ).toFixed(0),
                )}
                %
              </div>
            </div>
            <div className="flex flex-col mt-3">  <div className=" text-gray-500 w-full text-start text-sm" data-cy="okr-card-label">
              Planned OKR
            </div>
              <div className=" flex gap-2 items-center" data-cy="okr-card-details">
                <Progress
                  percent={
                    (Number(objectiveDashboard?.okrCompleted || 0) /
                      Number(objectiveDashboard?.keyResultCount || 1)) *
                    100
                  }
                  showInfo={false}
                  strokeColor="#1f4fd8"
                  trailColor="#e5e7eb"
                />
                <div className="flex justify-end text-sm text-gray-500">
                  {Number(
                    (
                      (Number(objectiveDashboard?.okrCompleted || 0) /
                        Number(objectiveDashboard?.keyResultCount || 1)) * 100
                    ).toFixed(0),
                  )}
                  %
                </div>
              </div>
            </div>
          </Card> */}
          <Card
            loading={isLoading}
            bordered={false}
            bodyStyle={{ padding: 0 }}
            className="flex flex-col gap-4 h-[115px] shadow-none rounded-lg border border-[#D9D9D9] bg-white p-3 sm:shrink-0"
            onClick={() => onDetail()}
            data-cy="okr-card-vp-score"
          >
            <div className="flex items-center justify-between" data-cy="okr-card-header">
              <div className="rounded-xl bg-[#FFF2F0] flex items-center justify-center w-10 h-10" data-cy="okr-card-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FF4D4F"><path d="M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84h-80Z" /></svg>              </div>
              <div className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900" data-cy="okr-card-value">
                {Number(vpScore?.score || 0)}%
              </div>
            </div>
            <div className="flex flex-col mt-3">  <div className=" text-gray-500 w-full text-start text-sm" data-cy="okr-card-label">
              Total Variable Pay
            </div>
              <div className=" flex gap-2 items-center" data-cy="okr-card-details">
                <Progress
                  percent={(Number(vpScore?.score || 0) / Number(vpScore?.maxScore || 100)) * 100}
                  showInfo={false}
                  strokeColor="#1f4fd8"
                  trailColor="#e5e7eb"
                />
                <div className="flex justify-end text-sm text-gray-500">
                  {Number(vpScore?.score || 0)}%
                </div>
              </div>
            </div>
          </Card>
          
        </div>
      )}
    </>
  );
};

export default Header;
