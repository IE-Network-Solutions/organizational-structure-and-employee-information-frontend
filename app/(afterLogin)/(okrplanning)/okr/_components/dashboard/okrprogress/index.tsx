import React from 'react';
import ProgressPercent from '../progressbar';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function OkrProgress() {
  const { userId } = useAuthenticationStore();
  const { okrTab } = useOKRStore();
  const { data: objectiveDashboard, isLoading } =
    useGetUserObjectiveDashboard(userId);
  const { isMobile } = useIsMobile();

  return (
    <div
      className={`${isMobile ? 'flex overflow-x-auto gap-4 pb-4 scrollbar-none' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}
    >
      <div
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        {okrTab == 1 ? (
          <ProgressPercent
            title="Average OKR"
            percent={(objectiveDashboard?.userOkr as number) || 0}
            loading={isLoading}
            type="percent"
          />
        ) : okrTab == 2 ? (
          <ProgressPercent
            title="Team  OKR"
            percent={(objectiveDashboard?.teamOkr as number) || 0}
            loading={isLoading}
            type="percent"
          />
        ) : okrTab == 3 ? (
          <ProgressPercent
            title="Company OKR"
            percent={(objectiveDashboard?.companyOkr as number) || 0}
            loading={isLoading}
            type="percent"
          />
        ) : null}
      </div>

      <div
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        <ProgressPercent
          title="Supervisor OKR"
          percent={(objectiveDashboard?.supervisorOkr as number) || 0}
          loading={isLoading}
          type="percent"
        />
      </div>

      <div
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        <ProgressPercent
          title="KR Completed"
          percent={
            (((objectiveDashboard?.okrCompleted as number) || 0) /
              ((objectiveDashboard?.keyResultCount as number) || 0)) *
            100
          }
          loading={isLoading}
          type="ratio"
          format={`${objectiveDashboard?.okrCompleted || 0}/${objectiveDashboard?.keyResultCount || 0}`}
        />
      </div>

      <div
        className={`${isMobile ? 'min-w-[calc(50%-8px)] flex-shrink-0' : ''}`}
      >
        <ProgressPercent
          title="Days Left"
          percent={(objectiveDashboard?.daysLeft as number) || 0}
          loading={isLoading}
          type="daysLeft"
        />
      </div>
    </div>
  );
}
