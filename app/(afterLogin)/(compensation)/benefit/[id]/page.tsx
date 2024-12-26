'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BenefitEntitlementTable from './_components/benefitEntitelmentTable';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';

const BenefitEntitlemetPage = () => {
  const { id } = useParams();
  const { data: benefitData } = useFetchBenefit(id);

  return (
    <>
      <PageHeader title={benefitData?.name ? benefitData?.name : ''} size="small">
      </PageHeader>
      <BenefitEntitlementTable />
    </>
  );
};

export default BenefitEntitlemetPage;