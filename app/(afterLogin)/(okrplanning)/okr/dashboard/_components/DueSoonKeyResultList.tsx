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
      <Card
        className="w-full bg-white rounded-xl shadow-md p-0"
        id="okr-duesoon-loading-card-display-card"
        data-cy="okr-duesoon-loading-card-display-card"
      >
        <div
          className="font-bold text-lg text-gray-900 pb-2"
          id="okr-duesoon-loading-header-display-div"
          data-cy="okr-duesoon-loading-header-display-div"
        >
          Due Soon Key Result
        </div>
        <div
          id="okr-duesoon-loading-body-container-display-div"
          data-cy="okr-duesoon-loading-body-container-display-div"
        >
          <div
            className="bg-white border rounded-xl overflow-hidden"
            id="okr-duesoon-loading-list-wrapper-display-div"
            data-cy="okr-duesoon-loading-list-wrapper-display-div"
          >
            <div
              className="flex items-center px-4 py-3 border-b bg-[#F8F9FB]"
              id="okr-duesoon-loading-header-row-display-div"
              data-cy="okr-duesoon-loading-header-row-display-div"
            >
              <div
                className="animate-pulse bg-gray-200 h-4 w-32 rounded"
                id="okr-duesoon-loading-skeleton-title-display-div"
                data-cy="okr-duesoon-loading-skeleton-title-display-div"
              ></div>
            </div>
            <div
              className="px-8 py-3 border-b"
              id="okr-duesoon-loading-item-display-div"
              data-cy="okr-duesoon-loading-item-display-div"
            >
              <div
                className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-2"
                id="okr-duesoon-loading-skeleton-line1-display-div"
                data-cy="okr-duesoon-loading-skeleton-line1-display-div"
              ></div>
              <div
                className="animate-pulse bg-gray-200 h-3 w-24 rounded"
                id="okr-duesoon-loading-skeleton-line2-display-div"
                data-cy="okr-duesoon-loading-skeleton-line2-display-div"
              ></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (objectivesWithKeyResults.length === 0) {
    return (
      <Card
        className="w-full bg-white rounded-xl shadow-md p-0"
        id="okr-duesoon-empty-card-display-card"
        data-cy="okr-duesoon-empty-card-display-card"
      >
        <div
          className="font-bold text-lg text-gray-900 pb-2"
          id="okr-duesoon-empty-header-display-div"
          data-cy="okr-duesoon-empty-header-display-div"
        >
          Due Soon Key Result
        </div>
        <div
          id="okr-duesoon-empty-body-container-display-div"
          data-cy="okr-duesoon-empty-body-container-display-div"
        >
          <div
            className="bg-white border rounded-xl overflow-hidden"
            id="okr-duesoon-empty-list-wrapper-display-div"
            data-cy="okr-duesoon-empty-list-wrapper-display-div"
          >
            <div
              className="flex items-center justify-center px-4 py-8 text-gray-500"
              id="okr-duesoon-empty-message-display-div"
              data-cy="okr-duesoon-empty-message-display-div"
            >
              No key results due soon
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="w-full bg-white rounded-xl shadow-md p-0"
      id="okr-duesoon-main-card-display-card"
      data-cy="okr-duesoon-main-card-display-card"
    >
      <div
        className="font-bold text-lg text-gray-900 pb-2"
        id="okr-duesoon-main-header-display-div"
        data-cy="okr-duesoon-main-header-display-div"
      >
        Due Soon Key Result
      </div>
      <div
        id="okr-duesoon-main-body-container-display-div"
        data-cy="okr-duesoon-main-body-container-display-div"
      >
        <div
          className="bg-white border rounded-xl overflow-hidden"
          id="okr-duesoon-main-list-wrapper-display-div"
          data-cy="okr-duesoon-main-list-wrapper-display-div"
        >
          {/* Scrollable container for all parent-child groups */}
          <div
            className="max-h-64 overflow-y-auto scrollbar-hide"
            id="okr-duesoon-main-scroll-container-display-div"
            data-cy="okr-duesoon-main-scroll-container-display-div"
          >
            {objectivesWithKeyResults.map((objective) => (
              <div
                key={objective.id}
                id={`okr-duesoon-objective-block-display-div-${objective.id}`}
                data-cy={`okr-duesoon-objective-block-display-div-${objective.id}`}
              >
                {/* Parent Objective */}
                <div
                  className="flex items-center px-4 py-3 border-b bg-[#F8F9FB]"
                  id={`okr-duesoon-objective-header-display-div-${objective.id}`}
                  data-cy={`okr-duesoon-objective-header-display-div-${objective.id}`}
                >
                  <TbTargetArrow
                    className="text-lg text-[#7152F3] mr-2"
                    id={`okr-duesoon-objective-icon-display-icon-${objective.id}`}
                    data-cy={`okr-duesoon-objective-icon-display-icon-${objective.id}`}
                  />
                  <div
                    className="flex flex-col font-bold text-gray-900"
                    id={`okr-duesoon-objective-title-wrapper-display-div-${objective.id}`}
                    data-cy={`okr-duesoon-objective-title-wrapper-display-div-${objective.id}`}
                  >
                    <span
                      className="truncate max-w-xs"
                      id={`okr-duesoon-objective-title-display-span-${objective.id}`}
                      data-cy={`okr-duesoon-objective-title-display-span-${objective.id}`}
                    >
                      {objective.title}
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
                      className="flex items-center justify-between px-2 sm:px-8 py-3 mb-1"
                      id={`okr-duesoon-keyresult-row-display-div-${keyResult.id}`}
                      data-cy={`okr-duesoon-keyresult-row-display-div-${keyResult.id}`}
                    >
                      <div
                        className="flex items-center gap-3"
                        id={`okr-duesoon-keyresult-info-display-div-${keyResult.id}`}
                        data-cy={`okr-duesoon-keyresult-info-display-div-${keyResult.id}`}
                      >
                        <BsKey
                          className="text-lg text-[#7152F3] opacity-70"
                          id={`okr-duesoon-keyresult-icon-display-icon-${keyResult.id}`}
                          data-cy={`okr-duesoon-keyresult-icon-display-icon-${keyResult.id}`}
                        />
                        <div
                          className="flex flex-col font-medium text-gray-800"
                          id={`okr-duesoon-keyresult-text-wrapper-display-div-${keyResult.id}`}
                          data-cy={`okr-duesoon-keyresult-text-wrapper-display-div-${keyResult.id}`}
                        >
                          <span
                            className="truncate max-w-[80px] sm:max-w-xs"
                            id={`okr-duesoon-keyresult-title-display-span-${keyResult.id}`}
                            data-cy={`okr-duesoon-keyresult-title-display-span-${keyResult.id}`}
                          >
                            {keyResult.title}
                          </span>
                          <span
                            className="text-xs text-gray-400 font-normal"
                            id={`okr-duesoon-keyresult-date-range-display-span-${keyResult.id}`}
                            data-cy={`okr-duesoon-keyresult-date-range-display-span-${keyResult.id}`}
                          >
                            {dayjs(objective.deadline).isValid() &&
                            dayjs(keyResult.deadline).isValid()
                              ? `${dayjs(objective.deadline).format('MM/DD/YYYY')} - ${dayjs(keyResult.deadline).format('MM/DD/YYYY')}`
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 min-w-[90px] sm:min-w-[120px] justify-end"
                        id={`okr-duesoon-keyresult-metrics-display-div-${keyResult.id}`}
                        data-cy={`okr-duesoon-keyresult-metrics-display-div-${keyResult.id}`}
                      >
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${daysColor}`}
                          id={`okr-duesoon-keyresult-days-chip-display-span-${keyResult.id}`}
                          data-cy={`okr-duesoon-keyresult-days-chip-display-span-${keyResult.id}`}
                        >
                          {daysLeft}
                        </span>
                        <span
                          className="text-xs text-gray-400"
                          id={`okr-duesoon-keyresult-days-label-display-span-${keyResult.id}`}
                          data-cy={`okr-duesoon-keyresult-days-label-display-span-${keyResult.id}`}
                        >
                          Days left
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${percentColor}`}
                          id={`okr-duesoon-keyresult-progress-chip-display-span-${keyResult.id}`}
                          data-cy={`okr-duesoon-keyresult-progress-chip-display-span-${keyResult.id}`}
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
