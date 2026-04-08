'use client';

import React from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import BenefitTypeCardGrid from '../compensationSetting/benefitType/_components/benefitTypeCardGrid';

const BenefitPage = () => {
  return (
    <BlockWrapper className="h-auto w-full bg-white px-0 pb-6 pt-4">
      <BenefitTypeCardGrid data-cy="compensation-benefit-type-card-grid" />
    </BlockWrapper>
  );
};

export default BenefitPage;
