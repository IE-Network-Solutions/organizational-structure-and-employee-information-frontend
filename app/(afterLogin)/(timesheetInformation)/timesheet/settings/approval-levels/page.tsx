'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import ApprovalLevelsCard from './_components/approvalLevelsCard';

const Page = () => {
  return (
    <>
      <PageHeader title="Request Approval Levels" size="small" />

      <div className="mt-6">
        <ApprovalLevelsCard />
        <ApprovalLevelsCard />
        <ApprovalLevelsCard />
      </div>
    </>
  );
};

export default Page;
