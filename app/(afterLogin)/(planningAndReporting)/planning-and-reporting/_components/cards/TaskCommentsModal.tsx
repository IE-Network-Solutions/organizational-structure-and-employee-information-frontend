'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

type TaskCommentsModalProps = {
  open: boolean;
  ownerUserId: string;
  task: MockPlanTask | null;
  onClose: () => void;
};

export default function TaskCommentsModal({
  open,
  ownerUserId,
  task,
  onClose,
}: TaskCommentsModalProps) {
  const { userId } = useAuthenticationStore();
  const addTaskComment = useUserPlanRepositoryMock((s) => s.addTaskComment);
  const activeTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? s.getActiveTasks(ownerUserId) : [],
  );
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const liveTask = useMemo(() => {
    if (!task) return null;
    return activeTasks.find((t) => t.id === task.id) ?? task;
  }, [activeTasks, task]);

  useEffect(() => {
    if (open) setText('');
  }, [open, task?.id]);

  const handleSubmit = () => {
    if (!liveTask) return;
    setSaving(true);
    const result = addTaskComment(
      ownerUserId,
      liveTask.id,
      text,
      String(userId ?? 'unknown'),
    );
    setSaving(false);
    if (!result.ok) {
      message.warning(result.error);
      return;
    }
    setText('');
    message.success('Comment added.');
  };

  const comments = liveTask?.comments ?? [];

  return (
    <Modal
      title={
        <div
          data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-div-65"
          className="pr-6"
        >
          <p
            data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-p-66"
            className="m-0 text-[16px] font-semibold text-[#161A2C]"
          >
            Task comments
          </p>
          <p
            data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-p-69"
            className="m-0 mt-1 truncate text-[12px] font-normal text-[#8F94A3]"
          >
            {liveTask?.title ?? ''}
          </p>
        </div>
      }
      open={open && !!liveTask}
      onCancel={onClose}
      destroyOnClose
      centered
      width={480}
      data-cy="task-comments-modal"
      footer={null}
    >
      <div
        className="mb-3 max-h-[min(40vh,16rem)] space-y-2 overflow-y-auto"
        data-cy="task-comments-list"
      >
        {comments.length === 0 ? (
          <p
            data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-p-87"
            className="m-0 text-[13px] text-[#8F94A3]"
          >
            No comments yet.
          </p>
        ) : (
          comments.map((c) => (
            <div
              data-cy={`task-comments-item-${c.id}`}
              key={c.id}
              className="rounded-lg border border-[#F1F2F6] bg-[#FAFBFC] px-3 py-2"
            >
              <p
                data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-p-94"
                className="m-0 whitespace-pre-wrap text-[13px] text-[#2D2F45]"
              >
                {c.text}
              </p>
              <p
                data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-p-97"
                className="mb-0 mt-1 text-[11px] text-[#8F94A3]"
              >
                {dayjs(c.createdAt).format('MMM D, YYYY h:mm A')}
              </p>
            </div>
          ))
        )}
      </div>
      <div
        data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-div-104"
        className="flex flex-col gap-2"
      >
        <Input.TextArea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          data-cy="task-comments-input"
        />
        <div
          data-cy="planning-and-reporting-components-cards-taskcommentsmodal-tsx-taskcommentsmodal-div-112"
          className="flex justify-end gap-2"
        >
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            loading={saving}
            onClick={handleSubmit}
            data-cy="task-comments-submit"
            className="!border-[#574CFF] !bg-[#574CFF] hover:!bg-[#4639E8]"
          >
            Post
          </Button>
        </div>
      </div>
    </Modal>
  );
}
