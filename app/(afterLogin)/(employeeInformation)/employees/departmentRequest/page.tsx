'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import React from 'react';
import ApprovalTable from './_component/approvalTable';
import AllRequest from './_component/allRequest';
import MyRequest from './_component/myRequest';
import RequestDetail from './_component/requestDetail';

const page = () => {
  return (
    <div
      className="h-auto w-auto pr-6 pb-6 pl-3"
      id="department-request-page"
      data-cy="department-request-page"
    >
      <BlockWrapper className="mt-[30px]" data-cy='department-request-approval-block-wrapper'>
        <ApprovalTable data-cy="department-request-approval-table" />
      </BlockWrapper>
      <BlockWrapper className="mt-[30px]" data-cy='department-request-my-block-wrapper'>
        <MyRequest data-cy="department-request-my-table" />
      </BlockWrapper>
      <BlockWrapper className="mt-[30px]" data-cy='department-request-all-block-wrapper'>
        <AllRequest data-cy="department-request-all-table" />
      </BlockWrapper>
      <RequestDetail data-cy="department-request-detail" />
    </div>
  );
};

export default page;
