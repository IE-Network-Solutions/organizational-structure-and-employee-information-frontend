'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import PayrollReconcilation from '../../reconcilation/page';

const PayrollPeriodReconciliationPage = () => {
  const params = useParams();
  const payPeriodId = String(params?.payPeriodId || '');
  const { data: payPeriodData } = useGetPayPeriod();
  const { setCurrentPayPeriodId, setPreviousPayPeriodId } =
    useReconciliationState();

  useEffect(() => {
    if (!payPeriodId) return;
    setCurrentPayPeriodId(payPeriodId);

    const periods = Array.isArray(payPeriodData) ? [...payPeriodData] : [];
    const currentIndex = periods.findIndex(
      (period) => period.id === payPeriodId,
    );
    const previous = periods[currentIndex + 1] || periods[currentIndex - 1];
    if (previous?.id) {
      setPreviousPayPeriodId(previous.id);
    }
  }, [
    payPeriodId,
    payPeriodData,
    setCurrentPayPeriodId,
    setPreviousPayPeriodId,
  ]);

  return <PayrollReconcilation />;
};

export default PayrollPeriodReconciliationPage;
