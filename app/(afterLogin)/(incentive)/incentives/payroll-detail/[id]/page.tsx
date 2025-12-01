'use client';
import React from 'react';
import IncentiveTableAfterGenerate from './tableWithId';
import DynamicIncentiveFilter from '../../compensation/dynamicRecoginition/_components/filters';
import DetailPageTabs from '../../compensation/dynamicRecoginition/_components/tab';

interface Params {
  id: string;
}
interface IncentiveTableDetailsProps {
  params: Params;
}
function page({ params: { id } }: IncentiveTableDetailsProps) {
  return (
    <div id="incentive-payroll-detail-page-container" data-cy="incentive-payroll-detail-page-container" className="m-4">
      <DetailPageTabs data-cy="incentive-payroll-detail-page-tabs" />
      <DynamicIncentiveFilter data-cy="incentive-payroll-detail-page-filter" />
      <IncentiveTableAfterGenerate data-cy="incentive-payroll-detail-page-table" id={id} />
    </div>
  );
}

export default page;
