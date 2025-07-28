import React from 'react';
import { Modal, Form, Input, Select, Spin, Button } from 'antd';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useUpdateFormCategory } from '@/store/server/features/conversation/mutation';

interface EditCategoryModalProps {
  userOptions: { value: string; label: string }[];
}

const { Option } = Select;

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({}) => {
  const [form] = Form.useForm();
  const {
    editModal,
    editingCategory,
    selectedUsers,
    searchParams,
    setSelectedUsers,
    setEditModal,
    setEditingCategory,
  } = CategoriesManagementStore();
  const { data: users, isLoading: usersLoading } = useFetchUsers(
    searchParams?.category_name,
  );

  const { mutateAsync: updateCategory, isLoading: isUpdatingCategory } =
    useUpdateFormCategory();

  React.useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        ...editingCategory,
      });
    }
  }, [editingCategory, form]);

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

      const editingCategory =
        CategoriesManagementStore.getState().editingCategory;
      if (editingCategory) {
        updateCategory(
          {
            id: editingCategory.id,
            data: {
              name: adjustedValues.name,
              description: adjustedValues.description,
              users: adjustedValues.users,
            },
          },
          {
            onSuccess: () => {
              form.resetFields();
              setEditModal(false);
              setEditingCategory(null);
            },
          },
        );
      }
    });
  };

  return (
    <Modal
      title="Edit Category"
      open={editModal}
      footer={null}
      onCancel={handleCancel}
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
        <Form.Item name="users" label="Permitted Users">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select users"
            value={selectedUsers.map(user => user.userId)}                
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.children ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            onChange={(userIds: string[]) =>
              setSelectedUsers(userIds.map((id) => ({ userId: id })))
            }
          >
            {users?.items.map((employee: any) => (
              <Option key={employee.id} value={employee.id}>
                {usersLoading ? (
                  <Spin size="small" />
                ) : (
                  employee.firstName +
                  ' ' +
                  (employee?.middleName || '') +
                  ' ' +
                  employee.lastName
                )}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className="flex justify-end w-full gap-3">
          <Button onClick={handleCancel} className="mr-3">
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isUpdatingCategory}
            onClick={handleOk}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
