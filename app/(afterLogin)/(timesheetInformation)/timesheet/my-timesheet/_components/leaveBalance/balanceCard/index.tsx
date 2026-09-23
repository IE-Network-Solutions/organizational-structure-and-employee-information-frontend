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
  const stats = [
    { key: 'entitled', label: 'Entitled', value: entitled, tone: '' },
    { key: 'used', label: 'Used', value: used, tone: 'text-[#D92D20]' },
    { key: 'carried', label: 'Carried', value: carried, tone: 'text-primary' },
  ];

  return (
    <div
      className="my-2 min-h-[120px] w-full rounded-lg bg-shell-tint px-4 py-3.5"
      id={`time-attendance-leave-balance-card-${title}-container`}
      data-cy={
        dataCy ?? `time-attendance-leave-balance-card-${title}-container`
      }
    >
      <div
        className="min-w-0"
        id={`time-attendance-leave-balance-card-${title}-header`}
        data-cy={`time-attendance-leave-balance-card-${title}-header`}
      >
        <Tooltip title={title}>
          <div
            className="line-clamp-1 cursor-default text-[11px] font-semibold uppercase tracking-[0.04em] text-primary"
            id={`time-attendance-leave-balance-card-${title}-title`}
            data-cy={`time-attendance-leave-balance-card-${title}-title`}
          >
            {title}
          </div>
        </Tooltip>
        <div
          className="mt-1.5 flex items-baseline gap-1.5"
          id={`time-attendance-leave-balance-card-${title}-available`}
          data-cy={`time-attendance-leave-balance-card-${title}-available`}
        >
          <span
            className="text-[28px] font-semibold leading-8 tabular-nums text-shell-ink"
            data-cy={`time-attendance-leave-balance-card-${title}-available-value`}
          >
            {toOneDecimal(available)}
          </span>
          <span
            className="text-[13px] text-shell-muted"
            data-cy={`time-attendance-leave-balance-card-${title}-available-unit`}
          >
            days
          </span>
          <span
            className="text-[13px] text-shell-muted"
            data-cy={`time-attendance-leave-balance-card-${title}-available-label`}
          >
            available
          </span>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-3 gap-2 border-t border-[#DFE3FF] pt-2.5"
        data-cy={`time-attendance-leave-balance-card-${title}-stats-row`}
      >
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="min-w-0"
            id={`time-attendance-leave-balance-card-${title}-${stat.key}`}
            data-cy={`time-attendance-leave-balance-card-${title}-${stat.key}`}
          >
            <span
              className="block text-[11px] text-shell-muted"
              data-cy={`time-attendance-leave-balance-card-${title}-${stat.key}-label`}
            >
              {stat.label}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                stat.tone || 'text-shell-ink'
              }`}
              data-cy={`time-attendance-leave-balance-card-${title}-${stat.key}-value`}
            >
              {toOneDecimal(stat.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
