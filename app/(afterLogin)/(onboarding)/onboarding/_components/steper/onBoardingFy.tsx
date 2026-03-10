'use client';

import { FormInstance } from 'antd';
import FiscalYearWizard from '@/app/(afterLogin)/_components/fiscalYearWizard';

export default function FiscalYearForm({
  form,
  onNext,
  isLoading = false,
}: {
  form: FormInstance;
  onNext: () => void;
  isLoading?: boolean;
}) {
  return (
    <FiscalYearWizard form={form} onFinish={onNext} isLoading={isLoading} />
  );
}
