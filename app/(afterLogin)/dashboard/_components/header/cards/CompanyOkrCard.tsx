'use client';

import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import ProgressStatCard from './ProgressStatCard';
import { OkrHeaderStatCardSkeleton } from './shared';

export default function CompanyOkrCard() {
  const { userId } = useAuthenticationStore();
  const { data: objectiveDashboard, isLoading } = useGetUserObjectiveDashboard(
    userId,
    undefined,
    undefined,
    !!userId,
  );

  if (isLoading) {
    return <OkrHeaderStatCardSkeleton dataCy="okr-card-company-okr-skeleton" />;
  }

  return (
    <ProgressStatCard
      label="Company OKR"
      value={`${Number(objectiveDashboard?.companyOkr?.toFixed(2) || 0)}%`}
      percent={Number(objectiveDashboard?.companyOkr || 0)}
      iconBgClassName="bg-[#F9F0FF]"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#722ED1"
          data-cy="okr-card-company-okr-icon"
        >
          <path
            d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"
            data-cy="okr-card-company-okr-icon-path"
          />
        </svg>
      }
      dataCy="okr-card-company-okr"
    />
  );
}
