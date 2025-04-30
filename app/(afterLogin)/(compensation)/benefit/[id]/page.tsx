'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BenefitEntitlementTable from './_components/benefitEntitelmentTable';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';

const BenefitEntitlemetPage = () => {
  const { id } = useParams();
  const { data: benefitData } = useFetchBenefit(id);
  const { setBenefitMode, setBenefitDefaultAmount, setBenefitApplicableTo } =
    useBenefitEntitlementStore();

  useEffect(() => {
    setBenefitMode(benefitData?.mode);
    setBenefitApplicableTo(benefitData?.applicableTo);
    if (benefitData?.mode == 'CREDIT') {
      setBenefitDefaultAmount(benefitData?.defaultAmount);
    }
  }, [benefitData, setBenefitMode]);

  return (
    <>
      <PageHeader
        title={benefitData?.name ? benefitData?.name : ''}
        size="small"
      ></PageHeader>
      <BenefitEntitlementTable />
    </>
  );
};

export default BenefitEntitlemetPage;
