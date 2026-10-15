'use client';

import { useRouter } from 'next/navigation';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import ProgressStatCard from './ProgressStatCard';
import { OkrHeaderStatCardSkeleton } from './shared';

export default function VariablePayCard() {
  const { userId } = useAuthenticationStore();
  const { data: vpScore, isLoading } = useGetVPScore(userId, !!userId);
  const router = useRouter();

  if (isLoading) {
    return <OkrHeaderStatCardSkeleton dataCy="okr-card-vp-score-skeleton" />;
  }

  return (
    <ProgressStatCard
      label="Total Variable Pay"
      labelClassName="text-black/45"
      value={`${Number(vpScore?.score || 0)}%`}
      percent={
        (Number(vpScore?.score || 0) / Number(vpScore?.maxScore || 100)) * 100
      }
      iconBgClassName="bg-[#FFF2F0]"
      onClick={() => router.push('/dashboard/vp')}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#FF4D4F"
          data-cy="okr-card-vp-score-icon"
        >
          <path
            d="M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84h-80Z"
            data-cy="okr-card-vp-score-icon-path"
          />
        </svg>
      }
      dataCy="okr-card-vp-score"
    />
  );
}
