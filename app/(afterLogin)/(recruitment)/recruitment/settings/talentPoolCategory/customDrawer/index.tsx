'use client';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateTalentPoolCategory,
  useUpdateTalentPoolCategory,
} from '@/store/server/features/recruitment/tallentPoolCategory/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { Form, Input } from 'antd';
import React, { useEffect } from 'react';

const TalentPoolDrawer: React.FC = () => {
  const { isOpen, selectedTalentPool, closeDrawer, isEditMode } =
    useTalentPoolSettingsStore();

  const { userId } = useAuthenticationStore();

  const { mutate: createTalentPoolCategory } = useCreateTalentPoolCategory();
  const { mutate: updateTalentPoolCategory } = useUpdateTalentPoolCategory();

  const handleCancel = () => {
    closeDrawer();
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
            },
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

  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && selectedTalentPool) {
      form.setFieldsValue({
        title: selectedTalentPool?.title,
        description: selectedTalentPool.description,
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, selectedTalentPool, form]);

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className=" flex justify-start text-xl font-extrabold text-gray-800 py-6">
          {isEditMode
            ? 'Edit Talent Pool Category'
            : 'New Talent Pool Category'}
        </h1>
      }
      onClose={handleCancel}
      open={isOpen}
      width="40%"
      footer={
        <div className="flex justify-center items-center w-full space-x-5 p-4">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              title="Cancel"
              onClick={handleCancel}
              type="default"
            />
            <CustomButton
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input className="h-12" placeholder="Enter the category title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: false }]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Enter the category description"
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default TalentPoolDrawer;
