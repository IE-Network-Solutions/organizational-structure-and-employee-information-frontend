'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import React from 'react';
import ApprovalTable from './_component/approvalTable';
import AllRequest from './_component/allRequest';
import MyRequest from './_component/myRequest';
import RequestDetail from './_component/requestDetail';

const page = () => {
  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <BlockWrapper className="mt-[30px]">
        <ApprovalTable />
      </BlockWrapper>
      <BlockWrapper className="mt-[30px]">
        <MyRequest />
      </BlockWrapper>
      <BlockWrapper className="mt-[30px]">
        <AllRequest />
      </BlockWrapper>
      <RequestDetail />
    </div>
  );
};

export default page;
