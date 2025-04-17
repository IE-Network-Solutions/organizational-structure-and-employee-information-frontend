import { Tag } from 'antd';
import { FC } from 'react';
import { MdOutlineKey } from 'react-icons/md';
import MilestoneTasks from './milestoneTasks';
import TasksDisplayer from '../reporting/milestone';
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
  return (
    <div className="py-3 px-5 sm:px-5 my-3 bg-white shadow-sm rounded-lg border">
      <div className="grid gap-4 mt-3 sm:mt-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-gray-500 font-semibold mt-1  text-[10px] flex items-center rounded-lg">
                {keyResult?.metricType?.name === 'Milestone'
                  ? 'Milestones'
                  : 'Target'}
              </div>
            </div>
            <Tag
              className="font-bold border-none w-8 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {' '}
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? '100'
                  : Number(keyResult?.targetValue)?.toLocaleString() || 0}
            </Tag>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-gray-500 font-semibold mt-1 text-[10px] flex items-center rounded-lg">
                Achieved
              </div>
            </div>
            <Tag
              className="font-bold border-none w-8  text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {' '}
              {keyResult?.metricType?.name === 'Milestone'
                ? keyResult?.milestones?.filter(
                    (e: any) => e.status === 'Completed',
                  )?.length || 0
                : keyResult?.metricType?.name === 'Achieve'
                  ? keyResult?.progress
                  : Number(keyResult?.currentValue)?.toLocaleString() || 0}
            </Tag>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="text-green-600 text-xl">&#x2022;</div>
              <div className="text-gray-500 font-semibold mt-1  text-[10px] flex items-center rounded-lg">
                KR Progress
              </div>
            </div>
            <Tag
              className="font-bold border-none min-w-8 text-center text-green-600 text-[10px]"
              color="#ddf4e9"
            >
              {' '}
              {keyResult?.progress || 0}%
            </Tag>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 sm:justify-between  items-start">
        <div className="flex items-start gap-1 col-span-12 sm:col-span-8">
          <MdOutlineKey size={14} className="text-blue text-xs" />
          <h2 className="text-xs font-semibold">{keyResult?.title}</h2>
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
