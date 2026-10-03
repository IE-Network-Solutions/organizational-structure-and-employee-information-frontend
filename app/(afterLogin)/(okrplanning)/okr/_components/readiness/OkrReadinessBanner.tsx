'use client';

import { Button, Modal } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { useFinalizeOkr } from '@/store/server/features/okrplanning/okr-readiness/mutations';
import { useGetOkrReadiness } from '@/store/server/features/okrplanning/okr-readiness/queries';
import {
  getReadinessIssueSummary,
  getReadinessStatusLabel,
} from './readinessUtils';

interface OkrReadinessBannerProps {
  userId?: string;
  sessionId?: string;
  onFinalized?: () => void;
}

const statusIcon = {
  ok: <CheckCircleFilled className="text-green-600" />,
  missing: <CloseCircleFilled className="text-red-500" />,
  incomplete: <ExclamationCircleFilled className="text-amber-500" />,
};

export default function OkrReadinessBanner({
  userId,
  sessionId,
  onFinalized,
}: OkrReadinessBannerProps) {
  const { data: readiness, isLoading } = useGetOkrReadiness(
    { userId, sessionId },
    { enabled: Boolean(userId && sessionId) },
  );
  const { mutate: finalizeOkr, isLoading: isFinalizing } = useFinalizeOkr();

  if (!sessionId || readiness?.scoringMode !== 'TYPE_WEIGHTED') return null;

  const showReadinessIssues = () => {
    const issues = getReadinessIssueSummary(readiness);
    Modal.warning({
      title: 'OKRs are not ready to submit',
      content: (
        <div className="mt-3" data-cy="okr-readiness-modal-content">
          <p className="mb-2" data-cy="okr-readiness-modal-description">
            Complete the following requirements before submitting your OKRs:
          </p>
          <ul
            className="list-disc space-y-1 pl-5"
            data-cy="okr-readiness-modal-issues"
          >
            {issues.map((issue) => (
              <li key={issue} data-cy="okr-readiness-modal-issue">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      ),
      okText: 'Review OKRs',
    });
  };

  const handleFinalize = () => {
    if (!readiness.canFinalize) {
      showReadinessIssues();
      return;
    }

    finalizeOkr(
      { userId: userId as string, sessionId },
      { onSuccess: onFinalized },
    );
  };

  return (
    <section
      aria-label="OKR readiness"
      data-cy="okr-readiness-banner"
      className="mb-4 rounded-lg border border-[#D9D9D9] bg-[#FAFAFA] p-4"
    >
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        data-cy="okr-readiness-header"
      >
        <div data-cy="okr-readiness-heading">
          <h2
            className="text-base font-semibold text-gray-900"
            data-cy="okr-readiness-title"
          >
            OKR submission readiness
          </h2>
          <p
            className="mt-1 text-sm text-gray-600"
            data-cy="okr-readiness-description"
          >
            Review the required objective types before submitting this session.
          </p>
        </div>
        <Button
          type="primary"
          loading={isLoading || isFinalizing}
          onClick={handleFinalize}
          data-cy="okr-readiness-submit-button"
          className="bg-okr-primary sm:shrink-0"
        >
          Submit OKRs
        </Button>
      </div>

      <ul className="mt-4 space-y-2" data-cy="okr-readiness-checklist">
        {readiness.typeChecklist.map((item) => (
          <li
            key={item.objectiveTypeId}
            className="flex items-center gap-2 text-sm text-gray-700"
            data-cy={`okr-readiness-item-${item.objectiveTypeId}`}
          >
            {statusIcon[item.status]}
            <span data-cy={`okr-readiness-label-${item.objectiveTypeId}`}>
              {getReadinessStatusLabel(item)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
