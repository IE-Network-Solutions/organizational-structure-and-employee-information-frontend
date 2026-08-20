'use client';
import React, { useEffect, useState } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';
import type {
  CompetencyGap,
  DevelopmentAction,
  DevelopmentActionStatus,
} from '../successionTypes';

export type DevelopmentActionFormValues = Omit<DevelopmentAction, 'id'>;

interface DevelopmentActionModalProps {
  open: boolean;
  editing?: DevelopmentAction | null;
  gaps: CompetencyGap[];
  /** When set, the Linked Gap field is prefilled and locked. */
  lockedGapId?: string;
  onClose: () => void;
  /** Awaited so the Save button can hold its loading state. */
  onSave: (payload: DevelopmentActionFormValues) => void | Promise<void>;
}

const DevelopmentActionModal: React.FC<DevelopmentActionModalProps> = ({
  open,
  editing = null,
  gaps,
  lockedGapId,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { employees } = useSuccessionOrgData();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        ...editing,
        targetCompletionDate: editing.targetCompletionDate
          ? dayjs(editing.targetCompletionDate)
          : undefined,
        gapId: lockedGapId ?? editing.gapId,
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      status: 'Not Started',
      gapId: lockedGapId,
    });
  }, [open, editing, lockedGapId, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const person = employees.find((e) => e.id === values.responsiblePersonId);
    setSubmitting(true);
    try {
      await onSave({
        actionItem: values.actionItem.trim(),
        responsiblePersonId: values.responsiblePersonId,
        responsiblePersonName: person?.name ?? '',
        targetCompletionDate: values.targetCompletionDate
          ? values.targetCompletionDate.format('YYYY-MM-DD')
          : '',
        status: values.status as DevelopmentActionStatus,
        remarks: values.remarks?.trim() || undefined,
        gapId: values.gapId || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const gapLocked = Boolean(lockedGapId);

  return (
    <Modal
      title={editing ? 'Edit development action' : 'Define development action'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={submitting}
      cancelButtonProps={{ disabled: submitting }}
      maskClosable={!submitting}
      destroyOnClose
      width={520}
      data-cy="development-action-modal"
    >
      <Form form={form} layout="vertical" className="mt-2">
        {gapLocked ? (
          <>
            <Form.Item name="gapId" hidden>
              <Input />
            </Form.Item>
            <div
              className="mb-4 rounded-md border border-[#E6E6E6] bg-[#FAFAFA] px-3 py-2"
              data-cy="action-linked-gap-banner"
            >
              <div className="text-xs text-gray-500">Linked competency gap</div>
              <div className="text-sm font-medium text-[#4d4d4d]">
                {gaps.find((g) => g.id === lockedGapId)?.competencyName ??
                  'Selected gap'}
              </div>
            </div>
          </>
        ) : null}
        <Form.Item
          name="actionItem"
          label="Action Item"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe the development action"
            data-cy="action-item-input"
          />
        </Form.Item>
        <Form.Item
          name="responsiblePersonId"
          label="Responsible Person"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select person"
            options={employees.map((e) => ({
              value: e.id,
              label: `${e.name} · ${e.jobTitle}`,
            }))}
            data-cy="action-responsible-select"
          />
        </Form.Item>
        <Form.Item
          name="targetCompletionDate"
          label="Target Completion Date"
          rules={[{ required: true, message: 'Required' }]}
        >
          <DatePicker className="w-full" data-cy="action-target-date" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            options={[
              { value: 'Not Started', label: 'Not Started' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
            data-cy="action-status-select"
          />
        </Form.Item>
        {!gapLocked ? (
          <Form.Item
            name="gapId"
            label="Linked Gap"
            normalize={(value) => value || undefined}
          >
            <Select
              allowClear
              placeholder="Select gap (optional)"
              options={gaps.map((g) => ({
                value: g.id,
                label: g.competencyName,
              }))}
              data-cy="action-gap-select"
            />
          </Form.Item>
        ) : null}
        <Form.Item name="remarks" label="Remarks">
          <Input.TextArea rows={2} data-cy="action-remarks" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DevelopmentActionModal;
