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
      className="flex w-full gap-4 my-6 overflow-x-auto scrollbar-none md:grid md:overflow-x-visible md:scrollbar-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      data-cy="recognition-stats-cards"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3 md:w-full min-w-[225px]"
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
                className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary"
                data-cy={`${card.cardCy}-icon`}
              >
                {card.icon}
              </span>
              <p
                className="text-base font-normal leading-normal text-black"
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
                className="pl-9 text-[24px] leading-none font-bold text-black"
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
