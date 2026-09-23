'use client';
import React, { FC } from 'react';
import { Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveCommitmentsByUser } from '@/store/server/features/tna/trainingCommitment/queries';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';
import { BookOpen } from 'lucide-react';

/**
 * Employee-facing tracker for their own running commitments. Renders nothing
 * when the employee has none, so the grid stays the focus.
 */
const MyCommitmentsPanel: FC = () => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();
  const { data: commitments, isLoading } = useGetActiveCommitmentsByUser(
    userId ?? '',
  );

  if (isLoading) {
    return (
      <div
        className="w-full rounded-lg border border-shell-line bg-white p-4"
        data-cy="tna-my-commitments-loading"
      >
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  if (!commitments?.length) {
    return null;
  }

  return (
    <section
      className="box-border flex w-full flex-col gap-3"
      id="tnaMyCommitmentsPanelId"
      data-cy="tna-my-commitments-panel"
    >
      <div
        className="flex items-center justify-between gap-2"
        data-cy="tna-my-commitments-header"
      >
        <div
          className="flex min-w-0 items-center gap-2.5"
          data-cy="tna-my-commitments-heading"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-shell-tint text-primary"
            aria-hidden
            data-cy="tna-my-commitments-icon"
          >
            <BookOpen size={17} strokeWidth={2.1} />
          </span>
          <h2
            className="m-0 text-base font-semibold leading-6 text-shell-ink"
            data-cy="tna-my-commitments-title"
          >
            My Training Commitments
          </h2>
        </div>
        <span
          className="rounded-md bg-shell-tint px-2.5 py-1 text-xs font-semibold text-primary"
          data-cy="tna-my-commitments-count"
        >
          {commitments.length} active
        </span>
      </div>

      <div
        className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        data-cy="tna-my-commitments-grid"
      >
        {commitments.map((commitment) => (
          <button
            key={commitment.id}
            type="button"
            onClick={() =>
              router.push(
                `/tna/management/external/${commitment.trainingRequestId}`,
              )
            }
            className="box-border flex w-full flex-col gap-2 rounded-lg border border-shell-line bg-white p-3.5 text-left transition-colors hover:border-[#CDD2F6] hover:bg-shell-wash"
            data-cy={`tna-my-commitment-card-${commitment.id}`}
          >
            <div
              className="flex items-start justify-between gap-2"
              data-cy={`tna-my-commitment-head-${commitment.id}`}
            >
              <span
                className="line-clamp-1 text-sm font-semibold leading-[22px] text-shell-ink"
                data-cy={`tna-my-commitment-name-${commitment.id}`}
              >
                {commitment.trainingRequest?.courseName || 'External training'}
              </span>
              <span
                className="shrink-0 rounded bg-shell-tint px-2 py-px text-xs font-medium leading-5 text-primary"
                data-cy={`tna-my-commitment-pill-${commitment.id}`}
              >
                External
              </span>
            </div>

            <div
              className="text-xs leading-5 text-shell-muted"
              data-cy={`tna-my-commitment-dates-${commitment.id}`}
            >
              {commitment.startDate
                ? dayjs(commitment.startDate).format(DATE_FORMAT)
                : '-'}{' '}
              &rarr;{' '}
              {commitment.endDate
                ? dayjs(commitment.endDate).format(DATE_FORMAT)
                : '-'}
            </div>

            <CommitmentProgressBar commitment={commitment} compact />
          </button>
        ))}
      </div>
    </section>
  );
};

export default MyCommitmentsPanel;
