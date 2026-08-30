'use client';

import { Card, Skeleton } from 'antd';
import {
  MdCategory,
  MdOutlineBallot,
  MdOutlineEmojiEvents,
  MdOutlineFolder,
} from 'react-icons/md';

type IncentiveStatusStats = {
  categories?: number | string;
  totalCriteria?: number | string;
  totalIncentive?: number | string;
  totalRecognitionTypes?: number | string;
};

type IncentiveStatusCardsProps = {
  recognitionTypeDashboardStats?: IncentiveStatusStats;
  isLoading?: boolean;
};

type StatCardConfig = {
  key: string;
  label: string;
  value: string | number;
  cardCy: string;
  labelCy: string;
  valueCy: string;
  icon: React.ReactNode;
};

/** Top KPI cards on Incentives → Incentive (Categories / Criteria / Incentive / Types). */
function IncentiveStatusCards({
  recognitionTypeDashboardStats,
  isLoading = false,
}: IncentiveStatusCardsProps) {
  const cards: StatCardConfig[] = [
    {
      key: 'categories',
      label: 'Categories',
      value: recognitionTypeDashboardStats?.categories ?? 0,
      cardCy: 'incentive-stats-card-categories',
      labelCy: 'incentive-stats-label-categories',
      valueCy: 'incentive-stats-value-categories',
      icon: <MdOutlineFolder size={24} className="text-base" />,
    },
    {
      key: 'totalCriteria',
      label: 'Total Criteria',
      value: recognitionTypeDashboardStats?.totalCriteria ?? 0,
      cardCy: 'incentive-stats-card-total-criteria',
      labelCy: 'incentive-stats-label-total-criteria',
      valueCy: 'incentive-stats-value-total-criteria',
      icon: <MdOutlineEmojiEvents size={24} className="text-base" />,
    },
    {
      key: 'totalIncentive',
      label: 'Total Incentive',
      value: recognitionTypeDashboardStats?.totalIncentive ?? 0,
      cardCy: 'incentive-stats-card-total-incentive',
      labelCy: 'incentive-stats-label-total-incentive',
      valueCy: 'incentive-stats-value-total-incentive',
      icon: <MdOutlineBallot size={24} className="text-base" />,
    },
    {
      key: 'totalRecognitionTypes',
      label: 'Total Recognition Types',
      value: recognitionTypeDashboardStats?.totalRecognitionTypes ?? 0,
      cardCy: 'incentive-stats-card-total-types',
      labelCy: 'incentive-stats-label-total-types',
      valueCy: 'incentive-stats-value-total-types',
      icon: <MdCategory size={24} className="text-base" />,
    },
  ];

  return (
    <div
      className="flex w-full gap-4 my-6 overflow-x-auto scrollbar-none md:grid md:overflow-x-visible md:scrollbar-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      data-cy="incentive-stats-cards"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3 md:w-full min-w-[265px]"
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
                className="text-[24px] leading-none font-bold text-black"
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

export default IncentiveStatusCards;
