'use client';
import React from 'react';
import VariablePayTable from '../../(compensation)/benefit/variablePay/_components/variablePayTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';

const VariablePayPage = () => {
  return (
    <div
      id="variable-pay-page-container"
      data-cy="variable-pay-page-container"
      className="h-auto w-auto px-6 py-6"
    >
      <PageHeader
        data-cy="variable-pay-page-header"
        title="Variable Pay"
        description="Employee variable pay"
      />
      <VariablePayTable data-cy="variable-pay-table" />
    </div>
  );
};

export default VariablePayPage;
