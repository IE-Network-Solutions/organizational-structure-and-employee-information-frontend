'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import DynamicAllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation';

const singleAllowancePage = () => {

  const { id } = useParams();
  const { data: allowanceData } = useFetchAllowance(id);
  const { setIsAllowanceGlobal } = useAllowanceEntitlementStore();
  
  useEffect(() => {
    if (allowanceData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [allowanceData, setIsAllowanceGlobal]);

  return (
    <>
      <PageHeader title={allowanceData?.name ? allowanceData?.name : ''} size="small">
      </PageHeader>
      <DynamicAllowanceEntitlementTable />
    </>
  );
};

export default singleAllowancePage;