'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import VariablePayTable from './_components/variablePayTable';

const VariablePayPage = () => {
  return (
    <>
      <PageHeader title="Variable Pay" size="small"></PageHeader>
      <VariablePayTable />
    </>
  );
};

export default VariablePayPage;
