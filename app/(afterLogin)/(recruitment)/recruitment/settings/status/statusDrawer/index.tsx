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

  useUpdateRecruitmentStatus;
  const handleCancel = () => {
    setIsDrawerOpen(false);
    setEditMode(false);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        updateRecruitmentStatus({
          id: selectedStatus?.id || '',
          data: {
            ...values,
            title: values?.title,
            updatedBy: userId,
          },
        });
      } else {
        createRecruitmentStatus({
          title: values?.title,
          description: values?.description,
          createdBy: userId,
        });
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

  return (
    <CustomDrawerLayout
      data-cy="talent-acquisition-status-drawer"
      modalHeader={
        <h1
          data-cy="settings-status-statusdrawer-index-tsx-index-h1-74"
          className="text-lg font-bold py-2"
        >
          {isEditMode ? 'Edit Status' : 'Define Status'}
        </h1>
      }
      onClose={handleCancel}
      open={isDrawerOPen}
      width="40%"
      footer={
        <div
          data-cy="settings-status-statusdrawer-index-tsx-index-div-82"
          className="flex justify-center items-center w-full p-2"
        >
          <div
            data-cy="settings-status-statusdrawer-index-tsx-index-div-83"
            className="flex justify-between items-center gap-4"
          >
            <CustomButton
              id="talent-acquisition-status-button-cancel"
              data-cy="talent-acquisition-status-button-cancel"
              title="Cancel "
              onClick={handleCancel}
              type="default"
            />
            <CustomButton
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
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      <Form
        id="talent-acquisition-status-form"
        data-cy="talent-acquisition-status-form"
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Name"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input
            id="talent-acquisition-status-input-title"
            data-cy="talent-acquisition-status-input-title"
            className="h-10"
            placeholder="Enter the status title"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: false }]}
        >
          <Input.TextArea
            id="talent-acquisition-status-textarea-description"
            data-cy="talent-acquisition-status-textarea-description"
            rows={6}
            placeholder="Enter the status description"
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default RecruitmentStatusDrawer;
