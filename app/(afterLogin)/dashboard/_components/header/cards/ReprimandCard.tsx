'use client';

import { MdReportGmailerrorred } from 'react-icons/md';
import RecognitionStatCard from './RecognitionStatCard';
import { OkrHeaderStatCardSkeleton } from './shared';
import { useRecognitionStats } from './useRecognitionStats';

export default function ReprimandCard() {
  const { reprimandStats, isLoading } = useRecognitionStats();

  if (isLoading) {
    return <OkrHeaderStatCardSkeleton dataCy="okr-card-reprimand-skeleton" />;
  }

  return (
    <RecognitionStatCard
      label="Reprimand"
      stats={reprimandStats}
      iconBgClassName="bg-[#FFF2F0]"
      icon={
        <MdReportGmailerrorred
          size={24}
          className="text-red-500"
          data-cy="okr-card-reprimand-icon"
        />
      }
      dataCy="okr-card-reprimand"
    />
  );
}
