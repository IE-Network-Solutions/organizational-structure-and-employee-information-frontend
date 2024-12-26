'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import DynamicAllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';

const singleAllowancePage = () => {
  const { id } = useParams();
  const { data: allowanceData } = useFetchAllowance(id);

  return (
    <>
      <PageHeader title={allowanceData?.name ? allowanceData?.name : ''} size="small">
      </PageHeader>
      <DynamicAllowanceEntitlementTable />
    </>
  );
};

export default singleAllowancePage;