'use client';

import React, { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import CustomButton from '@/components/common/buttons/customButton';

const { TextArea } = Input;

export type KpiRejectModalMode = 'default' | 'pep-reject' | 'pep-unrealistic';

type Props = {
  open: boolean;
  kpiName?: string;
  loading?: boolean;
  mode?: KpiRejectModalMode;
  onClose: () => void;
  onConfirm: (comment: string) => void;
};

const COPY: Record<
  KpiRejectModalMode,
  { title: string; body: (name?: string) => string; placeholder: string; confirm: string }
> = {
  default: {
    title: 'Reject & return KPI result',
    body: (name) =>
      name
        ? `Reject the reported result for ${name}. The employee will need to resubmit.`
        : 'Reject this reported KPI result. The employee will need to resubmit.',
    placeholder: 'Explain why this result is being returned',
    confirm: 'Reject & return',
  },
  'pep-reject': {
    title: 'Reject KPI result',
    body: (name) =>
      name
        ? `Reject ${name} and reset progress to zero. The employee must re-report from scratch.`
        : 'Reject this KPI and reset progress to zero. The employee must re-report from scratch.',
    placeholder: 'Explain why this result is being rejected',
    confirm: 'Reject & reset',
  },
  'pep-unrealistic': {
    title: 'Return as unrealistic',
    body: (name) =>
      name
        ? `Return ${name} to the manager for revision. Your comment will appear on their Check-in queue.`
        : 'Return this KPI to the manager for revision. Your comment will appear on their Check-in queue.',
    placeholder: 'Explain why this result is unrealistic',
    confirm: 'Return to manager',
  },
};

export default function KpiRejectModal({
  open,
  kpiName,
  loading,
  mode = 'default',
  onClose,
  onConfirm,
}: Props) {
  const [comment, setComment] = useState('');
  const copy = COPY[mode];

  useEffect(() => {
    if (!open) setComment('');
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      title={copy.title}
      data-cy="bsc-kpi-reject-modal"
    >
      <p className="mb-3 text-sm text-gray-600">{copy.body(kpiName)}</p>
      <TextArea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={copy.placeholder}
        data-cy="bsc-kpi-reject-comment"
      />
      <div className="mt-4 flex justify-end gap-2">
        <CustomButton
          type="default"
          onClick={onClose}
          title="Cancel"
          className="h-10 px-6 rounded-lg bg-white"
          textClassName="text-sm font-medium"
          data-cy="bsc-kpi-reject-cancel"
        />
        <CustomButton
          type="primary"
          title={copy.confirm}
          loading={loading}
          disabled={!comment.trim()}
          onClick={() => onConfirm(comment.trim())}
          data-cy="bsc-kpi-reject-confirm"
        />
      </div>
    </Modal>
  );
}
