'use client';
import React from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';
import { Card, Skeleton } from 'antd';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';

export default function AllIncentives() {
  const { parentResponseIsLoading } = useIncentiveStore();
  return (
    <div className="">
      {parentResponseIsLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */
            (_, index) => (
              /* eslint-enable-next-line @typescript-eslint/naming-convention */
              <Card key={index}>
                <Skeleton active />
              </Card>
            ),
          )}
        </div>
      ) : (
        <IncentiveCards />
      )}
      {parentResponseIsLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <IncentiveFilter />
      )}
      {parentResponseIsLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <AllIncentiveTable />
      )}
    </div>
  );
}
