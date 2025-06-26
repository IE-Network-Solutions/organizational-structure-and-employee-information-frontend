import { Card, Progress, Spin } from 'antd';
import React, { useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';
import dayjs from 'dayjs';
import { CiCircleCheck } from 'react-icons/ci';
import { IoHourglassOutline } from 'react-icons/io5';
import { TbCalendarX, TbCalendarTime } from 'react-icons/tb';

const SummaryCardsRow: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { pageSize, currentPage } = useOKRStore();
  const { data, isLoading } = useGetUserObjectiveDashboard(userId);
  const { data: objectivesData, isLoading: objectivesLoading } =
    useGetUserObjective(userId, pageSize, currentPage, '');

  // Track which card is selected
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (isLoading || objectivesLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spin />
      </div>
    );
  }

  // Fallbacks for missing data
  const userOkr = Number(data?.userOkr ?? 0);
  const companyOkr = Number(data?.companyOkr ?? 0);

  // Aggregate objective status counts from objectivesData
  const objectives = objectivesData?.items || [];

  // Helper to parse progress as number
  const getKRProgress = (kr: any) => parseFloat(kr.progress || '0');

  // Calculate achieved key results
  const achievedKeyResults = objectives.reduce((total: number, obj: any) => {
    if (Array.isArray(obj.keyResults)) {
      return (
        total +
        obj.keyResults.filter((kr: any) => getKRProgress(kr) === 100).length
      );
    }
    return total;
  }, 0);

  // Calculate average progress for each objective
  const objectivesWithAvg = objectives.map((obj: any) => {
    let avg = 0;
    if (Array.isArray(obj.keyResults) && obj.keyResults.length > 0) {
      avg =
        obj.keyResults.reduce(
          (sum: number, kr: any) => sum + getKRProgress(kr),
          0,
        ) / obj.keyResults.length;
    }
    return { ...obj, avgProgress: avg };
  });

  // Categorize objectives
  const completedObjectives = objectivesWithAvg.filter(
    (obj: any) => obj.avgProgress === 100,
  );
  const notStartedObjectives = objectivesWithAvg.filter(
    (obj: any) => obj.avgProgress === 0,
  );
  const onProgressObjectives = objectivesWithAvg.filter(
    (obj: any) => obj.avgProgress > 0 && obj.avgProgress < 100,
  );
  const overdueObjectives = objectivesWithAvg.filter((obj: any) => {
    const isCompleted = obj.avgProgress === 100;
    const isOverdue = dayjs(obj.deadline).isBefore(dayjs(), 'day');
    return isOverdue && !isCompleted;
  });

  // For each card, calculate the percent of objectives in that category compared to total
  const totalObjectives = objectivesWithAvg.length;
  const getCategoryPercentOfTotal = (objs: any[]) => {
    if (!totalObjectives) return 0;
    return Math.round((objs.length / totalObjectives) * 100);
  };

  // Card color helpers
  const cardStyles = {
    completed: {
      color: 'text-[#22C55E]',
    },
    onProgress: {
      color: 'text-[#FACC15]',
    },
    overdue: {
      color: 'text-[#EF4444]',
    },
    notStarted: {
      color: 'text-gray-400',
    },
  };

  // Helper for badge color and percent
  const getObjectiveBadge = (obj: any) => {
    // Completed
    if (
      Array.isArray(obj.keyResults) &&
      obj.keyResults.length > 0 &&
      obj.keyResults.every((kr: any) => getKRProgress(kr) === 100)
    ) {
      return { color: 'bg-[#E6F9F0] text-[#22C55E]', value: '100%' };
    }
    // Not Started
    if (
      Array.isArray(obj.keyResults) &&
      obj.keyResults.length > 0 &&
      obj.keyResults.every((kr: any) => getKRProgress(kr) === 0)
    ) {
      return { color: 'bg-gray-100 text-gray-400', value: '0%' };
    }
    // On Progress (use avgProgress)
    const avg = Math.round(obj.avgProgress ?? 0);
    if (avg > 0 && avg < 100) {
      return { color: 'bg-[#FFF7E6] text-[#FACC15]', value: `${avg}%` };
    }
    // Overdue
    if (dayjs(obj.deadline).isBefore(dayjs(), 'day')) {
      let percent = 0;
      if (Array.isArray(obj.keyResults) && obj.keyResults.length > 0) {
        percent = Math.round(
          obj.keyResults.reduce(
            (sum: number, kr: any) => sum + getKRProgress(kr),
            0,
          ) / obj.keyResults.length,
        );
      }
      return { color: 'bg-[#FFE6E6] text-[#EF4444]', value: `${percent}%` };
    }
    return { color: 'bg-gray-100 text-gray-400', value: '-' };
  };

  // Helper for which objectives to show
  const getObjectivesToShow = () => {
    if (selectedCard === 'completed') return completedObjectives;
    if (selectedCard === 'onProgress') return onProgressObjectives;
    if (selectedCard === 'overdue') return overdueObjectives;
    if (selectedCard === 'notStarted') return notStartedObjectives;
    return [];
  };

  // Helper for section header
  const getSectionHeader = () => {
    if (selectedCard === 'completed') return 'Completed Objectives';
    if (selectedCard === 'onProgress') return 'On Progress Objectives';
    if (selectedCard === 'overdue') return 'Overdue Objectives';
    if (selectedCard === 'notStarted') return 'Not Started Objectives';
    return '';
  };

  // Helper for card label
  const getCategoryLabel = (category: string) => {
    if (category === 'completed') return '% completed';
    if (category === 'onProgress') return '% progressed';
    if (category === 'overdue') return '% overdue';
    if (category === 'notStarted') return '% not started';
    return '%';
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* First column: two stacked cards */}
        <div className="flex flex-col gap-2 h-full">
          <Card
            className={`flex flex-col justify-between shadow-md border-0 bg-white rounded-xl px-4 py-3 h-[72px] w-full`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-col justify-between h-full">
                <span className="text-lg font-bold text-gray-800 leading-none">
                  {userOkr.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  My OKR
                </span>
              </div>
              <div className="flex flex-col items-end justify-center w-2/3 ml-2">
                <span className="text-[10px] text-gray-400 mb-1 text-right whitespace-nowrap">
                  {achievedKeyResults} Key Results achieved
                </span>
                <Progress
                  percent={userOkr}
                  size="small"
                  showInfo={false}
                  strokeColor="#3636F0"
                  className="!h-2 !rounded-full w-full"
                />
              </div>
            </div>
          </Card>
          <Card
            className={`flex flex-col justify-between shadow-md border-0 bg-white rounded-xl px-4 py-3 h-[72px] w-full`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-col justify-between h-full">
                <span className="text-lg font-bold text-gray-800 leading-none">
                  {companyOkr.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">
                  Company OKR
                </span>
              </div>
              <div className="flex flex-col items-end justify-center w-2/3 ml-2">
                <span className="text-[10px] text-gray-400 mb-1 text-right whitespace-nowrap">
                  {achievedKeyResults} Key Results achieved
                </span>
                <Progress
                  percent={companyOkr}
                  size="small"
                  showInfo={false}
                  strokeColor="#3636F0"
                  className="!h-2 !rounded-full w-full"
                />
              </div>
            </div>
          </Card>
        </div>
        {/* Next four columns: one card each, with correct count and color and progress bar */}
        <div
          className={`rounded-xl transition-all duration-150 ${selectedCard === 'completed' ? 'bg-gray-50' : 'bg-white'}`}
          onClick={() =>
            setSelectedCard(selectedCard === 'completed' ? null : 'completed')
          }
        >
          <Card
            className={`flex flex-col shadow-md border-0 bg-transparent rounded-xl px-4 py-3 h-[152px] w-full cursor-pointer transition-all duration-150
              hover:shadow-lg`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-col w-full">
                <div className="flex items-start mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <CiCircleCheck className="text-[#22C55E] text-3xl" />
                  </div>
                </div>
                <div className="flex flex-row items-center w-full mb-1">
                  <span
                    className={`text-3xl font-bold mr-2 ${cardStyles.completed.color}`}
                  >
                    {completedObjectives.length}
                  </span>
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                      {getCategoryPercentOfTotal(completedObjectives)}
                      {getCategoryLabel('completed')}
                    </span>
                    <Progress
                      percent={getCategoryPercentOfTotal(completedObjectives)}
                      size="default"
                      showInfo={false}
                      strokeColor="#22C55E"
                      trailColor="#E5E7EB"
                      className="!h-2 !rounded-full w-3/4"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-6 w-full text-left">
                Completed Objective
              </div>
            </div>
          </Card>
        </div>
        <div
          className={`rounded-xl transition-all duration-150 ${selectedCard === 'onProgress' ? 'bg-gray-50' : 'bg-white'}`}
          onClick={() =>
            setSelectedCard(selectedCard === 'onProgress' ? null : 'onProgress')
          }
        >
          <Card
            className={`flex flex-col shadow-md border-0 bg-transparent rounded-xl px-4 py-3 h-[152px] w-full cursor-pointer transition-all duration-150
              hover:shadow-lg`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-col w-full">
                <div className="flex items-start mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <IoHourglassOutline className="text-[#FACC15] text-3xl" />
                  </div>
                </div>
                <div className="flex flex-row items-center w-full mb-1">
                  <span
                    className={`text-3xl font-bold mr-2 ${cardStyles.onProgress.color}`}
                  >
                    {onProgressObjectives.length}
                  </span>
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                      {getCategoryPercentOfTotal(onProgressObjectives)}
                      {getCategoryLabel('onProgress')}
                    </span>
                    <Progress
                      percent={getCategoryPercentOfTotal(onProgressObjectives)}
                      size="default"
                      showInfo={false}
                      strokeColor="#FACC15"
                      trailColor="#E5E7EB"
                      className="!h-2 !rounded-full w-3/4"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-6 w-full text-left">
                On Progress Objective
              </div>
            </div>
          </Card>
        </div>
        <div
          className={`rounded-xl transition-all duration-150 ${selectedCard === 'overdue' ? 'bg-gray-50' : 'bg-white'}`}
          onClick={() =>
            setSelectedCard(selectedCard === 'overdue' ? null : 'overdue')
          }
        >
          <Card
            className={`flex flex-col shadow-md border-0 bg-transparent rounded-xl px-4 py-3 h-[152px] w-full cursor-pointer transition-all duration-150
              hover:shadow-lg`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-col w-full">
                <div className="flex items-start mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <TbCalendarX className="text-[#EF4444] text-3xl" />
                  </div>
                </div>
                <div className="flex flex-row items-center w-full mb-1">
                  <span
                    className={`text-3xl font-bold mr-2 ${cardStyles.overdue.color}`}
                  >
                    {overdueObjectives.length}
                  </span>
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                      {getCategoryPercentOfTotal(overdueObjectives)}
                      {getCategoryLabel('overdue')}
                    </span>
                    <Progress
                      percent={getCategoryPercentOfTotal(overdueObjectives)}
                      size="default"
                      showInfo={false}
                      strokeColor="#EF4444"
                      trailColor="#E5E7EB"
                      className="!h-2 !rounded-full w-3/4"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-6 w-full text-left">
                Overdue Objective
              </div>
            </div>
          </Card>
        </div>
        <div
          className={`rounded-xl transition-all duration-150 ${selectedCard === 'notStarted' ? 'bg-gray-50' : 'bg-white'}`}
          onClick={() =>
            setSelectedCard(selectedCard === 'notStarted' ? null : 'notStarted')
          }
        >
          <Card
            className={`flex flex-col shadow-md border-0 bg-transparent rounded-xl px-4 py-3 h-[152px] w-full cursor-pointer transition-all duration-150
              hover:shadow-lg`}
            bodyStyle={{ padding: 0, width: '100%' }}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex flex-col w-full">
                <div className="flex items-start mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <TbCalendarTime className="text-gray-400 text-3xl" />
                  </div>
                </div>
                <div className="flex flex-row items-center w-full mb-1">
                  <span
                    className={`text-3xl font-bold mr-2 ${cardStyles.notStarted.color}`}
                  >
                    {notStartedObjectives.length}
                  </span>
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                      {getCategoryPercentOfTotal(notStartedObjectives)}
                      {getCategoryLabel('notStarted')}
                    </span>
                    <Progress
                      percent={getCategoryPercentOfTotal(notStartedObjectives)}
                      size="default"
                      showInfo={false}
                      strokeColor="#E5E7EB"
                      trailColor="#E5E7EB"
                      className="!h-2 !rounded-full w-3/4"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-6 w-full text-left">
                Not Started Objective
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Objectives List for Selected Card (full-width card with header) */}
      {selectedCard && getObjectivesToShow().length > 0 && (
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="font-bold text-lg text-gray-900 mb-4">
              {getSectionHeader()}
            </div>
            <div className="flex flex-col gap-3">
              {getObjectivesToShow().map((obj: any) => {
                const badge = getObjectiveBadge(obj);
                return (
                  <div
                    key={obj.id}
                    className="bg-gray-50 rounded-2xl px-4 sm:px-8 py-4 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-gray-800 text-base truncate">
                        {obj.title}
                      </span>
                      <span className="text-xs text-gray-400 font-normal mt-1">
                        {dayjs(obj.startDate).format('MM/DD/YYYY')} -{' '}
                        {dayjs(obj.deadline).format('MM/DD/YYYY')}
                      </span>
                    </div>
                    <span
                      className={`font-bold text-base whitespace-nowrap px-4 py-1 rounded-lg ${badge.color} self-start sm:self-auto`}
                    >
                      {badge.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryCardsRow;
