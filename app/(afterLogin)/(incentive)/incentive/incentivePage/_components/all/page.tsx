import React from 'react';
import IncentiveFilter from './filters';
import AllIncentiveTable from './table';
import IncentiveCards from '../cards';

const All: React.FC = () => {
  return (
    <div>
      <IncentiveCards />
      <IncentiveFilter />
      <AllIncentiveTable />
    </div>
  );
};

export default All;
