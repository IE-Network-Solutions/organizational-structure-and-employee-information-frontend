import React from 'react';
import ProgressPercent from '../progressbar';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function OkrProgress() {
  const { userId } = useAuthenticationStore();
  const { okrTab, fiscalYearId, sessionIds } = useOKRStore();
  const sessionId = sessionIds?.[0];
  const {
    data: objectiveDashboard,
    isLoading,
    isFetching,
  } = useGetUserObjectiveDashboard(userId, fiscalYearId, sessionId);
  const { isMobile } = useIsMobile();

  const isSummaryLoading = isLoading || isFetching;

  return (
    <div
      id="okr-progress-grid"
      data-cy="okr-progress-grid"
      className={`${
        isMobile
          ? 'flex flex-col gap-3 pb-2'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
      }`}
    >
      <div
        id="okr-progress-primary-card"
        data-cy="okr-progress-primary-card"
        className={`${isMobile ? 'w-full' : ''}`}
      >
        {okrTab == 1 ? (
          <ProgressPercent
            data-cy="okr-progress-primary-card-progress-percent"
            title="Overall Progress"
            percent={(objectiveDashboard?.userOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : okrTab == 2 ? (
          <ProgressPercent
            data-cy="okr-progress-team-card-progress-percent"
            title="Overall Progress"
            percent={(objectiveDashboard?.teamOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : okrTab == 3 || okrTab == 4 ? (
          <ProgressPercent
            data-cy="okr-progress-company-card-progress-percent"
            title="Overall Progress"
            percent={(objectiveDashboard?.companyOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : null}
      </div>

      <div
        id="okr-progress-supervisor-card"
        data-cy="okr-progress-supervisor-card"
        className={`${isMobile ? 'w-full' : ''}`}
      >
        <ProgressPercent
          data-cy="okr-progress-supervisor-card-progress-percent"
          title="Supervisors OKR"
          percent={(objectiveDashboard?.supervisorOkr as number) || 0}
          loading={isSummaryLoading}
          type="percent"
        />
      </div>

      <div
        id="okr-progress-kr-card"
        data-cy="okr-progress-kr-card"
        className={`${isMobile ? 'w-full' : ''}`}
      >
        <ProgressPercent
          data-cy="okr-progress-kr-card-progress-percent"
          title="Key Result Progress"
          percent={
            ((objectiveDashboard?.keyResultCount as number) || 0) > 0
              ? (((objectiveDashboard?.okrCompleted as number) || 0) /
                  ((objectiveDashboard?.keyResultCount as number) || 0)) *
                100
              : 0
          }
          loading={isSummaryLoading}
          type="percent"
        />
      </div>

      <div
        id="okr-progress-days-left-card"
        data-cy="okr-progress-days-left-card"
        className={`${isMobile ? 'w-full' : ''}`}
      >
        <ProgressPercent
          data-cy="okr-progress-days-left-card-progress-percent"
          title="Days Left"
          percent={(objectiveDashboard?.daysLeft as number) || 0}
          loading={isSummaryLoading}
          type="daysLeft"
        />
      </div>
    </div>
  );
}
