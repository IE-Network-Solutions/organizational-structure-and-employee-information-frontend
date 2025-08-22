'use client';
import React, { useEffect } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Button, Form, Input, Select, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useAddCategory } from '@/store/server/features/feedback/category/mutation';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';

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
    searchUserParams,
    setSelectedUsers,
  } = CategoriesManagementStore();
  const { mutateAsync: createCategory, isLoading: isCreatingCategory } =
    useAddCategory();
  const { data: employees, isLoading: isEmployeesLoading } = useFetchUsers(
    searchUserParams?.user_name,
  );

  const [form] = Form.useForm();
  useEffect(() => {
    form.validateFields(['employeeLevel']);
  }, [isAllSelected, selectedUsers, form]);

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

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description } = values as CategoryFormValues;

    await createCategory(
      {
        name,
        description,
        users: selectedUsers,
      },
      {
        onSuccess: () => {
          handleCloseDrawer();
          form.resetFields();
        },
      },
    );
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
                    validator: async () => {
                      if (isAllSelected || selectedUsers.length > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Please select at least one employee!'),
                      );
                    },
                  },
                ]}
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
                >
                  {employees?.items.map((employee: any) => (
                    <Select.Option key={employee.id} value={employee.id}>
                      {isEmployeesLoading ? (
                        <Spin size="small" />
                      ) : (
                        employee.firstName +
                        ' ' +
                        (employee?.middleName || '') +
                        ' ' +
                        employee.lastName
                      )}
                    </Select.Option>
                  ))}
                </Select>
                {/* <Collapse
                  activeKey={activeKey}
                  onChange={(key) => setActiveKey(key)}
                >
                  <Collapse.Panel header={<div>Select Employee</div>} key="0">
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
                                  employee?.middleName +
                                  ' ' +
                                  employee?.lastName}
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
                </Collapse> */}
              </Form.Item>
              <Form.Item>
                <div className="flex justify-center absolute w-full bg-[#fff] space-x-5 mt-24">
                  <Button
                    onClick={handleCloseDrawer}
                    className=" text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={isCreatingCategory}
                    onClick={handleSubmit}
                    className="flex justify-center text-sm font-medium text-white bg-primary  hover:border-gray-500 p-4 px-10 h-12 border-none"
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
