'use client';

import {
  useCreateTalentPoolCategory,
  useUpdateTalentPoolCategory,
} from '@/store/server/features/recruitment/tallentPoolCategory/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';

const TalentPoolDrawer: React.FC = () => {
  const [form] = Form.useForm();
  const { isOpen, selectedTalentPool, closeDrawer, isEditMode } =
    useTalentPoolSettingsStore();
  const { userId } = useAuthenticationStore();

  const { mutate: createTalentPoolCategory } = useCreateTalentPoolCategory();
  const { mutate: updateTalentPoolCategory } = useUpdateTalentPoolCategory();

  const handleCancel = () => {
    closeDrawer();
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        updateTalentPoolCategory(
          {
            id: selectedTalentPool?.id || '',
            category: {
              ...values,
              updatedBy: userId,
            } as any,
          },
          {
            onSuccess: () => {
              closeDrawer();
            },
          },
        );
      } else {
        createTalentPoolCategory(
          {
            title: values?.title,
            description: values?.description,
            createdBy: userId,
          },
          {
            onSuccess: () => {
              closeDrawer();
              form.resetFields();
            },
          },
        );
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && selectedTalentPool) {
        form.setFieldsValue({
          title: selectedTalentPool?.title,
          description: selectedTalentPool?.description ?? '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, isEditMode, selectedTalentPool, form]);

  const modalTitle = isEditMode ? 'Edit Category' : 'Add Category';
  const primaryButtonText = isEditMode ? 'Edit' : 'Continue';

  return (
    <Modal
      data-cy="talent-acquisition-talent-pool-category-modal"
      open={isOpen}
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
        id="talent-acquisition-talent-pool-category-form"
        data-cy="talent-acquisition-talent-pool-category-form"
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Category Name"
          name="title"
          rules={[{ required: true, message: 'Please enter category name' }]}
          required
        >
          <Input
            id="talent-acquisition-talent-pool-category-input-title"
            data-cy="talent-acquisition-talent-pool-category-input-title"
            className="h-10 rounded-md"
            placeholder="Category name"
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            id="talent-acquisition-talent-pool-category-textarea-description"
            data-cy="talent-acquisition-talent-pool-category-textarea-description"
            rows={4}
            className="rounded-md"
            placeholder="Category Description"
          />
        </Form.Item>

        <div
          className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100"
          data-cy="talent-acquisition-talent-pool-category-drawer-actions"
        >
          <Button
            id="talent-acquisition-talent-pool-category-button-cancel"
            data-cy="talent-acquisition-talent-pool-category-button-cancel"
            className="px-6 py-2 rounded-md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            id={
              isEditMode
                ? 'talent-acquisition-talent-pool-category-button-update'
                : 'talent-acquisition-talent-pool-category-button-create'
            }
            data-cy={
              isEditMode
                ? 'talent-acquisition-talent-pool-category-button-update'
                : 'talent-acquisition-talent-pool-category-button-create'
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

export default TalentPoolDrawer;
