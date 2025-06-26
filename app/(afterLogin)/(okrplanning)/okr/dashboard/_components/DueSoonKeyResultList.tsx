import { Card } from 'antd';
import { TbTargetArrow } from 'react-icons/tb';
import { BsKey } from 'react-icons/bs';
import React from 'react';
import { useGetDueSoonKeyResults } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';

interface DueSoonKeyResult {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  objectiveId: string;
  objectiveTitle: string;
  objectiveDeadline: string;
}

interface ObjectiveWithKeyResults {
  id: string;
  title: string;
  deadline: string;
  keyResults: DueSoonKeyResult[];
}

const DueSoonKeyResultList: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: objectivesData, isLoading } = useGetDueSoonKeyResults(userId);

  // Process data to get due soon key results grouped by objectives
  const processDueSoonData = (): ObjectiveWithKeyResults[] => {
    if (!objectivesData?.items || objectivesData.items.length === 0) {
      return [];
    }

    const objectivesWithKeyResults: { [key: string]: ObjectiveWithKeyResults } =
      {};

    objectivesData.items.forEach((objective: any) => {
      if (objective.keyResults && objective.keyResults.length > 0) {
        const dueSoonKeyResults: DueSoonKeyResult[] = [];

        objective.keyResults.forEach((keyResult: any) => {
          if (keyResult.deadline) {
            const deadline = dayjs(keyResult.deadline);
            const today = dayjs();
            const daysLeft = deadline.diff(today, 'day');

            // Show key results due within 15 days and not completed
            if (daysLeft >= 0 && daysLeft < 15 && keyResult.progress < 100) {
              dueSoonKeyResults.push({
                id: keyResult.id,
                title: keyResult.title,
                deadline: keyResult.deadline,
                progress: keyResult.progress || 0,
                objectiveId: objective.id,
                objectiveTitle: objective.title,
                objectiveDeadline: objective.deadline,
              });
            }
          }
        });

        // Only add objectives that have due soon key results
        if (dueSoonKeyResults.length > 0) {
          objectivesWithKeyResults[objective.id] = {
            id: objective.id,
            title: objective.title,
            deadline: objective.deadline,
            keyResults: dueSoonKeyResults.sort((a, b) => {
              const daysLeftA = dayjs(a.deadline).diff(dayjs(), 'day');
              const daysLeftB = dayjs(b.deadline).diff(dayjs(), 'day');
              return daysLeftA - daysLeftB;
            }),
          };
        }
      }
    });

    // Convert to array and sort by the most urgent key result in each objective
    return Object.values(objectivesWithKeyResults).sort((a, b) => {
      const aMostUrgent = a.keyResults[0];
      const bMostUrgent = b.keyResults[0];
      const daysLeftA = dayjs(aMostUrgent.deadline).diff(dayjs(), 'day');
      const daysLeftB = dayjs(bMostUrgent.deadline).diff(dayjs(), 'day');
      return daysLeftA - daysLeftB;
    });
  };

  const objectivesWithKeyResults = processDueSoonData();
  const totalKeyResults = objectivesWithKeyResults.reduce(
    (sum, obj) => sum + obj.keyResults.length,
    0,
  );

  // Helper function to get color classes based on progress and days left
  const getColorClasses = (progress: number, deadline: string) => {
    const daysLeft = dayjs(deadline).diff(dayjs(), 'day');

    let percentColor = 'bg-[#E6F9F0] text-[#22C55E]'; // Green for good progress
    if (progress < 50) {
      percentColor = 'bg-[#FFE6E6] text-[#EF4444]'; // Red for low progress
    } else if (progress < 80) {
      percentColor = 'bg-[#FFF7E6] text-[#FACC15]'; // Yellow for medium progress
    }

    let daysColor = 'bg-[#E9E9FF] text-[#7152F3]'; // Default purple
    if (daysLeft <= 3) {
      daysColor = 'bg-[#FFE6E6] text-[#EF4444]'; // Red for urgent
    } else if (daysLeft <= 7) {
      daysColor = 'bg-[#FFF7E6] text-[#FACC15]'; // Yellow for soon
    }

    return { percentColor, daysColor };
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white rounded-xl shadow-md p-0">
        <div className="font-bold text-lg text-gray-900 pb-2">
          Due Soon Key Result
        </div>
        <div>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b bg-[#F8F9FB]">
              <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </div>
            <div className="px-8 py-3 border-b">
              <div className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (objectivesWithKeyResults.length === 0) {
    return (
      <Card className="w-full bg-white rounded-xl shadow-md p-0">
        <div className="font-bold text-lg text-gray-900 pb-2">
          Due Soon Key Result
        </div>
        <div>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="flex items-center justify-center px-4 py-8 text-gray-500">
              No key results due soon
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white rounded-xl shadow-md p-0">
      <div className="font-bold text-lg text-gray-900 pb-2">
        Due Soon Key Result
        {totalKeyResults > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({totalKeyResults})
          </span>
        )}
      </div>
      <div>
        <div className="bg-white border rounded-xl overflow-hidden">
          {/* Scrollable container for all parent-child groups */}
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {objectivesWithKeyResults.map((objective) => (
              <div key={objective.id}>
                {/* Parent Objective */}
                <div className="flex items-center px-4 py-3 border-b bg-[#F8F9FB]">
                  <TbTargetArrow className="text-lg text-[#7152F3] mr-2" />
                  <div className="flex flex-col font-bold text-gray-900">
                    <span className="truncate max-w-xs">{objective.title}</span>
                    <span className="text-xs text-gray-400 font-normal">
                      {dayjs(objective.deadline).format('MM/DD/YYYY')}
                    </span>
                  </div>
                </div>
                {/* Children Key Results */}
                {objective.keyResults.map((keyResult) => {
                  const daysLeft = dayjs(keyResult.deadline).diff(
                    dayjs(),
                    'day',
                  );
                  const { percentColor, daysColor } = getColorClasses(
                    keyResult.progress,
                    keyResult.deadline,
                  );

                  return (
                    <div
                      key={keyResult.id}
                      className="flex items-center justify-between px-8 py-3 mb-1"
                    >
                      <div className="flex items-center gap-3">
                        <BsKey className="text-lg text-[#7152F3] opacity-70" />
                        <div className="flex flex-col font-medium text-gray-800">
                          <span className="truncate max-w-xs">
                            {keyResult.title}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            {dayjs(keyResult.deadline).format('MM/DD/YYYY')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 min-w-[120px] justify-end">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${daysColor}`}
                        >
                          {daysLeft}
                        </span>
                        <span className="text-xs text-gray-400">Days left</span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${percentColor}`}
                        >
                          {Math.round(keyResult.progress)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DueSoonKeyResultList;
