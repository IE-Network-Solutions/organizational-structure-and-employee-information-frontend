'use client';

import { MdOutlineMilitaryTech } from 'react-icons/md';
import RecognitionStatCard from './RecognitionStatCard';
import { OkrHeaderStatCardSkeleton } from './shared';
import { useRecognitionStats } from './useRecognitionStats';

export default function AppreciationCard() {
  const { appreciationStats, isLoading } = useRecognitionStats();

  if (isLoading) {
    return (
      <OkrHeaderStatCardSkeleton dataCy="okr-card-appreciation-skeleton" />
    );
  }

  return (
    <RecognitionStatCard
      label="Appreciation"
      stats={appreciationStats}
      iconBgClassName="bg-[#F6FFED]"
      icon={
        <MdOutlineMilitaryTech
          size={24}
          className="text-green-500"
          data-cy="okr-card-appreciation-icon"
        />
      }
      dataCy="okr-card-appreciation"
    />
  );
}
