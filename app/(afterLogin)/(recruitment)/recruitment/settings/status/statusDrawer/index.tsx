'use client';

import {
  useCreateRecruitmentStatus,
  useUpdateRecruitmentStatus,
} from '@/store/server/features/recruitment/settings/status/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';

const RecruitmentStatusDrawer: React.FC = () => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();

  const {
    isDrawerOPen,
    isEditMode,
    setIsDrawerOpen,
    selectedStatus,
    setEditMode,
  } = useRecruitmentStatusStore();

  const { mutate: createRecruitmentStatus } = useCreateRecruitmentStatus();
  const { mutate: updateRecruitmentStatus } = useUpdateRecruitmentStatus();

  const handleCancel = () => {
    setIsDrawerOpen(false);
    setEditMode(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: Record<string, unknown> = {
        title: values?.title,
        description: values?.description ?? undefined,
        ...(isEditMode ? { updatedBy: userId } : { createdBy: userId }),
      };
      if (!isEditMode) {
        payload.level = values?.level;
      }
      if (isEditMode) {
        updateRecruitmentStatus({
          id: selectedStatus?.id || '',
          data: payload,
        });
      } else {
        createRecruitmentStatus(payload);
        form.resetFields();
      }
      setIsDrawerOpen(false);
    });
  };

  useEffect(() => {
    if (isDrawerOPen) {
      if (isEditMode && selectedStatus) {
        form.setFieldsValue({
          title: selectedStatus.title || '',
          description: selectedStatus.description || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [isDrawerOPen, isEditMode, selectedStatus, form]);

  const modalTitle = isEditMode ? 'Edit Status' : 'Define Status';
  const primaryButtonText = isEditMode ? 'Edit' : 'Continue';

  return (
    <Modal
      data-cy="talent-acquisition-status-modal"
      open={isDrawerOPen}
      title={modalTitle}
      onCancel={handleCancel}
      footer={null}
      closable
      centered
      width={480}
      destroyOnClose
      rootClassName="recruitment-settings-status-modal"
    >
      <Form
        id="talent-acquisition-status-form"
        data-cy="talent-acquisition-status-form"
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Status Name"
          name="title"
          rules={[{ required: true, message: 'Please enter status name' }]}
          required
        >
          <Input
            id="talent-acquisition-status-input-title"
            data-cy="talent-acquisition-status-input-title"
            className="h-10 rounded-md"
            placeholder="status name"
          />
        </Form.Item>

        {!isEditMode && (
          <Form.Item
            label="Status Level"
            name="level"
            rules={[{ required: true, message: 'Please enter status level' }]}
            required
          >
            <Input
              id="talent-acquisition-status-input-level"
              data-cy="talent-acquisition-status-input-level"
              className="h-10 rounded-md"
              placeholder="status level"
            />
          </Form.Item>
        )}

        <Form.Item label="Description" name="description">
          <Input.TextArea
            id="talent-acquisition-status-textarea-description"
            data-cy="talent-acquisition-status-textarea-description"
            rows={4}
            className="rounded-md"
            placeholder="Status Description"
          />
        </Form.Item>

        <div
          className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100"
          data-cy="talent-acquisition-status-drawer-actions"
        >
          <Button
            id="talent-acquisition-status-button-cancel"
            data-cy="talent-acquisition-status-button-cancel"
            className="px-6 py-2 rounded-md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            id={
              isEditMode
                ? 'talent-acquisition-status-button-update'
                : 'talent-acquisition-status-button-create'
            }
            data-cy={
              isEditMode
                ? 'talent-acquisition-status-button-update'
                : 'talent-acquisition-status-button-create'
            }
            type="primary"
            className="recruitment-settings-status-primary-btn px-6 py-2 rounded-md"
            onClick={handleSubmit}
          >
            {primaryButtonText}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RecruitmentStatusDrawer;
