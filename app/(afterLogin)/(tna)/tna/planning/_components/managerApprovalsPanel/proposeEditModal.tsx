'use client';

import React, { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { GrowthPlan, GrowthPlanGoal } from '@/types/tna/growthPlan';
import {
  useApproveGrowthPlan,
  useProposeGoalEdit,
} from '@/store/server/features/tna/growthPlan/mutations';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';

interface ProposeEditModalProps {
  open: boolean;
  plan: GrowthPlan | null;
  goal: GrowthPlanGoal | null;
  onClose: () => void;
  /** When true, manager re-approves proposed changes via plan approve. */
  managerMode?: boolean;
}

const ProposeEditModal = ({
  open,
  plan,
  goal,
  onClose,
  managerMode = false,
}: ProposeEditModalProps) => {
  const [form] = Form.useForm();
  const { data: activeFy } = useGetActiveFiscalYears();
  const { mutate: proposeEdit, isLoading: proposing } = useProposeGoalEdit();
  const { mutate: approvePlan, isLoading: approving } = useApproveGrowthPlan();

  const quarters = (activeFy?.sessions ?? []).map((s, idx) => ({
    id: s.id,
    label: s.name || `Q${idx + 1}`,
  }));

  useEffect(() => {
    if (!open || !goal) return;
    const source = goal.proposedChanges
      ? { ...goal, ...goal.proposedChanges }
      : goal;
    form.setFieldsValue({
      skillName: source.skillName,
      measurableOutcome: source.measurableOutcome,
      targetDeadline: source.targetDeadline
        ? dayjs(source.targetDeadline)
        : undefined,
      quarterId: source.quarterId,
    });
  }, [open, goal, form]);

  const onOk = async () => {
    if (!plan || !goal) return;

    if (managerMode) {
      approvePlan(plan.id, { onSuccess: onClose });
      return;
    }

    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    proposeEdit(
      {
        planId: plan.id,
        goalId: goal.id,
        changes: {
          skillName: values.skillName,
          measurableOutcome: values.measurableOutcome,
          targetDeadline: values.targetDeadline.format('YYYY-MM-DD'),
          quarterId: values.quarterId,
          quarterLabel: quarters.find((q) => q.id === values.quarterId)?.label,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      title={managerMode ? 'Review proposed edit' : 'Propose goal edit'}
      open={open}
      onCancel={onClose}
      onOk={onOk}
      confirmLoading={proposing || approving}
      okText={managerMode ? 'Re-approve changes' : 'Submit for re-approval'}
      data-cy="pgp-propose-edit-modal"
    >
      <Form form={form} layout="vertical" disabled={managerMode}>
        <Form.Item
          name="skillName"
          label="Skill name"
          rules={[{ required: true }]}
        >
          <Input data-cy="pgp-edit-skill-name" />
        </Form.Item>
        <Form.Item
          name="measurableOutcome"
          label="Measurable outcome"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={3} data-cy="pgp-edit-outcome" />
        </Form.Item>
        <Form.Item
          name="quarterId"
          label="Quarter"
          rules={[{ required: true }]}
        >
          <Select
            options={quarters.map((q) => ({ value: q.id, label: q.label }))}
            data-cy="pgp-edit-quarter"
          />
        </Form.Item>
        <Form.Item
          name="targetDeadline"
          label="Deadline"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" data-cy="pgp-edit-deadline" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProposeEditModal;
