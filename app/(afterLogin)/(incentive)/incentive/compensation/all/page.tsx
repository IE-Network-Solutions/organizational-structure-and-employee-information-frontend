'use client';
import React from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';
import { Card, Skeleton } from 'antd';

export const AllIncentives = ({
  parentResponseLoading,
}: {
  parentResponseLoading: boolean;
}) => {
  return (
    <div className="">
      {parentResponseLoading ? (
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
      {parentResponseLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <IncentiveFilter />
      )}
      {parentResponseLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <AllIncentiveTable />
      )}
    </div>
  );
};
