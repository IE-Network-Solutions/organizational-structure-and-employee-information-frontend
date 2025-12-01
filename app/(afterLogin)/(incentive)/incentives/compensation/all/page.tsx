'use client';
import React from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';
import { Card, Skeleton } from 'antd';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';

const AllIncentives = () => {
  const { parentResponseIsLoading } = useIncentiveStore();
  return (
    <div id="all-incentives-container" data-cy="all-incentives-container">
      {parentResponseIsLoading ? (
        <div
          id="all-incentives-skeleton-cards-container"
          data-cy="all-incentives-skeleton-cards-container"
          className="grid grid-cols-3 gap-4"
        >
          {[...Array(3)].map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            (_, index) => (
              /* eslint-enable-next-line @typescript-eslint/naming-convention */
              <Card
                id={`all-incentives-skeleton-card-${index}`}
                data-cy={`all-incentives-skeleton-card-${index}`}
                key={index}
              >
                <Skeleton data-cy={`all-incentives-skeleton-${index}`} active />
              </Card>
            ),
          )}
        </div>
      ) : (
        <IncentiveCards />
      )}
      {parentResponseIsLoading ? (
        <Skeleton
          data-cy="all-incentives-skeleton-filter"
          active
          paragraph={{ rows: 1 }}
        />
      ) : (
        <IncentiveFilter />
      )}
      {parentResponseIsLoading ? (
        <Skeleton
          data-cy="all-incentives-skeleton-table"
          active
          paragraph={{ rows: 4 }}
        />
      ) : (
        <AllIncentiveTable />
      )}
    </div>
  );
};

export default AllIncentives;
