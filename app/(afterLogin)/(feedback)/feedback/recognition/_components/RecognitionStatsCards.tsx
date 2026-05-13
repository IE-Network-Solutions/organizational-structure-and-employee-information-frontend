'use client';

import { Card, Skeleton } from 'antd';
import {
  MdCategory,
  MdOutlineBallot,
  MdOutlineEmojiEvents,
  MdOutlineFolder,
} from 'react-icons/md';

type RecognitionTypeDashboardStats = {
  categories?: number;
  totalRecognitions?: number;
  totalCriteria?: number;
  totalRecognitionTypes?: number;
};

type RecognitionStatsCardsProps = {
  recognitionTypeDashboardStats?: RecognitionTypeDashboardStats;
  isLoading?: boolean;
};

type StatCardConfig = {
  key: string;
  label: string;
  value: number;
  cardCy: string;
  labelCy: string;
  valueCy: string;
  icon: React.ReactNode;
};

function RecognitionStatsCards({
  recognitionTypeDashboardStats,
  isLoading = false,
}: RecognitionStatsCardsProps) {
  const cards: StatCardConfig[] = [
    {
      key: 'categories',
      label: 'Categories',
      value: recognitionTypeDashboardStats?.categories ?? 0,
      cardCy: 'recognition-stats-card-categories',
      labelCy: 'recognition-stats-label-categories',
      valueCy: 'recognition-stats-value-categories',
      icon: <MdOutlineFolder size={24} className="text-base" />,
    },
    {
      key: 'totalRecognitions',
      label: 'Total Recognitions',
      value: recognitionTypeDashboardStats?.totalRecognitions ?? 0,
      cardCy: 'recognition-stats-card-total-recognitions',
      labelCy: 'recognition-stats-label-total-recognitions',
      valueCy: 'recognition-stats-value-total-recognitions',
      icon: <MdOutlineEmojiEvents size={24} className="text-base" />,
    },
    {
      key: 'totalCriteria',
      label: 'Total Criteria',
      value: recognitionTypeDashboardStats?.totalCriteria ?? 0,
      cardCy: 'recognition-stats-card-total-criteria',
      labelCy: 'recognition-stats-label-total-criteria',
      valueCy: 'recognition-stats-value-total-criteria',
      icon: <MdOutlineBallot size={24} className="text-base" />,
    },
    {
      key: 'totalRecognitionTypes',
      label: 'Total Recognition Types',
      value: recognitionTypeDashboardStats?.totalRecognitionTypes ?? 0,
      cardCy: 'recognition-stats-card-total-types',
      labelCy: 'recognition-stats-label-total-types',
      valueCy: 'recognition-stats-value-total-types',
      icon: <MdCategory size={24} className="text-base" />,
    },
  ];

  return (
    <div
      className="my-5 grid w-full grid-cols-1 gap-3 overflow-x-auto scrollbar-none sm:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible"
      data-cy="recognition-stats-cards"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className="min-w-[225px] rounded-lg border border-[#E5E7EB] bg-white p-3"
          bordered
          bodyStyle={{ padding: 0 }}
          data-cy={card.cardCy}
        >
          <div className="flex flex-col gap-2" data-cy={`${card.cardCy}-inner`}>
            <div
              className="flex items-center gap-2"
              data-cy={`${card.cardCy}-header`}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]"
                data-cy={`${card.cardCy}-icon`}
              >
                {card.icon}
              </span>
              <p
                className="text-sm font-medium leading-normal text-[#374151]"
                data-cy={card.labelCy}
              >
                {card.label}
              </p>
            </div>
            {isLoading ? (
              <div className="pl-9" data-cy={`${card.cardCy}-value-skeleton`}>
                <Skeleton.Input active size="small" style={{ width: 80 }} />
              </div>
            ) : (
              <p
                className="pl-0 text-[26px] font-semibold leading-none tracking-tight text-[#111827] sm:text-[28px]"
                data-cy={card.valueCy}
              >
                {card.value}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default RecognitionStatsCards;
