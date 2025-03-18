import React from 'react';
import IncentiveCards from '../cards';
import DynamicIncentiveFilter from './_components/filters';
import DynamicIncentiveTable from './_components/dynamicIncentiveTable';
import ImportData from './_components/importDrawer';

const DynamicIncentive: React.FC = () => {
  return (
    <div>
      <IncentiveCards />
      <DynamicIncentiveFilter />
      <DynamicIncentiveTable />
      <ImportData />
    </div>
  );
};

export default DynamicIncentive;
