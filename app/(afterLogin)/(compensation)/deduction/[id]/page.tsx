'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import DeductionEntitlementTable from './_components/deductionEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';

const SingleDeductionPage = () => {
  const { id } = useParams();
  const { data: deductionData } = useFetchAllowance(id);
  const { setIsAllowanceGlobal } = useAllowanceEntitlementStore();

  useEffect(() => {
    if (deductionData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [deductionData, setIsAllowanceGlobal]);

  return (
    <>
      <PageHeader
        title={deductionData?.name ? deductionData?.name : ''}
        size="small"
      ></PageHeader>
      <DeductionEntitlementTable />
    </>
  );
};

export default SingleDeductionPage;
