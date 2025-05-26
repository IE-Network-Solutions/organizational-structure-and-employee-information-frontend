'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Switch,
  Collapse,
  Checkbox,
} from 'antd';
import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import {
  useEmployeeDepartments,
  useGetFormCategories,
} from '@/store/server/features/feedback/category/queries';
import { useAddForm } from '@/store/server/features/feedback/form/mutation';
import TextArea from 'antd/es/input/TextArea';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';

function FormDrawer({ onClose, id }: { onClose: any; id: string }) {
  const { data: formCategories } = useGetFormCategories(id);
  const { data: departments } = useEmployeeDepartments();
  const { mutate: addForm, isLoading: addFormLoading } = useAddForm();
  const { isAddOpen, setIsAddOpen, clearSelectedUsers } = useDynamicFormStore();

  const {
    selectedUsers,
    selectAllUsers,
    isAllSelected,
    selectedDepartmentIds,
    deselectAllUsers,
    toggleUserSelection,
    toggleDepartmentSelection,
  } = CategoriesManagementStore();

  const [form] = Form.useForm();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create {formCategories?.name}
    </div>
  );

  const handleCloseDrawer = () => {
    setIsAddOpen(false);
    form.resetFields();
    clearSelectedUsers();
  };
  const handleSelectAll = () => {
    if (isAllSelected) {
      deselectAllUsers();
    } else {
      selectAllUsers(
        departments?.flatMap(
          (department: any) =>
            department?.users?.map((user: any) => ({
              userId: user?.id,
            })) || [],
        ) || [],
      );
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description, surveyStartDate, surveyEndDate, Select } =
      values;
    const startDate = surveyStartDate.toISOString();
    const endDate = surveyEndDate.toISOString();

    addForm(
      {
        name,
        description,
        formPermissions: selectedUsers,
        startDate,
        endDate,
        isAnonymous: Select ?? false,
        formCategoryId: id,
        status: 'published',
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
    isAddOpen && (
      <CustomDrawerLayout
        open={isAddOpen}
        onClose={onClose}
        modalHeader={drawerHeader}
        width="40%"
      >
        <div className="flex flex-col h-full">
          <Form form={form} layout="vertical">
            <Form.Item
              id="FormName"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  {formCategories?.name} Name
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
                placeholder={`Enter ${formCategories?.name} name`}
                className="text-sm w-full h-10"
              />
            </Form.Item>
            <Form.Item
              id="categoryDescription"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  {formCategories?.name} Description
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
                placeholder={`Enter ${formCategories?.name} description`}
              />
            </Form.Item>
            <Row gutter={[16, 24]} className="mb-8">
              <Col lg={12} sm={24} xs={24}>
                <Form.Item
                  name="surveyStartDate"
                  label={
                    <span className="text-md my-2 font-semibold text-gray-700">
                      {formCategories?.name} Start Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select start date' },
                  ]}
                >
                  <DatePicker
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select Start Date"
                    className="w-full h-10"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col lg={12} sm={24} xs={24}>
                <Form.Item
                  name="surveyEndDate"
                  label={
                    <span className="text-md my-2 font-semibold text-gray-700">
                      {formCategories?.name} End Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select end date' },
                  ]}
                >
                  <DatePicker
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select End Date"
                    className="w-full h-10"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="isAnonymous"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Allow to be anonymous
                </span>
              }
              valuePropName="checked"
              initialValue={false}
            >
              <Switch size="small" />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Permitted Employees To Edit
                </span>
              }
            >
              <Collapse>
                <Collapse.Panel header="Select employees" key="0">
                  <div className="flex flex-col justify-center ">
                    <div className="flex items-center justify-start gap-2 border border-gray-200 rounded-md p-2 mb-2">
                      <Checkbox
                        checked={isAllSelected}
                        onClick={handleSelectAll}
                      />
                      <div className="text-md font-medium">All</div>
                    </div>
                    {departments?.map((dep: any, index: string) => (
                      <div
                        key={index}
                        className="flex items-center justify-start gap-2 border border-gray-200 rounded-md p-2 mb-2"
                      >
                        <Checkbox
                          checked={
                            isAllSelected
                              ? isAllSelected
                              : selectedDepartmentIds?.some(
                                  (selectedDep: any) =>
                                    selectedDep?.id === dep.id,
                                )
                          }
                          onChange={() => toggleDepartmentSelection(dep)}
                        />
                        <div className="text-md font-medium">{dep?.name}</div>
                      </div>
                    ))}
                    {departments?.map((department: any) => (
                      <div key={department?.id}>
                        {department?.users
                          .filter((user: any) => user)
                          .map((user: any) => (
                            <div
                              key={user?.id}
                              className="flex items-center justify-start gap-5 rounded-md border border-gray-200 p-2"
                            >
                              <Checkbox
                                checked={selectedUsers?.some(
                                  (selectedUser) =>
                                    selectedUser?.userId === user.id,
                                )}
                                onChange={() => toggleUserSelection(user?.id)}
                              />
                              <div className="flex items-center justify-start gap-2">
                                <div className="flex items-center justify-center">
                                  <Image
                                    className="rounded-full"
                                    src={user?.profileImage ?? Avatar}
                                    alt="Employee Profile Image"
                                    width={15}
                                    height={15}
                                  />
                                </div>
                                <div className="flex flex-col items-start justify-center">
                                  <div className="font-semibold text-md">
                                    {user?.firstName + ' ' + user?.middleName}
                                  </div>
                                  <div className="text-xs font-light">
                                    {user?.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
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
                  loading={addFormLoading}
                >
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </CustomDrawerLayout>
    )
  );
}

export default FormDrawer;
