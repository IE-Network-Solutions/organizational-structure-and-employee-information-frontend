'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
  type MockTaskComment,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { mockDisplayNameForUserId } from '../prototype/mockPlanningConstants';

type TaskCommentsModalProps = {
  open: boolean;
  ownerUserId: string;
  task: MockPlanTask | null;
  canComment?: boolean;
  onClose: () => void;
};

type CommentNode = MockTaskComment & { replies: CommentNode[] };

function buildCommentTree(comments: MockTaskComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const node of nodes.values()) {
    const parentId = node.parentCommentId ? String(node.parentCommentId) : '';
    const parent = parentId ? nodes.get(parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortByTime = (list: CommentNode[]) =>
    list.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const sortTree = (list: CommentNode[]) => {
    sortByTime(list);
    list.forEach((node) => sortTree(node.replies));
  };
  sortTree(roots);
  return roots;
}

function CommentThread({
  node,
  depth,
  viewerUserId,
  canComment,
  onReply,
}: {
  node: CommentNode;
  depth: number;
  viewerUserId: string;
  canComment: boolean;
  onReply: (commentId: string) => void;
}) {
  const authorName = mockDisplayNameForUserId(
    String(node.authorUserId),
    viewerUserId,
  );

  return (
    <div
      className={depth > 0 ? 'mt-2 border-l-2 border-[#E5E7EB] pl-3' : ''}
      data-cy={`task-comment-thread-${node.id}`}
    >
      <div
        className="rounded-lg border border-[#F1F2F6] bg-[#FAFBFC] px-3 py-2"
        data-cy={`task-comments-item-${node.id}`}
      >
        <p
          className="m-0 text-[11px] font-semibold text-[#575B7A]"
          data-cy={`task-comment-author-${node.id}`}
        >
          {authorName}
        </p>
        <p
          className="m-0 mt-1 whitespace-pre-wrap text-[13px] text-[#2D2F45]"
          data-cy={`task-comment-text-${node.id}`}
        >
          {node.text}
        </p>
        <div
          className="mt-1 flex items-center gap-3"
          data-cy={`task-comment-meta-${node.id}`}
        >
          <p
            className="mb-0 text-[11px] text-[#8F94A3]"
            data-cy={`task-comment-time-${node.id}`}
          >
            {dayjs(node.createdAt).format('MMM D, YYYY h:mm A')}
          </p>
          {canComment ? (
            <button
              type="button"
              className="text-[11px] font-semibold text-[#574CFF] hover:text-[#4639E8]"
              onClick={() => onReply(node.id)}
              data-cy={`task-comment-reply-${node.id}`}
            >
              Reply
            </button>
          ) : null}
        </div>
      </div>
      {node.replies.map((reply) => (
        <CommentThread
          key={reply.id}
          node={reply}
          depth={depth + 1}
          viewerUserId={viewerUserId}
          canComment={canComment}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export default function TaskCommentsModal({
  open,
  ownerUserId,
  task,
  canComment = true,
  onClose,
}: TaskCommentsModalProps) {
  const { userId } = useAuthenticationStore();
  const addTaskComment = useUserPlanRepositoryMock((s) => s.addTaskComment);
  const activeTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? s.getActiveTasks(ownerUserId) : [],
  );
  const archivedTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? (s.plansByUserId[ownerUserId]?.archivedTasks ?? []) : [],
  );
  const pendingReportTasks = useUserPlanRepositoryMock((s) =>
    ownerUserId ? (s.plansByUserId[ownerUserId]?.pendingReportTasks ?? []) : [],
  );
  const [text, setText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const viewerUserId = String(userId ?? '');

  const liveTask = useMemo(() => {
    if (!task) return null;
    return (
      activeTasks.find((t) => t.id === task.id) ??
      archivedTasks.find((t) => t.id === task.id) ??
      pendingReportTasks.find((t) => t.id === task.id) ??
      task
    );
  }, [activeTasks, archivedTasks, pendingReportTasks, task]);

  useEffect(() => {
    if (open) {
      setText('');
      setReplyToId(null);
    }
  }, [open, task?.id]);

  const commentTree = useMemo(
    () => buildCommentTree(liveTask?.comments ?? []),
    [liveTask?.comments],
  );

  const handleSubmit = () => {
    if (!liveTask || !canComment) return;
    setSaving(true);
    const result = addTaskComment(
      ownerUserId,
      liveTask.id,
      text,
      viewerUserId,
      replyToId,
    );
    setSaving(false);
    if (!result.ok) {
      message.warning(result.error);
      return;
    }
    setText('');
    setReplyToId(null);
    message.success(replyToId ? 'Reply added.' : 'Comment added.');
  };

  return (
    <Modal
      title={
        <div className="pr-6" data-cy="task-comments-modal-title">
          <p
            className="m-0 text-[16px] font-semibold text-[#161A2C]"
            data-cy="task-comments-modal-heading"
          >
            Task comments
          </p>
          <p
            className="m-0 mt-1 truncate text-[12px] font-normal text-[#8F94A3]"
            data-cy="task-comments-modal-subtitle"
          >
            {liveTask?.title ?? ''}
          </p>
        </div>
      }
      open={open && !!liveTask}
      onCancel={onClose}
      destroyOnClose
      centered
      width={520}
      data-cy="task-comments-modal"
      footer={null}
    >
      <div
        className="mb-3 max-h-[min(40vh,16rem)] space-y-2 overflow-y-auto"
        data-cy="task-comments-list"
      >
        {commentTree.length === 0 ? (
          <p
            className="m-0 text-[13px] text-[#8F94A3]"
            data-cy="task-comments-empty"
          >
            No comments yet.
          </p>
        ) : (
          commentTree.map((node) => (
            <CommentThread
              key={node.id}
              node={node}
              depth={0}
              viewerUserId={viewerUserId}
              canComment={canComment}
              onReply={setReplyToId}
            />
          ))
        )}
      </div>
      {canComment ? (
        <div className="flex flex-col gap-2" data-cy="task-comments-compose">
          {replyToId ? (
            <p
              className="m-0 text-[12px] text-[#575B7A]"
              data-cy="task-comments-reply-banner"
            >
              Replying to a comment.{' '}
              <button
                type="button"
                className="font-semibold text-[#574CFF]"
                onClick={() => setReplyToId(null)}
                data-cy="task-comments-cancel-reply"
              >
                Cancel reply
              </button>
            </p>
          ) : null}
          <Input.TextArea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyToId ? 'Write a reply…' : 'Write a comment…'}
            data-cy="task-comments-input"
          />
          <div
            className="flex justify-end gap-2"
            data-cy="task-comments-actions"
          >
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              loading={saving}
              onClick={handleSubmit}
              data-cy="task-comments-submit"
              className="!border-[#574CFF] !bg-[#574CFF] hover:!bg-[#4639E8]"
            >
              {replyToId ? 'Post reply' : 'Post'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="flex justify-end"
          data-cy="task-comments-readonly-footer"
        >
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </Modal>
  );
}
