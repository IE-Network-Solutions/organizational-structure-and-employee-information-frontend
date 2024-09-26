import React from 'react';
import ProgressPercent from '../progressbar';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';

export default function OkrProgress() {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } =
    useGetUserObjectiveDashboard(userId);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ProgressPercent
        title="Average OKR"
        percent={objectiveDashboard?.userOkr as number}
        loading={isLoading}
      />
      <ProgressPercent
        title="Supervisor OKR"
        percent={objectiveDashboard?.supervisorOkr as number}
        loading={isLoading}
      />
      <ProgressPercent
        title="KR Completed"
        percent={objectiveDashboard?.okrCompleted as number}
        loading={isLoading}
      />
      <ProgressPercent
        title="Days Left"
        percent={objectiveDashboard?.daysLeft as number}
        loading={isLoading}
      />
    </div>
  );
}
