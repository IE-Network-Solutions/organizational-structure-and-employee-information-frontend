'use client';
import React, { FC, useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useSetManagerDecision } from '@/store/server/features/tna/externalTraining/mutation';
import { ExternalTrainingRequest } from '@/types/tna/externalTna';

interface ManagerDecisionModalProps {
  open: boolean;
  request: ExternalTrainingRequest | null;
  onClose: () => void;
}

/** Step 1 of the workflow — the employee's direct manager. */
const ManagerDecisionModal: FC<ManagerDecisionModalProps> = ({
  open,
  request,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();
  const { mutate: submitDecision, isLoading } = useSetManagerDecision();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const decide = (decision: 'approve' | 'reject') => {
    if (!request?.id) return;

    const remark = form.getFieldValue('remark')?.trim();

    if (decision === 'reject' && !remark) {
      form.setFields([
        { name: 'remark', errors: ['A reason is required to reject.'] },
      ]);
      return;
    }

    submitDecision(
      {
        id: request.id,
        decision,
        remark: remark || undefined,
        actedBy: userId ?? undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={520}
      footer={null}
      title={
        <span
          data-cy="tna-manager-decision-modal-title"
          className="font-[Calibri,sans-serif] text-[16px] font-bold leading-6 text-black/70"
        >
          Manager Review
        </span>
      }
      data-cy="tna-manager-decision-modal"
    >
      <div className="flex flex-col gap-3" data-cy="tna-manager-decision-body">
        <div
          className="rounded-[6px] bg-black/[0.02] px-3 py-2"
          data-cy="tna-manager-decision-summary"
        >
          <div
            data-cy="tna-manager-decision-course"
            className="text-sm font-bold leading-[22px] text-black"
          >
            {request?.courseName}
          </div>
          <div
            data-cy="tna-manager-decision-meta"
            className="text-xs leading-5 text-black/45"
          >
            {request?.trainingProvider || 'External training'} ·{' '}
            {Number(request?.cost ?? 0).toLocaleString()}
          </div>
          {request?.businessJustification ? (
            <div
              data-cy="tna-manager-decision-justification"
              className="mt-2 text-xs leading-5 text-black/70"
            >
              {request.businessJustification}
            </div>
          ) : null}
        </div>

        <Form layout="vertical" form={form} data-cy="tna-manager-decision-form">
          <Form.Item
            name="remark"
            label={
              <span
                data-cy="tna-manager-decision-remark-label"
                className="text-[14px] font-normal"
              >
                Remark
              </span>
            }
            className="form-item !mb-0"
            data-cy="tna-manager-decision-remark-item"
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional when approving, required when rejecting"
              data-cy="tna-manager-decision-remark"
            />
          </Form.Item>
        </Form>

        <div
          className="flex items-center justify-end gap-2 pt-1"
          data-cy="tna-manager-decision-actions"
        >
          <Button
            className="h-8 min-h-8 rounded-md border-[#D9D9D9] px-[15px] !text-sm !font-normal text-black/70"
            onClick={onClose}
            data-cy="tna-manager-decision-cancel"
          >
            Cancel
          </Button>
          <Button
            danger
            className="h-8 min-h-8 rounded-md px-[15px] !text-sm !font-normal"
            loading={isLoading}
            onClick={() => decide('reject')}
            data-cy="tna-manager-decision-reject"
          >
            Reject
          </Button>
          <Button
            type="primary"
            className="h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal text-white"
            loading={isLoading}
            onClick={() => decide('approve')}
            data-cy="tna-manager-decision-approve"
          >
            Approve &amp; forward
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManagerDecisionModal;
