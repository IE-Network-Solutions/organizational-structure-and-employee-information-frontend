'use client';

import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import { useGetPendingGrowthPlanApprovals } from '@/store/server/features/tna/growthPlan/queries';
import {
  useApproveGrowthPlan,
  useRejectGrowthPlanGoal,
  useSignOffGrowthPlanGoal,
} from '@/store/server/features/tna/growthPlan/mutations';
import { GrowthPlan, GrowthPlanGoal } from '@/types/tna/growthPlan';
import EmptyState from '@/components/empty';
import ProposeEditModal from './proposeEditModal';

/**
 * Manager inbox for direct-report growth plans.
 * Pattern found: TrainingApprovalActions + PlanCard status badges.
 */
const ManagerApprovalsPanel = () => {
  const { data: plans, isLoading } = useGetPendingGrowthPlanApprovals();
  const { mutate: approvePlan, isLoading: approving } = useApproveGrowthPlan();
  const { mutate: rejectGoal, isLoading: rejecting } =
    useRejectGrowthPlanGoal();
  const { mutate: signOff, isLoading: signing } = useSignOffGrowthPlanGoal();

  const [rejectTarget, setRejectTarget] = useState<{
    plan: GrowthPlan;
    goal: GrowthPlanGoal;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<{
    plan: GrowthPlan;
    goal: GrowthPlanGoal;
  } | null>(null);
  const [rejectForm] = Form.useForm();

  const list = plans ?? [];

  if (!isLoading && !list.length) {
    return (
      <EmptyState
        compact
        title="No pending approvals"
        description="Growth plans from your direct reports will appear here."
        data-cy="pgp-approvals-empty"
      />
    );
  }

  const onConfirmReject = async () => {
    if (!rejectTarget) return;
    const values = await rejectForm.validateFields().catch(() => null);
    if (!values) return;
    rejectGoal(
      {
        planId: rejectTarget.plan.id,
        goalId: rejectTarget.goal.id,
        feedback: values.feedback,
        revisionDeadline: values.revisionDeadline.format('YYYY-MM-DD'),
      },
      {
        onSuccess: () => {
          setRejectTarget(null);
          rejectForm.resetFields();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3" data-cy="pgp-approvals-list">
      {list.map((plan) => (
        <div
          key={plan.id}
          className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-none"
          data-cy={`pgp-approval-card-${plan.id}`}
        >
          <div
            data-cy="tna-planning-managerapprovalspanel-index-div-78"
            className="mb-3 flex flex-wrap items-start justify-between gap-2"
          >
            <div data-cy="tna-planning-managerapprovalspanel-index-div-79">
              <div
                data-cy="tna-planning-managerapprovalspanel-index-div-80"
                className="text-sm font-semibold text-gray-900"
              >
                {plan.userName || 'Employee'} · {plan.categoryName}
              </div>
              <p
                data-cy="tna-planning-managerapprovalspanel-index-p-83"
                className="mb-0 mt-1 text-xs text-gray-500"
              >
                {plan.fiscalYearName || 'Fiscal year'}
                {` · ${plan.goals?.length ?? 0} goals`}
              </p>
            </div>
            {(plan.status === 'pending_approval' ||
              plan.status === 'partially_approved') && (
              <Button
                type="primary"
                size="small"
                className="bg-primary"
                loading={approving}
                onClick={() => approvePlan(plan.id)}
                data-cy={`pgp-approval-approve-${plan.id}`}
              >
                Approve plan
              </Button>
            )}
          </div>

          <div
            data-cy="tna-planning-managerapprovalspanel-index-div-103"
            className="flex flex-col gap-2"
          >
            {(plan.goals ?? []).map((goal) => (
              <div
                key={goal.id}
                className="rounded-md border border-[#F0F2F5] bg-[#F9FAFB] p-2"
                data-cy={`pgp-approval-goal-${goal.id}`}
              >
                <div
                  data-cy="tna-planning-managerapprovalspanel-index-div-110"
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div data-cy="tna-planning-managerapprovalspanel-index-div-111">
                    <span
                      data-cy="tna-planning-managerapprovalspanel-index-span-112"
                      className="text-sm font-medium text-gray-900"
                    >
                      {goal.skillName}
                    </span>
                    {goal.isCustom ? <Tag className="ml-2">Custom</Tag> : null}
                    <Tag className="ml-2">{goal.status}</Tag>
                  </div>
                  <div
                    data-cy="tna-planning-managerapprovalspanel-index-div-118"
                    className="flex flex-wrap gap-1"
                  >
                    {goal.status === 'pending' ||
                    goal.status === 'draft' ||
                    plan.status === 'pending_approval' ? (
                      <Button
                        size="small"
                        danger
                        onClick={() => setRejectTarget({ plan, goal })}
                        data-cy={`pgp-approval-reject-${goal.id}`}
                      >
                        Reject
                      </Button>
                    ) : null}
                    {goal.status === 'completion_requested' ? (
                      <Button
                        size="small"
                        type="primary"
                        className="bg-primary"
                        loading={signing}
                        onClick={() =>
                          signOff({ planId: plan.id, goalId: goal.id })
                        }
                        data-cy={`pgp-approval-signoff-${goal.id}`}
                      >
                        Sign off
                      </Button>
                    ) : null}
                    {goal.status === 'approved' && goal.proposedChanges ? (
                      <Button
                        size="small"
                        onClick={() => setEditTarget({ plan, goal })}
                        data-cy={`pgp-approval-review-edit-${goal.id}`}
                      >
                        Review edit
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p
                  data-cy="tna-planning-managerapprovalspanel-index-p-156"
                  className="mb-0 mt-1 text-xs text-gray-600"
                >
                  {goal.measurableOutcome}
                </p>
                {goal.feedback ? (
                  <p
                    data-cy="tna-planning-managerapprovalspanel-index-p-160"
                    className="mb-0 mt-1 text-xs text-red-500"
                  >
                    Feedback: {goal.feedback}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Modal
        title="Reject goal"
        open={!!rejectTarget}
        onCancel={() => {
          setRejectTarget(null);
          rejectForm.resetFields();
        }}
        onOk={onConfirmReject}
        confirmLoading={rejecting}
        okText="Reject"
        okButtonProps={{ danger: true }}
        data-cy="pgp-reject-modal"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="feedback"
            label="Feedback"
            rules={[{ required: true, message: 'Feedback is required' }]}
          >
            <Input.TextArea rows={3} data-cy="pgp-reject-feedback" />
          </Form.Item>
          <Form.Item
            name="revisionDeadline"
            label="Revision deadline"
            rules={[{ required: true, message: 'Deadline is required' }]}
            initialValue={dayjs().add(14, 'day')}
          >
            <DatePicker className="w-full" data-cy="pgp-reject-deadline" />
          </Form.Item>
        </Form>
      </Modal>

      <ProposeEditModal
        open={!!editTarget}
        plan={editTarget?.plan ?? null}
        goal={editTarget?.goal ?? null}
        onClose={() => setEditTarget(null)}
        managerMode
      />
    </div>
  );
};

export default ManagerApprovalsPanel;
