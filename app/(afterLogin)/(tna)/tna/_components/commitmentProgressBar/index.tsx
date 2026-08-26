import React, { FC, useMemo } from 'react';
import { Progress } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { classNames } from '@/utils/classNames';
import {
  UserTrainingCommitment,
  getCommitmentProgress,
} from '@/types/tna/externalTna';

interface CommitmentProgressBarProps {
  commitment: UserTrainingCommitment;
  /** Card-sized variant: bar plus a single line of context. */
  compact?: boolean;
  className?: string;
}

/**
 * How far an employee is through their commitment. `daysLeft` and `amountLeft`
 * are maintained by the nightly cron, so this only renders them.
 */
const CommitmentProgressBar: FC<CommitmentProgressBarProps> = ({
  commitment,
  compact = false,
  className = '',
}) => {
  const percent = useMemo(
    () => getCommitmentProgress(commitment),
    [commitment],
  );

  const isCompleted = Boolean(commitment?.completedCommitment);
  const strokeColor = isCompleted ? '#52C41A' : '#1E40AF';
  const daysLeft = Number(commitment?.daysLeft ?? 0);
  const amountLeft = Number(commitment?.amountLeft ?? 0);

  if (compact) {
    return (
      <div
        className={classNames('flex w-full flex-col gap-1', {}, [className])}
        data-cy="tna-commitment-progress-compact"
      >
        <div
          className="flex items-center justify-between text-[11px] font-medium leading-4 text-black/45"
          data-cy="tna-commitment-progress-compact-labels"
        >
          <span data-cy="tna-commitment-progress-compact-label">
            Commitment
          </span>
          <span data-cy="tna-commitment-progress-compact-value">
            {isCompleted ? 'Completed' : `${daysLeft} day(s) left`}
          </span>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          size="small"
          strokeColor={strokeColor}
          trailColor="#E5E7EB"
          data-cy="tna-commitment-progress-compact-bar"
        />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'box-border flex w-full flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4',
        {},
        [className],
      )}
      data-cy="tna-commitment-progress"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2"
        data-cy="tna-commitment-progress-header"
      >
        <span
          className="text-sm font-bold leading-[22px] text-black"
          data-cy="tna-commitment-progress-title"
        >
          Commitment Progress
        </span>
        <span
          className="rounded-[4px] border border-[#D9D9D9] bg-black/[0.02] px-2 py-px text-xs leading-5 text-black/70"
          data-cy="tna-commitment-progress-status"
        >
          {isCompleted ? 'Completed' : 'Active'}
        </span>
      </div>

      <Progress
        percent={percent}
        strokeColor={strokeColor}
        trailColor="#E5E7EB"
        data-cy="tna-commitment-progress-bar"
      />

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
        data-cy="tna-commitment-progress-stats"
      >
        <div data-cy="tna-commitment-progress-start">
          <div
            data-cy="tna-commitment-progress-start-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            Start date
          </div>
          <div
            data-cy="tna-commitment-progress-start-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {commitment?.startDate
              ? dayjs(commitment.startDate).format(DATE_FORMAT)
              : '-'}
          </div>
        </div>
        <div data-cy="tna-commitment-progress-end">
          <div
            data-cy="tna-commitment-progress-end-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            End date
          </div>
          <div
            data-cy="tna-commitment-progress-end-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {commitment?.endDate
              ? dayjs(commitment.endDate).format(DATE_FORMAT)
              : '-'}
          </div>
        </div>
        <div data-cy="tna-commitment-progress-remaining">
          <div
            data-cy="tna-commitment-progress-remaining-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            Days left
          </div>
          <div
            data-cy="tna-commitment-progress-remaining-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {isCompleted ? 'Completed' : `${daysLeft} day(s)`}
          </div>
        </div>
        <div data-cy="tna-commitment-progress-amount">
          <div
            data-cy="tna-commitment-progress-amount-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            Amount left
          </div>
          <div
            data-cy="tna-commitment-progress-amount-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {amountLeft.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentProgressBar;
