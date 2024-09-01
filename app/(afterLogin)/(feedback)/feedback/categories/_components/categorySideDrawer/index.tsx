'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Button, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useAddCategory } from '@/store/server/features/feedback/category/mutation';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';

interface CategoryFormValues {
  name: string;
  description: string;
}
const { Option } = Select;

const CategorySideDrawer: React.FC<any> = (props) => {
  const { open, setOpen, selectedUsers, setSelectedUsers, clearSelectedUsers } =
    CategoriesManagementStore();
  const createCategory = useAddCategory();
  const { data: employees } = useFetchUsers();
  const [form] = Form.useForm();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create Category
    </div>
  );
  const handleCloseDrawer = () => {
    setOpen(false);
    form.resetFields();
    clearSelectedUsers();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description } = values as CategoryFormValues;

    await createCategory.mutateAsync({
      name,
      description,
      users: selectedUsers,
    });

    handleCloseDrawer();
  };

  const CustomFooter = () => (
    <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
      <Button
        onClick={handleCloseDrawer}
        className="flex justify-center text-sm font-medium text-gray-600 bg-gray-200 p-4 px-10 h-12 hover:border-gray-400"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
      >
        Submit
      </Button>
    </div>
  );

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
        footer={<CustomFooter />}
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-y-auto">
            <Form form={form} layout="vertical">
              <Form.Item
                id="categoryName"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Category Name
                  </span>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please input the category name!',
                  },
                ]}
              >
                <Input
                  allowClear
                  size="large"
                  placeholder="Enter category name"
                  className="text-sm w-full h-14"
                />
              </Form.Item>
              <Form.Item
                id="categoryDescription"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Category Description
                  </span>
                }
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Please input the category description!',
                  },
                ]}
              >
                <TextArea
                  allowClear
                  rows={4}
                  placeholder="Enter category description"
                />
              </Form.Item>
              <Form.Item
                id="employeeLevel"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Permitted Employees
                  </span>
                }
                name="employeeLevel"
                rules={[
                  {
                    required: true,
                    message: 'Please input the employee level!',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Select employees"
                  value={selectedUsers.map((user) => user.userId)}
                  onChange={(userIds: string[]) =>
                    setSelectedUsers(userIds.map((id) => ({ userId: id })))
                  }
                >
                  {employees?.employees.map((employee: any) => (
                    <Option key={employee.id} value={employee.id}>
                      {employee.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <div className="flex items-center justify-start gap-1 mx-2 mt-0">
              <IoIosInformationCircleOutline size={20} />
              <p className="text-gray-300 text-sm font-light">
                Select employees inside the level as preferred.
              </p>
            </div>
          </div>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default CategorySideDrawer;
