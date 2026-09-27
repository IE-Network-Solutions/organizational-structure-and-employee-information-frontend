'use client';

import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import ProgressStatCard from './ProgressStatCard';
import { OkrHeaderStatCardSkeleton } from './shared';

export default function AverageOkrCard() {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } = useGetUserObjectiveDashboard(
    userId,
    undefined,
    undefined,
    !!userId,
  );

  if (isLoading) {
    return <OkrHeaderStatCardSkeleton dataCy="okr-card-average-okr-skeleton" />;
  }

  return (
    <ProgressStatCard
      label="Your Average OKR"
      value={`${Number(objectiveDashboard?.userOkr?.toFixed(2) || 0)}%`}
      percent={Number(objectiveDashboard?.userOkr || 0)}
      iconBgClassName="bg-[#e6edff]"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1E40AF"
          data-cy="okr-card-average-okr-icon"
        >
          <path
            d="M480-300q75 0 127.5-52.5T660-480q0-75-52.5-127.5T480-660q-75 0-127.5 52.5T300-480q0 75 52.5 127.5T480-300Zm-28.5-151.5Q440-463 440-480t11.5-28.5Q463-520 480-520t28.5 11.5Q520-497 520-480t-11.5 28.5Q497-440 480-440t-28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
            data-cy="okr-card-average-okr-icon-path"
          />
        </svg>
      }
      dataCy="okr-card-average-okr"
    />
  );
}
