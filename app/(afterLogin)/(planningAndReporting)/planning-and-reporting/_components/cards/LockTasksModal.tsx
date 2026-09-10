'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal } from 'antd';

type LockTasksModalProps = {
  open: boolean;
  taskCount: number;
  taskTitles?: string[];
  onClose: () => void;
  onConfirm: (comment: string) => void;
  confirming?: boolean;
};

export default function LockTasksModal({
  open,
  taskCount,
  taskTitles = [],
  onClose,
  onConfirm,
  confirming = false,
}: LockTasksModalProps) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) setComment('');
  }, [open]);

  const title = taskCount <= 1 ? 'Lock task' : `Lock ${taskCount} tasks`;

  return (
    <Modal
      title={
        <div
          data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-div-34"
          className="pr-6"
        >
          <p
            data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-p-35"
            className="m-0 text-[16px] font-semibold text-[#161A2C]"
          >
            {title}
          </p>
          <p
            data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-p-38"
            className="m-0 mt-1 text-[12px] font-normal text-[#8F94A3]"
          >
            Locked tasks cannot be edited by the owner. Children are not locked.
          </p>
        </div>
      }
      open={open}
      onCancel={onClose}
      destroyOnClose
      centered
      width={480}
      data-cy="lock-tasks-modal"
      footer={
        <div
          data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-div-50"
          className="flex justify-end gap-2"
        >
          <Button onClick={onClose} disabled={confirming}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={confirming}
            onClick={() => onConfirm(comment)}
            data-cy="lock-tasks-confirm"
            className="!border-[#574CFF] !bg-[#574CFF] hover:!bg-[#4639E8]"
          >
            Lock
          </Button>
        </div>
      }
    >
      {taskTitles.length > 0 ? (
        <ul
          className="mb-3 max-h-28 space-y-1 overflow-y-auto rounded-lg border border-[#F1F2F6] bg-[#FAFBFC] p-2"
          data-cy="lock-tasks-titles"
        >
          {taskTitles.slice(0, 8).map((t) => (
            <li
              data-cy="lock-tasks-title-item"
              key={t}
              className="truncate px-1.5 py-1 text-[13px] text-[#2D2F45]"
            >
              {t}
            </li>
          ))}
          {taskTitles.length > 8 ? (
            <li
              data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-li-80"
              className="px-1.5 py-1 text-[12px] text-[#8F94A3]"
            >
              +{taskTitles.length - 8} more
            </li>
          ) : null}
        </ul>
      ) : null}
      <label
        data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-label-86"
        className="block"
      >
        <span
          data-cy="planning-and-reporting-components-cards-locktasksmodal-tsx-locktasksmodal-span-87"
          className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#8F94A3]"
        >
          Comment (optional)
        </span>
        <Input.TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note for the owner…"
          data-cy="lock-tasks-comment"
        />
      </label>
    </Modal>
  );
}
