'use client';

import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import BenefitTypeCardGrid from '../compensationSetting/benefitType/_components/benefitTypeCardGrid';

const BenefitPage = () => {
  return (
    <BlockWrapper className="h-auto w-full bg-white rounded-lg px-4 py-6 sm:px-6">
      <BenefitTypeCardGrid data-cy="compensation-benefit-type-card-grid" />
    </BlockWrapper>
  );
};

export default BenefitPage;
