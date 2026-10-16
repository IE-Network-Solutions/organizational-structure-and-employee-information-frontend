'use client';
import React from 'react';
import { Modal } from 'antd';
import { useApproveDeadlineTasks } from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';

export default function ApproveTaskModal() {
  const request = useDeadlinePlanStore((state) => state.approvalRequest);
  const setApprovalRequest = useDeadlinePlanStore(
    (state) => state.setApprovalRequest,
  );
  const { mutate: approveTasks, isLoading } = useApproveDeadlineTasks();

  const close = () => setApprovalRequest(null);
  const isBulk = (request?.taskIds.length ?? 0) > 1;
  const submit = () => {
    if (!request || isLoading) return;
    approveTasks({ taskIds: request.taskIds }, { onSuccess: close });
  };

  return (
    <Modal
      open={!!request}
      title={isBulk ? 'Approve reports' : 'Approve report'}
      okText={isBulk ? 'Approve reports' : 'Approve report'}
      onOk={submit}
      onCancel={close}
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={!isLoading}
      keyboard={!isLoading}
      width={520}
      destroyOnClose
      data-cy="deadline-approval-modal"
    >
      {request ? (
        <div
          className="flex flex-col gap-4 pt-2"
          data-cy="deadline-approval-form"
        >
          <p
            className="text-sm font-medium text-[#161A2C]"
            data-cy="deadline-approval-context"
          >
            {request.title}
          </p>
          <p
            className="text-xs text-[#8F94A3]"
            data-cy="deadline-approval-comment-hint"
          >
            {isBulk
              ? 'Approve these reports after reviewing them. Save any feedback in each task’s report before approving.'
              : 'Approve this report after the assignee has addressed your feedback. Saved comments remain visible in Task details.'}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
