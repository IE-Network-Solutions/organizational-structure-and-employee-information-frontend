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
      className={`${isMobile ? 'flex overflow-x-auto gap-4 pb-4 scrollbar-none' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}
    >
      <div
        id="okr-progress-primary-card"
        data-cy="okr-progress-primary-card"
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        {okrTab == 1 ? (
          <ProgressPercent
            data-cy="okr-progress-primary-card-progress-percent"
            title="Average OKR"
            percent={(objectiveDashboard?.userOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : okrTab == 2 ? (
          <ProgressPercent
            data-cy="okr-progress-team-card-progress-percent"
            title="Team  OKR"
            percent={(objectiveDashboard?.teamOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : okrTab == 3 ? (
          <ProgressPercent
            data-cy="okr-progress-company-card-progress-percent"
            title="Company OKR"
            percent={(objectiveDashboard?.companyOkr as number) || 0}
            loading={isSummaryLoading}
            type="percent"
          />
        ) : null}
      </div>

      <div
        id="okr-progress-supervisor-card"
        data-cy="okr-progress-supervisor-card"
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        <ProgressPercent
          data-cy="okr-progress-supervisor-card-progress-percent"
          title="Supervisor OKR"
          percent={(objectiveDashboard?.supervisorOkr as number) || 0}
          loading={isSummaryLoading}
          type="percent"
        />
      </div>

      <div
        id="okr-progress-kr-card"
        data-cy="okr-progress-kr-card"
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        <ProgressPercent
          data-cy="okr-progress-kr-card-progress-percent"
          title="KR Completed"
          percent={
            (((objectiveDashboard?.okrCompleted as number) || 0) /
              ((objectiveDashboard?.keyResultCount as number) || 0)) *
            100
          }
          loading={isSummaryLoading}
          type="ratio"
          format={`${objectiveDashboard?.okrCompleted || 0}/${objectiveDashboard?.keyResultCount || 0}`}
        />
      </div>

      <div
        id="okr-progress-days-left-card"
        data-cy="okr-progress-days-left-card"
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
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
