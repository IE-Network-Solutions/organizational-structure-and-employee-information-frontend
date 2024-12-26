'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import DynamicAllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';

const singleAllowancePage = () => {
  const {id} = useParams();
  const { data: benefitData } = useFetchBenefit(id);

  return (
    <>
      <PageHeader title={benefitData?.name ? benefitData?.name : ''} size="small">
      </PageHeader>
      <DynamicAllowanceEntitlementTable />
    </>
  );
};

export default singleAllowancePage;