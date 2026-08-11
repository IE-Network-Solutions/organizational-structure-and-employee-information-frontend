'use client';
import React, { useCallback } from 'react';
import ApprovalFilter from './_component/approvalFilter';
import ApprovalListTable from './_component/approvalListTable';
import { useApprovalStore } from '@/store/uistate/features/approval';
import ApprovalWorkFlowModal from './workFlow';

const Workflow = () => {
  const { openModal, setOpenModal } = useApprovalStore();
  const onCancelApprovalModal = useCallback(
    () => setOpenModal(false),
    [setOpenModal],
  );
  return (
    <div
      id="tna-settings-approvals-page-container"
      data-cy="tna-settings-approvals-page-container"
    >
      <div
        className=" p-3 rounded-2xl border-[1px] border-[#D9D9D9] "
        id="tna-settings-approvals-container"
        data-cy="tna-settings-approvals-container"
      >
        <ApprovalFilter data-cy="tna-settings-approvals-filter" />
        <div
          className="overflow-x-auto w-full mt-2"
          id="tna-settings-approvals-table-container"
          data-cy="tna-settings-approvals-table-container"
        >
          <ApprovalListTable data-cy="tna-settings-approvals-table" />
        </div>
        <ApprovalWorkFlowModal
          openApprovalModal={openModal}
          onCancelApprovalModal={onCancelApprovalModal}
        />
      </div>
    </div>
  );
};

export default Workflow;
