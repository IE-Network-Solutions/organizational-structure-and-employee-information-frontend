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
    <div id="dynamic-incentive-container" data-cy="dynamic-incentive-container">
      <DynamicIncentiveCards
        data-cy="dynamic-incentive-cards"
        parentRecognitionId={parentRecognitionId}
      />
      <DynamicIncentiveFilter data-cy="dynamic-incentive-filter" />
      <IncentiveTableAfterGenerate
        data-cy="dynamic-incentive-table"
        id={parentRecognitionId}
      />
      <ImportData
        data-cy="dynamic-incentive-import-data"
        parentRecognitionId={parentRecognitionId}
      />
    </div>
  );
};

export default DynamicIncentive;
