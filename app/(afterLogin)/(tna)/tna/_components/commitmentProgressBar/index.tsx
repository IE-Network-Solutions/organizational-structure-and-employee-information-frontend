import React, { FC, useMemo } from 'react';
import { Progress } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { classNames } from '@/utils/classNames';
import {
  TrainingCommitment,
  TrainingCommitmentStatus,
  TrainingCommitmentStatusLabel,
} from '@/types/tna/externalTna';

interface CommitmentProgressBarProps {
  commitment: TrainingCommitment;
  /** Card-sized variant: bar plus a single line of context. */
  compact?: boolean;
  className?: string;
}

const STROKE_BY_STATUS: Record<TrainingCommitmentStatus, string> = {
  [TrainingCommitmentStatus.ACTIVE]: '#1E40AF',
  [TrainingCommitmentStatus.COMPLETED]: '#52C41A',
  [TrainingCommitmentStatus.CANCELLED]: '#A6A6A6',
  [TrainingCommitmentStatus.BREACHED]: '#F5222D',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Renders how far an employee is through their training commitment. Uses the
 * numbers the API derives, and falls back to a local calculation so the bar
 * still works for payloads that predate them.
 */
const CommitmentProgressBar: FC<CommitmentProgressBarProps> = ({
  commitment,
  compact = false,
  className = '',
}) => {
  const { percent, daysRemaining, totalDays } = useMemo(() => {
    const start = commitment?.startDate
      ? new Date(commitment.startDate).getTime()
      : null;
    const end = commitment?.endDate
      ? new Date(commitment.endDate).getTime()
      : null;

    const fallback = (() => {
      if (start === null || end === null || end <= start) {
        return {
          percent: 0,
          daysRemaining: commitment?.durationDays ?? 0,
          totalDays: commitment?.durationDays ?? 0,
        };
      }
      const now = Date.now();
      const elapsed = Math.min(Math.max(now - start, 0), end - start);
      return {
        percent: Math.round((elapsed / (end - start)) * 100),
        daysRemaining: Math.max(0, Math.ceil((end - now) / MS_PER_DAY)),
        totalDays: Math.max(1, Math.round((end - start) / MS_PER_DAY)),
      };
    })();

    return {
      percent: commitment?.progressPercentage ?? fallback.percent,
      daysRemaining: commitment?.daysRemaining ?? fallback.daysRemaining,
      totalDays:
        commitment?.totalDays ?? commitment?.durationDays ?? fallback.totalDays,
    };
  }, [commitment]);

  const isCompleted = commitment?.status === TrainingCommitmentStatus.COMPLETED;
  const strokeColor =
    STROKE_BY_STATUS[commitment?.status] ??
    STROKE_BY_STATUS[TrainingCommitmentStatus.ACTIVE];

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
            {isCompleted
              ? 'Completed'
              : `${daysRemaining} of ${totalDays} day(s) left`}
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
          {TrainingCommitmentStatusLabel[commitment?.status] ??
            commitment?.status}
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
        <div data-cy="tna-commitment-progress-total">
          <div
            data-cy="tna-commitment-progress-total-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            Total duration
          </div>
          <div
            data-cy="tna-commitment-progress-total-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {totalDays} day(s)
          </div>
        </div>
        <div data-cy="tna-commitment-progress-remaining">
          <div
            data-cy="tna-commitment-progress-remaining-label"
            className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
          >
            Remaining
          </div>
          <div
            data-cy="tna-commitment-progress-remaining-value"
            className="text-sm font-medium leading-[22px] text-black/70"
          >
            {isCompleted ? 'Completed' : `${daysRemaining} day(s)`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentProgressBar;
