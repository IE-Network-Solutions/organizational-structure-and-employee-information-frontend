import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';

interface EditCategoryModalProps {
  onConfirm: (values: any) => void;
  userOptions: { value: string; label: string }[];
}

const { Option } = Select;

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ onConfirm }) => {
  const [form] = Form.useForm();
  const {
    editModal,
    editingCategory,
    selectedUsers,
    setSelectedUsers,
    setEditModal,
    setEditingCategory,
  } = CategoriesManagementStore();
  const { data: users } = useFetchUsers();

  React.useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        ...editingCategory,
        users: selectedUsers.map((user) => user.userId),
      });
    }
  }, [editingCategory, form, selectedUsers]);

  const handleCancel = () => {
    form.resetFields();
    setEditModal(false);
    setEditingCategory(null);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const adjustedValues = {
        ...values,
        users: selectedUsers,
      };
      onConfirm(adjustedValues);
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
            value={selectedUsers.map((user) => user.userId)}
            onChange={(userIds: string[]) =>
              setSelectedUsers(userIds.map((id) => ({ userId: id })))
            }
          >
            {users?.items.map((employee: any) => (
              <Option key={employee.id} value={employee.id}>
                {employee?.firstName + ' ' + employee?.middleName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
