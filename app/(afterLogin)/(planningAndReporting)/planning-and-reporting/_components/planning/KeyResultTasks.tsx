import { Tag } from 'antd';
import { FC } from 'react';
import MilestoneTasks from './milestoneTasks';
import TasksDisplayer from '../reporting/milestone';
import { BsKey } from 'react-icons/bs';
import {
  formatValueForMetric,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  getMilestoneProgressCounts,
  getNumericMetricTargetValue,
} from '@/utils/okrKeyResultProgressDisplay';

interface KeyResultTasksProps {
  keyResult?: any;
  keyResultIndex: number;
  activeTab: number;
}

const KeyResultTasks: FC<KeyResultTasksProps> = ({
  keyResult,
  keyResultIndex,
  activeTab,
}) => {
  const metricName = getMetricTypeName(keyResult);
  const krProgressPercent = getKeyResultProgressPercent(keyResult);
  const krProgressRatioText = getKeyResultProgressRatioText(keyResult);
  const { total: msTotal } = getMilestoneProgressCounts(keyResult);
  const numericTarget = getNumericMetricTargetValue(keyResult);

  return (
    <div
      className="my-3 pb-8 bg-white rounded-lg border"
      data-cy={`key-result-tasks-container-${keyResultIndex}`}
    >
      <div
        className="grid gap-4 mt-3 sm:mt-0"
        data-cy={`key-result-tasks-grid-${keyResultIndex}`}
      >
        <div
          className="flex gap-4 sm:px-10 sm:py-3"
          data-cy={`key-result-tasks-header-${keyResultIndex}`}
        >
          <div
            className="items-center gap-2 hidden sm:flex"
            data-cy={`key-result-tasks-target-section-${keyResultIndex}`}
          >
            <div
              className="flex items-center gap-1"
              data-cy={`key-result-tasks-target-label-container-${keyResultIndex}`}
            >
              <div
                className="text-blue text-xl"
                data-cy={`key-result-tasks-target-bullet-${keyResultIndex}`}
              >
                &#x2022;
              </div>
              <div
                className="text-gray-500 font-semibold mt-1  text-[10px] flex items-center rounded-lg"
                data-cy={`key-result-tasks-target-label-${keyResultIndex}`}
              >
                {keyResult?.metricType?.name === 'Milestone'
                  ? 'Milestones'
                  : 'Target'}
              </div>
            </div>
            <Tag
              className="font-bold border-none min-w-8 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {metricName === 'Milestone'
                ? msTotal
                : metricName === 'Achieve' || metricName === 'Achieved'
                  ? '100'
                  : formatValueForMetric(metricName, numericTarget)}
            </Tag>
          </div>

          <div
            className="items-center gap-2 hidden sm:flex"
            data-cy={`key-result-tasks-achieved-section-${keyResultIndex}`}
          >
            <div
              className="flex items-center gap-1"
              data-cy={`key-result-tasks-achieved-label-container-${keyResultIndex}`}
            >
              <div
                className="text-blue text-xl"
                data-cy={`key-result-tasks-achieved-bullet-${keyResultIndex}`}
              >
                &#x2022;
              </div>
              <div
                className="text-gray-500 font-semibold mt-1 text-[10px] flex items-center rounded-lg"
                data-cy={`key-result-tasks-achieved-label-${keyResultIndex}`}
              >
                Achieved
              </div>
            </div>
            <Tag
              className="font-bold border-none min-w-8  text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {krProgressRatioText}
            </Tag>
          </div>

          <div
            className="items-center gap-2 hidden sm:flex"
            data-cy={`key-result-tasks-progress-section-${keyResultIndex}`}
          >
            <div
              className="flex items-center gap-1"
              data-cy={`key-result-tasks-progress-label-container-${keyResultIndex}`}
            >
              <div
                className="text-green-600 text-xl"
                data-cy={`key-result-tasks-progress-bullet-${keyResultIndex}`}
              >
                &#x2022;
              </div>
              <div
                className="text-gray-500 font-semibold mt-1  text-[10px] flex items-center rounded-lg"
                data-cy={`key-result-tasks-progress-label-${keyResultIndex}`}
              >
                KR Progress
              </div>
            </div>
            <Tag
              className="font-bold border-none min-w-8 text-center text-green-600 text-[10px]"
              color="#ddf4e9"
            >
              {krProgressPercent}%
            </Tag>
          </div>
        </div>
      </div>
      <div
        className="bg-white px-3 w-full sm:px-6"
        data-cy={`key-result-tasks-title-section-${keyResultIndex}`}
      >
        <div
          className="flex items-center gap-2 mb-1"
          data-cy={`key-result-tasks-title-container-${keyResultIndex}`}
        >
          <BsKey size={32} className="text-[#3636f0] flex-shrink-0" />
          <h2
            className="text-sm font-semibold truncate min-w-0 flex-1"
            data-cy={`key-result-tasks-title-${keyResultIndex}`}
          >
            {keyResult?.title}
          </h2>
        </div>
      </div>
      {activeTab === 1 ? (
        <MilestoneTasks keyResultIndex={keyResultIndex} keyResult={keyResult} />
      ) : (
        <>
          {keyResult?.milestones?.map(
            (milestone: any, milestoneIndex: number) => (
              <TasksDisplayer key={milestoneIndex} tasks={milestone?.tasks} />
            ),
          )}
          <TasksDisplayer tasks={keyResult?.tasks} />
        </>
      )}
    </div>
  );
};

export default KeyResultTasks;
