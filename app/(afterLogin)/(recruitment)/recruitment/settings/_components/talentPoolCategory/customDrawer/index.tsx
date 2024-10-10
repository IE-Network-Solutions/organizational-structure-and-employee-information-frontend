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
        updateTalentPoolCategory({
          id: selectedTalentPool?.id || '',
          category: {
            ...values,
            name: values.name,
          },
        });
      } else {
        createTalentPoolCategory({
          title: values.name,
          description: values.description,
          createdBy: userId,
        });
      }
      closeDrawer();
    });
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && selectedTalentPool) {
      form.setFieldsValue({
        name: selectedTalentPool.title,
        description: selectedTalentPool.description,
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, selectedTalentPool, form]);

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-bold py-2">
          {isEditMode
            ? 'Edit Talent Pool Category'
            : 'New Talent Pool Category'}
        </h1>
      }
      onClose={handleCancel}
      open={isOpen}
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
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
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
