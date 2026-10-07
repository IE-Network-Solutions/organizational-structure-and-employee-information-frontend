'use client';
import React, { FC } from 'react';
import { Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveCommitmentsByUser } from '@/store/server/features/tna/trainingCommitment/queries';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';

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
        className="w-full rounded-[8px] border border-[#D9D9D9] bg-white p-4"
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
      className="box-border flex w-full flex-col gap-3 rounded-[8px] bg-[#F9FAFB] p-4"
      id="tnaMyCommitmentsPanelId"
      data-cy="tna-my-commitments-panel"
    >
      <div
        className="flex items-center justify-between gap-2"
        data-cy="tna-my-commitments-header"
      >
        <h2
          className="m-0 text-sm font-bold leading-[22px] text-black"
          data-cy="tna-my-commitments-title"
        >
          My Training Commitments
        </h2>
        <span
          className="text-xs leading-5 text-black/45"
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
            className="box-border flex w-full flex-col gap-2 rounded-[8px] border border-[#D9D9D9] bg-white p-3 text-left transition-shadow hover:shadow-md"
            data-cy={`tna-my-commitment-card-${commitment.id}`}
          >
            <div
              className="flex items-start justify-between gap-2"
              data-cy={`tna-my-commitment-head-${commitment.id}`}
            >
              <span
                className="line-clamp-1 text-sm font-bold leading-[22px] text-black"
                data-cy={`tna-my-commitment-name-${commitment.id}`}
              >
                {commitment.trainingRequest?.courseName || 'External training'}
              </span>
              <span
                className="shrink-0 rounded-[4px] border border-[#1E40AF] bg-[rgba(30,64,175,0.06)] px-2 py-px text-xs leading-5 text-[#1E40AF]"
                data-cy={`tna-my-commitment-pill-${commitment.id}`}
              >
                External
              </span>
            </div>

            <div
              className="text-xs leading-5 text-black/45"
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
