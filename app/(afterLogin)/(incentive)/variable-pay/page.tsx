'use client';
import React from 'react';
import VariablePayTable from '../../(compensation)/benefit/variablePay/_components/variablePayTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';

const VariablePayPage = () => {
  return (
    <div className="h-auto w-auto px-6 py-6">
      <PageHeader title="Variable Pay" description="Employee variable pay" />
      <VariablePayTable />
    </div>
  );
};

export default VariablePayPage;
