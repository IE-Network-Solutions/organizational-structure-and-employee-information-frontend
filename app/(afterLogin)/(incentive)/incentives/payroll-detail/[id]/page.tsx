'use client';
import React from 'react';
import IncentiveTableAfterGenerate from './tableWithId';
import DynamicIncentiveFilter from '../../compensation/dynamicRecoginition/_components/filters';

interface Params {
  id: string;
}
interface IncentiveTableDetailsProps {
  params: Params;
}
function page({ params: { id } }: IncentiveTableDetailsProps) {
  return (
    <div className="m-4">
      <DynamicIncentiveFilter />
      <IncentiveTableAfterGenerate id={id} />
    </div>
  );
}

export default page;
