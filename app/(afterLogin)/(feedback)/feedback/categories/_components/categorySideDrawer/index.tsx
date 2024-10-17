'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Avatar, Button, Checkbox, Collapse, Form, Image, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useAddCategory } from '@/store/server/features/feedback/category/mutation';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import dayjs from 'dayjs';
import { UserOutlined } from '@ant-design/icons';

interface CategoryFormValues {
  name: string;
  description: string;
}

const CategorySideDrawer: React.FC<any> = (props) => {
  const {
    open,
    setOpen,
    selectedUsers,
    deselectAllUsers,
    isAllSelected,
    toggleUserSelection,
    selectAllUsers,
  } = CategoriesManagementStore();
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
    deselectAllUsers();
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      deselectAllUsers();
    } else {
      const selectedUsers =
        employees?.items?.map((user: { id: string }) => ({
          userId: user.id,
        })) || [];
      selectAllUsers(selectedUsers);
    }
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
    form.resetFields();
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
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
                <Collapse>
                  <Collapse.Panel header="Select employees" key="0">
                    <div className="flex flex-col justify-center gap-2">
                      <div className="flex items-center justify-start gap-2 border border-gray-200 rounded-md p-2">
                        <Checkbox
                          checked={isAllSelected}
                          onClick={handleSelectAll}
                        />
                        <div className="text-md font-medium">All</div>
                      </div>
                      {employees?.items.map((employee: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-start gap-5 border border-gray-200 rounded-md p-2"
                        >
                          <Checkbox
                            checked={
                              isAllSelected
                                ? isAllSelected
                                : selectedUsers.some(
                                    (user) => user.userId === employee.id,
                                  )
                            }
                            onChange={() => toggleUserSelection(employee.id)}
                          />
                          <div className="flex items-center justify-start gap-2">
                            <div className="flex items-center justify-center">
                              {employee?.profileImage ? (
                                <Image
                                  src={employee?.profileImage}
                                  alt="Employee Profile Image"
                                  className="rounded-full"
                                  width={30}
                                  height={30}
                                />
                              ) : (
                                <Avatar size={25} icon={<UserOutlined />} />
                              )}
                            </div>
                            <div className="flex flex-col items-start justify-center">
                              <div className="font-semibold text-md">
                                {employee?.firstName +
                                  ' ' +
                                  employee?.middleName}
                              </div>
                              <div className=" flex items-center justify-center gap-2 text-xs font-light">
                                <div> Join Date </div>
                                <div> - </div>
                                <div>
                                  {dayjs(employee?.createdAt).format(
                                    'MMMM D, YYYY',
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse.Panel>
                </Collapse>
              </Form.Item>
              <Form.Item>
                <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8">
                  <Button
                    onClick={handleCloseDrawer}
                    className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
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
