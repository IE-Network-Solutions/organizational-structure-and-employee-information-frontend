'use client';

import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import DeductionTypeCardGrid from '../compensationSetting/deductionType/_components/deductionTypeCardGrid';

const DeductionPage = () => {
  return (
    <BlockWrapper className="h-auto w-full bg-white px-0 pb-6 pt-4">
      <DeductionTypeCardGrid data-cy="compensation-deduction-type-card-grid" />
    </BlockWrapper>
  );
};

export default DeductionPage;
