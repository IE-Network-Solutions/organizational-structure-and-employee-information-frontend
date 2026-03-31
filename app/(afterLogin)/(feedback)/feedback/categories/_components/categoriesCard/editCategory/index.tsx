import React from 'react';
import { Modal, Form, Input, Select, Spin, Button } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useUpdateFormCategory } from '@/store/server/features/conversation/mutation';

interface EditCategoryModalProps {
  userOptions: { value: string; label: string }[];
}

const { Option } = Select;

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({}) => {
  const { isMobile } = useIsMobile();
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
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
      width={isMobileViewport ? '100%' : undefined}
      centered={!isMobileViewport}
      style={
        isMobileViewport
          ? {
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              transform: 'none',
              maxWidth: '100%',
              width: '100%',
            }
          : undefined
      }
      styles={{
        body: {
          maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : undefined,
          overflowY: isMobileViewport ? 'auto' : undefined,
        },
        content: {
          ...(isMobileViewport
            ? { borderRadius: 12, width: '100%', maxWidth: '100%' }
            : {}),
        },
      }}
      data-cy="feedback-categories-components-categoriescard-editcategory-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={editingCategory}
        data-cy="feedback-categories-components-categoriescard-editcategory-form"
        id="feedback-categories-components-categoriescard-editcategory-form"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please input the category name!' },
          ]}
          data-cy="feedback-categories-components-categoriescard-editcategory-form-item-name"
          id="feedback-categories-components-categoriescard-editcategory-form-item-name"
        >
          <Input
            data-cy="feedback-categories-components-categoriescard-editcategory-input-name"
            id="feedback-categories-components-categoriescard-editcategory-input-name"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          data-cy="feedback-categories-components-categoriescard-editcategory-form-item-description"
          id="feedback-categories-components-categoriescard-editcategory-form-item-description"
        >
          <Input.TextArea
            data-cy="feedback-categories-components-categoriescard-editcategory-textarea-description"
            id="feedback-categories-components-categoriescard-editcategory-textarea-description"
          />
        </Form.Item>
        <Form.Item
          name="users"
          label="Permitted Users"
          data-cy="feedback-categories-components-categoriescard-editcategory-form-item-users"
          id="feedback-categories-components-categoriescard-editcategory-form-item-users"
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select users"
            value={selectedUsers.map((user) => user.userId)}
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
            data-cy="feedback-categories-components-categoriescard-editcategory-select-users"
            id="feedback-categories-components-categoriescard-editcategory-select-users"
          >
            {users?.items.map((employee: any) => (
              <Option
                key={employee.id}
                value={employee.id}
                data-cy={`feedback-categories-components-categoriescard-editcategory-option-employee-${employee.id}`}
                id={`feedback-categories-components-categoriescard-editcategory-option-employee-${employee.id}`}
              >
                {usersLoading ? (
                  <Spin
                    size="small"
                    data-cy={`feedback-categories-components-categoriescard-editcategory-spin-employee-${employee.id}`}
                  />
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
        <Form.Item
          className="flex justify-end w-full gap-3"
          data-cy="feedback-categories-components-categoriescard-editcategory-form-item-footer"
          id="feedback-categories-components-categoriescard-editcategory-form-item-footer"
        >
          <Button
            onClick={handleCancel}
            className="mr-3"
            data-cy="feedback-categories-components-categoriescard-editcategory-button-cancel"
            id="feedback-categories-components-categoriescard-editcategory-button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            loading={isUpdatingCategory}
            onClick={handleOk}
            data-cy="feedback-categories-components-categoriescard-editcategory-button-submit"
            id="feedback-categories-components-categoriescard-editcategory-button-submit"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
