import React from 'react';
import { Tooltip } from 'antd';

interface LeaveBalanceCardProps {
  title: string;
  available: number;
  entitled?: number;
  used?: number;
  carried?: number;
  'data-cy'?: string;
}

const toOneDecimal = (value: number) => Number(value).toFixed(1);

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({
  title = '',
  available = 0,
  entitled = 0,
  used = 0,
  carried = 0,
  'data-cy': dataCy,
}) => {
  return (
    <div
      className="w-full min-h-[120px] rounded-xl my-2 py-3 px-3 sm:px-4 border border-gray-200 transition-shadow duration-200"
      style={{ backgroundColor: '#FCFDFD' }}
      id={`time-attendance-leave-balance-card-${title}-container`}
      data-cy={
        dataCy ?? `time-attendance-leave-balance-card-${title}-container`
      }
    >
      <div
        className="flex justify-between items-start gap-2"
        id={`time-attendance-leave-balance-card-${title}-header`}
        data-cy={`time-attendance-leave-balance-card-${title}-header`}
      >
        <div
          data-cy={`time-attendance-leave-balance-card-${title}-header-left`}
        >
          <Tooltip title={title}>
            <div
              className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 my-1 cursor-default"
              id={`time-attendance-leave-balance-card-${title}-title`}
              data-cy={`time-attendance-leave-balance-card-${title}-title`}
            >
              {title}
            </div>
          </Tooltip>
          <div
            className="text-xs font-medium text-gray-500"
            data-cy={`time-attendance-leave-balance-card-${title}-available-label`}
          >
            Available
          </div>
        </div>
        <div
          className="shrink-0 text-right"
          id={`time-attendance-leave-balance-card-${title}-available`}
          data-cy={`time-attendance-leave-balance-card-${title}-available`}
        >
          <div
            className="text-xl sm:text-2xl font-bold"
            style={{ color: '#1677FF' }}
            data-cy={`time-attendance-leave-balance-card-${title}-available-value`}
          >
            {toOneDecimal(available)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: '#1677FF' }}
            data-cy={`time-attendance-leave-balance-card-${title}-available-unit`}
          >
            days
          </div>
        </div>
      </div>
      <div
        className="flex justify-between gap-2 mt-3"
        data-cy={`time-attendance-leave-balance-card-${title}-stats-row`}
      >
        <div
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1 bg-white min-w-0 text-center"
          id={`time-attendance-leave-balance-card-${title}-entitled`}
          data-cy={`time-attendance-leave-balance-card-${title}-entitled`}
        >
          <span
            className="text-[10px] text-gray-500 block"
            data-cy={`time-attendance-leave-balance-card-${title}-entitled-label`}
          >
            Entitled
          </span>
          <span
            className="text-sm font-semibold text-gray-900"
            data-cy={`time-attendance-leave-balance-card-${title}-entitled-value`}
          >
            {toOneDecimal(entitled)}
          </span>
        </div>
        <div
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1 bg-white min-w-0 text-center"
          id={`time-attendance-leave-balance-card-${title}-used`}
          data-cy={`time-attendance-leave-balance-card-${title}-used`}
        >
          <span
            className="text-[10px] text-gray-500 block"
            data-cy={`time-attendance-leave-balance-card-${title}-used-label`}
          >
            Used
          </span>
          <span
            className="text-sm font-semibold text-red-600"
            data-cy={`time-attendance-leave-balance-card-${title}-used-value`}
          >
            {toOneDecimal(used)}
          </span>
        </div>
        <div
          className="flex-1 rounded-lg border border-gray-200 px-2 py-1 bg-white min-w-0 text-center"
          id={`time-attendance-leave-balance-card-${title}-carried`}
          data-cy={`time-attendance-leave-balance-card-${title}-carried`}
        >
          <span
            className="text-[10px] text-gray-500 block"
            data-cy={`time-attendance-leave-balance-card-${title}-carried-label`}
          >
            Carried
          </span>
          <span
            className="text-sm font-semibold text-primary"
            data-cy={`time-attendance-leave-balance-card-${title}-carried-value`}
          >
            {toOneDecimal(carried)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
