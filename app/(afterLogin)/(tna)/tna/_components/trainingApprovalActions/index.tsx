'use client';
import React, { FC, useState } from 'react';
import { Button, Input, Popconfirm, Space } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetTrainingApprovalsAllStatus } from '@/store/server/features/tna/trainingApproval/queries';
import {
  useSetTrainingRequestApprovalLog,
  useSetTrainingRequestFinalStatus,
} from '@/store/server/features/tna/trainingApproval/mutation';

interface TrainingApprovalActionsProps {
  requestId: string;
  size?: 'small' | 'middle' | 'large';
  onDone?: () => void;
}

/**
 * Approve / Reject for one external training request, shown only while the
 * signed-in user is the step the workflow is currently sitting on.
 *
 * The request endpoints do not carry workflow state, so the approver feed is
 * read to find this request's current step. Every instance shares one react-
 * query cache entry, so rendering it per table row costs a single request.
 *
 * Decisions go to the shared approver service; only when it reports the step
 * was the last one is the final status pushed back to the training service —
 * the same handshake time-and-attendance uses for leave.
 */
const TrainingApprovalActions: FC<TrainingApprovalActionsProps> = ({
  requestId,
  size = 'small',
  onDone,
}) => {
  const { userId, userData, tenantId } = useAuthenticationStore();
  const approverRoleId = userData?.roleId;
  const [rejectComment, setRejectComment] = useState('');
  // One mutation drives both buttons, so the action in flight has to be
  // tracked separately or clicking Approve also spins Reject.
  const [pendingAction, setPendingAction] = useState<
    'Approved' | 'Rejected' | null
  >(null);

  // Same arguments the management list uses, so both share one cache entry.
  const { data, refetch } = useGetTrainingApprovalsAllStatus(
    userId ?? '',
    1,
    200,
  );

  const { mutate: logDecision, isLoading: isLogging } =
    useSetTrainingRequestApprovalLog();
  const { mutate: setFinalStatus } = useSetTrainingRequestFinalStatus();

  const payload = data?.data ?? data;
  const items = payload?.items ?? data?.items ?? [];
  const entry = items.find((item: any) => item?.id === requestId);
  const step = entry?.nextApprover?.[0];

  const finish = () => {
    refetch();
    onDone?.();
  };

  const buildPayload = (action: 'Approved' | 'Rejected') => ({
    approvalWorkflowId: entry?.approvalWorkflowId,
    // The current step lives under `nextApprover`, not at the top level —
    // sending `entry.stepOrder` posts undefined and the log is rejected.
    stepOrder: step?.stepOrder ?? entry?.stepOrder,
    requestId,
    approvedUserId: userId ?? '',
    approverRoleId,
    action,
    tenantId: tenantId ?? '',
  });

  const onApprove = () => {
    setPendingAction('Approved');
    logDecision(buildPayload('Approved'), {
      onSuccess: (response: any) => {
        // Earlier steps only advance the workflow; the last one settles it.
        if (response?.last === true) {
          setFinalStatus(
            { requestId, status: 'approved' },
            { onSuccess: finish },
          );
        } else {
          finish();
        }
      },
      onSettled: () => setPendingAction(null),
    });
  };

  const onReject = () => {
    const comment = rejectComment.trim();

    setPendingAction('Rejected');
    logDecision(
      {
        ...buildPayload('Rejected'),
        ...(comment
          ? {
              comment: {
                comment,
                commentedBy: userId ?? '',
                tenantId: tenantId ?? '',
              },
            }
          : {}),
      },
      {
        onSuccess: () => {
          setRejectComment('');
          // A rejection ends the workflow wherever it happens.
          setFinalStatus(
            { requestId, status: 'declined' },
            { onSuccess: finish },
          );
        },
        onSettled: () => setPendingAction(null),
      },
    );
  };

  // Not this user's turn (or already decided) — render nothing.
  if (!entry || step?.userId !== userId) {
    return null;
  }

  return (
    <Space data-cy={`tna-approval-actions-${requestId}`}>
      <Popconfirm
        title="Approve Request"
        description="Are you sure to approve this training request?"
        onConfirm={onApprove}
        okText="Approve"
        cancelText="Cancel"
        data-cy={`tna-approval-actions-approve-popconfirm-${requestId}`}
      >
        <Button
          type="primary"
          size={size}
          loading={isLogging && pendingAction === 'Approved'}
          disabled={isLogging && pendingAction === 'Rejected'}
          data-cy={`tna-approval-actions-approve-${requestId}`}
        >
          Approve
        </Button>
      </Popconfirm>

      <Popconfirm
        title="Reject Request"
        description={
          <Input
            placeholder="Add a comment"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            style={{ marginTop: 8 }}
            data-cy={`tna-approval-actions-reject-comment-${requestId}`}
          />
        }
        onConfirm={onReject}
        okText="Reject"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        data-cy={`tna-approval-actions-reject-popconfirm-${requestId}`}
      >
        <Button
          danger
          size={size}
          loading={isLogging && pendingAction === 'Rejected'}
          disabled={isLogging && pendingAction === 'Approved'}
          data-cy={`tna-approval-actions-reject-${requestId}`}
        >
          Reject
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default TrainingApprovalActions;
