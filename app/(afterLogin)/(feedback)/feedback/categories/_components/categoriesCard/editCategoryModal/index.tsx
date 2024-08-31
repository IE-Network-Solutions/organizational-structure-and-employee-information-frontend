import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';

interface EditCategoryModalProps {
  onConfirm: (values: any) => void;
  userOptions: { value: string; label: string }[];
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  onConfirm,
  userOptions,
}) => {
  const [form] = Form.useForm();
  const { editModal, editingCategory, setEditModal, setEditingCategory } =
    CategoriesManagementStore();

  React.useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue(editingCategory);
    }
  }, [editingCategory, form]);
  const handleCancel = () => {
    form.resetFields();
    setEditModal(false);
    setEditingCategory(null);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      onConfirm(values);
      form.resetFields();
      setEditModal(false);
      setEditingCategory(null);
    });
  };

  return (
    <Modal
      title="Edit Category"
      open={editModal}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical" initialValues={editingCategory}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input the category name!' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="users" label="Users">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select users"
            options={userOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
