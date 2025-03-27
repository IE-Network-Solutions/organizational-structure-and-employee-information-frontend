'use client';
import React from 'react';
import DynamicIncentiveFilter from './_components/filters';
import ImportData from './_components/importDrawer';
import DynamicIncentiveCards from './_components/dynamicCards';
import IncentiveTableAfterGenerate from '../../payroll-detail/[id]/tableWithId';

interface DynamicIncentiveProps {
  parentRecognitionId: string;
}
const DynamicIncentive: React.FC<DynamicIncentiveProps> = ({
  parentRecognitionId,
}) => {
  return (
    <div>
      <DynamicIncentiveCards parentRecognitionId={parentRecognitionId} />
      <DynamicIncentiveFilter />
      <IncentiveTableAfterGenerate id={parentRecognitionId} />
      <ImportData parentRecognitionId={parentRecognitionId} />
    </div>
  );
};

export default DynamicIncentive;
