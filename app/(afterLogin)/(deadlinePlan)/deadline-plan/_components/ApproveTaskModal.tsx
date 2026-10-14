'use client';
import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { useApproveDeadlineTasks } from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';

export default function ApproveTaskModal() {
  const request = useDeadlinePlanStore((state) => state.approvalRequest);
  const setApprovalRequest = useDeadlinePlanStore(
    (state) => state.setApprovalRequest,
  );
  const { mutate: approveTasks, isLoading } = useApproveDeadlineTasks();
  const [comment, setComment] = useState('');
  useEffect(() => {
    setComment('');
  }, [request]);

  const close = () => setApprovalRequest(null);
  const isBulk = (request?.taskIds.length ?? 0) > 1;
  const submit = () => {
    if (!request || isLoading) return;
    approveTasks(
      { taskIds: request.taskIds, comment: comment.trim() || undefined },
      { onSuccess: close },
    );
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
          <div>
            <label
              htmlFor="deadline-approval-comment"
              className="mb-2 block text-xs font-semibold text-slate-500"
            >
              Manager comment{' '}
              <span className="font-normal text-[#8F94A3]">(optional)</span>
            </label>
            <Input.TextArea
              id="deadline-approval-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share feedback on this report..."
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={2000}
              showCount
              bordered={false}
              disabled={isLoading}
              className="!rounded-xl !bg-slate-50 !text-sm focus-within:!ring-2 focus-within:!ring-okr-primary/30"
              data-cy="deadline-approval-comment"
            />
          </div>
          <p
            className="text-xs text-[#8F94A3]"
            data-cy="deadline-approval-comment-hint"
          >
            {isBulk
              ? 'This comment will be saved on each approved task report and visible to the assignee.'
              : 'Your comment will be saved with the approval and visible to the assignee.'}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
