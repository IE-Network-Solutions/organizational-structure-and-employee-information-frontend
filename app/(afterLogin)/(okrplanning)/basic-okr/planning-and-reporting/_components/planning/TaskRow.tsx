import React from 'react';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import { BsChevronDown } from 'react-icons/bs';
import { Dropdown, type MenuProps } from 'antd';

interface TaskProps {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'completed' | 'pending' | 'failed';
  weight?: number;
  target?: number;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  let colorClass = '';
  let bgClass = '';

  switch (priority) {
    case 'High':
      colorClass = 'text-[#FF4D4F]';
      bgClass = 'bg-[#FFF2F0]';
      break;
    case 'Medium':
      colorClass = 'text-[#FAAD14]';
      bgClass = 'bg-[#FFFBE6]';
      break;
    case 'Low':
      colorClass = 'text-[#52C41A]';
      bgClass = 'bg-[#F6FFED]';
      break;
    default:
      colorClass = 'text-gray-500';
      bgClass = 'bg-gray-50';
  }

  return (
    <span
      className={`${colorClass} ${bgClass} px-3 py-1 rounded-md text-[11px] font-bold whitespace-nowrap min-w-[70px] text-center`}
      data-cy={`priority-badge-${priority.toLowerCase()}`}
    >
      {priority}
    </span>
  );
};

const WeightBadge = ({ weight }: { weight: number }) => {
  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap"
      data-cy="weight-badge"
    >
      <div
        className="flex items-center gap-1.5 text-gray-400 text-[11px]"
        data-cy="weight-label-container"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#574CFF]"
          data-cy="weight-indicator"
        />
        <span data-cy="weight-label">Weight</span>
      </div>
      <div
        className="bg-[#E0E7FF] text-[#574CFF] px-3 py-1 rounded-md font-bold text-sm min-w-[45px] text-center"
        data-cy="weight-value"
      >
        {Math.round(weight)}
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
  onStatusChange,
  isReported,
}: {
  status?: string;
  onStatusChange?: (status: string) => void;
  isReported?: boolean;
}) => {
  let colorClass = '';
  let borderClass = '';
  let label = '';

  switch (status) {
    case 'completed':
      colorClass = 'text-[#52C41A]';
      borderClass = 'border-[#B7EB8F]';
      label = 'Achieved';
      break;
    case 'failed':
      colorClass = 'text-[#FF4D4F]';
      borderClass = 'border-[#FFA39E]';
      label = 'Failed';
      break;
    case 'pending':
    default:
      colorClass = 'text-[#FAAD14]';
      borderClass = 'border-[#FFE58F]';
      label = 'Pending';
      break;
  }

  if (isReported) {
    return (
      <div
        className={`flex items-center justify-center px-4 py-1.5 rounded-lg border ${borderClass} bg-white min-w-[120px]`}
        data-cy="status-badge-reported"
      >
        <span
          className={`font-bold text-sm ${colorClass}`}
          data-cy="status-label-reported"
        >
          {label}
        </span>
      </div>
    );
  }

  const items: MenuProps['items'] = [
    {
      key: 'pending',
      label: 'Pending',
      onClick: () => onStatusChange?.('pending'),
    },
    {
      key: 'completed',
      label: 'Achieved',
      onClick: () => onStatusChange?.('completed'),
    },
    {
      key: 'failed',
      label: 'Failed',
      onClick: () => onStatusChange?.('failed'),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} data-cy="status-dropdown">
      <div
        className={`flex items-center justify-between gap-2 px-4 py-1.5 rounded-lg border ${borderClass} bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px]`}
        data-cy="status-badge"
      >
        <span
          className={`font-bold text-sm ${colorClass}`}
          data-cy="status-label"
        >
          {label}
        </span>
        <BsChevronDown
          className={`text-xs ${colorClass}`}
          data-cy="status-chevron"
        />
      </div>
    </Dropdown>
  );
};

export default function TaskRow({
  task,
  onStatusChange,
  showStatus = true,
  isReported = false,
}: {
  task: TaskProps & { associatedWeekly?: string };
  onStatusChange?: (status: string) => void;
  showStatus?: boolean;
  isReported?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-12 items-center p-4 border border-gray-200 rounded-xl bg-white mb-3"
      data-cy="task-row"
    >
      <div
        className="col-span-12 md:col-span-5 flex items-start gap-4"
        data-cy="task-info-section"
      >
        <div className="mt-1 flex-shrink-0" data-cy="task-status-icon">
          {task.status === 'completed' && (
            <IoCheckmarkCircleOutline
              className="text-2xl text-[#52C41A]"
              data-cy="task-completed-icon"
            />
          )}
          {task.status === 'failed' && (
            <IoCloseCircleOutline
              className="text-2xl text-[#FF4D4F]"
              data-cy="task-failed-icon"
            />
          )}
          {(task.status === 'pending' || !task.status) && (
            <IoTimeOutline
              className="text-2xl text-[#FAAD14]"
              data-cy="task-pending-icon"
            />
          )}
        </div>
        <div className="min-w-0 flex-1" data-cy="task-details">
          <h4
            className="text-[#161A2C] font-bold text-sm mb-0.5 truncate"
            title={task.title}
            data-cy="task-title"
          >
            Task: {task.title}
          </h4>
          <p
            className="text-gray-400 text-xs truncate"
            data-cy="task-associated-weekly"
          >
            <span
              className="font-medium text-gray-400 opacity-80"
              data-cy="associated-weekly-label"
            >
              Associated Weekly:
            </span>{' '}
            {task.associatedWeekly || 'Complete development by Q2 end'}
          </p>
        </div>
      </div>

      <div
        className="col-span-6 md:col-span-4 flex items-center justify-center gap-6 md:gap-12 mt-3 md:mt-0"
        data-cy="task-badges-section"
      >
        <div
          className="flex justify-center min-w-[80px]"
          data-cy="priority-badge-container"
        >
          <PriorityBadge priority={task.priority} />
        </div>
        {/* Hide weight on small screens */}
        <div
          className="hidden md:flex justify-start min-w-[120px]"
          data-cy="weight-badge-container"
        >
          {task.weight !== undefined && <WeightBadge weight={task.weight} />}
        </div>
      </div>

      {/* Hide task status (Pending/Achieved/Failed) on small screen for reported plans */}
      <div
        className={`col-span-6 md:col-span-3 flex items-center justify-end mt-3 md:mt-0 ${isReported ? 'hidden md:flex' : ''}`}
        data-cy="task-status-section"
      >
        {showStatus && (
          <StatusBadge
            status={task.status}
            onStatusChange={onStatusChange}
            isReported={isReported}
          />
        )}
      </div>
    </div>
  );
}
