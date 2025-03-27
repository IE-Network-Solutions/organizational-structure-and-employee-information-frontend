'use client';
import React from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';
import { Card, Skeleton } from 'antd';

interface LoadingProps {
  parentResponseLoading: unknown;
}

const All: React.FC<LoadingProps> = ({ parentResponseLoading }) => {
  const isLoading =
    typeof parentResponseLoading === 'boolean' ? parentResponseLoading : false;

  return (
    <div className="">
      {isLoading ? (
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
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <IncentiveFilter />
      )}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <AllIncentiveTable />
      )}
    </div>
  );
};

export default All;
