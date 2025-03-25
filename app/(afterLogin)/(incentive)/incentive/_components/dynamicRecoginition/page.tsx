import React from 'react';
import IncentiveCards from '../cards';
import DynamicIncentiveFilter from './_components/filters';
import DynamicIncentiveTable from './_components/dynamicIncentiveTable';
import ImportData from './_components/importDrawer';

interface DynamicIncentiveProps {
  parentRecognitionId: string;
}
const DynamicIncentive: React.FC<DynamicIncentiveProps> = ({
  parentRecognitionId,
}) => {
  return (
    <div>
      <IncentiveCards />
      <DynamicIncentiveFilter />
      <DynamicIncentiveTable />
      <ImportData parentRecognitionId={parentRecognitionId} />
    </div>
  );
};

export default DynamicIncentive;
