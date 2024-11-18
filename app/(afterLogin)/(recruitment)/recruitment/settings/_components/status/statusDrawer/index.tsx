'use client';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateRecruitmentStatus,
  useUpdateRecruitmentStatus,
} from '@/store/server/features/recruitment/settings/status/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import { Form, Input } from 'antd';
import React from 'react';

const RecruitmentStatusDrawer: React.FC = () => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();

  const {
    isDrawerOPen,
    isEditMode,
    setIsDrawerOpen,
    selectedStatus,
    setSelectedStatus,
  } = useRecruitmentStatusStore();

  const { mutate: createRecruitmentStatus } = useCreateRecruitmentStatus();
  const { mutate: updateRecruitmentStatus } = useUpdateRecruitmentStatus();

  useUpdateRecruitmentStatus;
  const handleCancel = () => {
    setIsDrawerOpen(false);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        updateRecruitmentStatus({
          id: selectedStatus?.id || '',
          data: {
            ...values,
            title: values.title,
            updatedBy: userId,
          },
        });
      } else {
        createRecruitmentStatus({
          title: values.title,
          description: values.description,
          createdBy: userId,
        });
        form.resetFields();
      }
      setIsDrawerOpen(false);
    });
  };

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-bold py-2">
          {isEditMode ? 'Edit Status' : 'Define Status'}
        </h1>
      }
      onClose={handleCancel}
      open={isDrawerOPen}
      width="30%"
      footer={
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton title="Cancel" onClick={handleCancel} />
            <CustomButton
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      {' '}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input className="h-12" placeholder="Enter the status title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: false }]}
        >
          <Input.TextArea rows={6} placeholder="Enter the status description" />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default RecruitmentStatusDrawer;
