'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Button, Input } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { useCommentOnDeadlineTask } from '@/store/server/features/deadlinePlan/mutations';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { PersonOption } from './useDeadlinePeople';
import { TaskActions } from './useTaskActions';

export default function TaskReview({
  task,
  actions,
  getPerson,
}: {
  task: DeadlineTask;
  actions: TaskActions;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}) {
  const permissions = actions.permissionsOf(task);
  const { mutate: saveComment, isLoading } = useCommentOnDeadlineTask();
  const setApprovalRequest = useDeadlinePlanStore(
    (state) => state.setApprovalRequest,
  );
  const [comment, setComment] = useState(task.approvalComment ?? '');
  const [savedComment, setSavedComment] = useState(task.approvalComment ?? '');
  useEffect(() => {
    setComment(task.approvalComment ?? '');
    setSavedComment(task.approvalComment ?? '');
  }, [task.id, task.approvalComment]);
  const dirty = comment.trim() !== savedComment.trim();
  const submit = () => {
    if (!permissions.canComment || isLoading || !comment.trim() || !dirty)
      return;
    saveComment(
      { id: task.id, comment: comment.trim() },
      {
        onSuccess: (saved) => {
          setComment(saved.approvalComment ?? '');
          setSavedComment(saved.approvalComment ?? '');
        },
      },
    );
  };

  if (
    !permissions.canComment &&
    !task.approvalComment &&
    !permissions.canUndoReport
  )
    return null;
  return (
    <section
      className="mt-6 rounded-xl bg-slate-50/70 p-4"
      aria-label="Manager review"
      data-cy="deadline-task-review"
    >
      <h3
        className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#161A2C]"
        data-cy="deadline-task-review-title"
      >
        <CommentOutlined className="text-okr-primary" /> Manager feedback
      </h3>
      {task.approvalComment ? (
        <div className="mb-3" data-cy="deadline-detail-manager-comment">
          <p
            className="text-[11px] text-slate-500"
            data-cy="deadline-detail-manager-comment-metadata"
          >
            {getPerson(task.commentedById ?? task.approvedById)?.name ??
              'Direct manager'}
            {(task.commentedAt ?? task.approvedAt)
              ? ` · ${dayjs(task.commentedAt ?? task.approvedAt).format('MMM D, YYYY · h:mm A')}`
              : ''}
          </p>
          <p
            className="mt-2 whitespace-pre-wrap break-words text-sm text-[#161A2C]"
            data-cy="deadline-detail-manager-comment-text"
          >
            {task.approvalComment}
          </p>
        </div>
      ) : null}
      {permissions.canComment ? (
        <>
          <label
            data-cy="deadline-task-review-comment-label"
            htmlFor={`deadline-review-comment-${task.id}`}
            className="mb-2 block text-xs font-medium text-slate-500"
          >
            Comment before approval
          </label>
          <Input.TextArea
            id={`deadline-review-comment-${task.id}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share corrections or feedback with the assignee..."
            autoSize={{ minRows: 3, maxRows: 8 }}
            maxLength={2000}
            showCount
            bordered={false}
            disabled={isLoading}
            className="!rounded-lg !bg-white !text-sm focus-within:!ring-2 focus-within:!ring-okr-primary/30"
          />
          <p
            className="mt-2 text-xs text-slate-500"
            data-cy="deadline-task-review-comment-help"
          >
            Save feedback without approving. The assignee can undo their report,
            make corrections, and report again.
          </p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            data-cy="deadline-task-review-actions"
          >
            <Button
              onClick={submit}
              loading={isLoading}
              disabled={!comment.trim() || !dirty}
            >
              Save comment
            </Button>
            {permissions.canApprove ? (
              <Button
                type="primary"
                disabled={isLoading || dirty}
                onClick={() =>
                  setApprovalRequest({ taskIds: [task.id], title: task.title })
                }
              >
                Approve report
              </Button>
            ) : null}
          </div>
          {dirty && permissions.canApprove ? (
            <p
              className="mt-2 text-xs text-slate-500"
              data-cy="deadline-task-review-unsaved-comment"
            >
              Save your comment before approving this report.
            </p>
          ) : null}
        </>
      ) : permissions.canUndoReport && task.approvalStatus !== 'closed' ? (
        <Button
          onClick={() => actions.undoReport(task)}
          loading={actions.isToggling}
        >
          Undo report to make changes
        </Button>
      ) : null}
    </section>
  );
}
