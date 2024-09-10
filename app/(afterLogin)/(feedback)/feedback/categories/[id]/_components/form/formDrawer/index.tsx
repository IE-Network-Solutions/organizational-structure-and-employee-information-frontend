'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Switch,
} from 'antd';
import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';
import {
  useFetchUsers,
  useGetFormCategories,
} from '@/store/server/features/feedback/category/queries';
import { useAddForm } from '@/store/server/features/feedback/form/mutation';
import TextArea from 'antd/es/input/TextArea';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';

const { Option } = Select;
function FormDrawer({ onClose, id }: { onClose: any; id: string }) {
  const { data: employees } = useFetchUsers();
  const { data: formCategories } = useGetFormCategories(id);
  const { mutate: addForm } = useAddForm();

  const {
    isDrawerOpen,
    setIsDrawerOpen,
    selectedUsers,
    setSelectedUsers,
    clearSelectedUsers,
  } = useDynamicFormStore();

  const [form] = Form.useForm();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create {formCategories?.name}
    </div>
  );

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    form.resetFields();
    clearSelectedUsers();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description, surveyStartDate, surveyEndDate, Select } =
      values;

    const startDate = surveyStartDate.toISOString();
    const endDate = surveyEndDate.toISOString();

    addForm({
      name,
      description,
      formPermissions: selectedUsers,
      startDate,
      endDate,
      isAnonymous: Select ?? false,
      formCategoryId: id,
      status: 'published',
    });
    handleCloseDrawer();
  };

  return (
    isDrawerOpen && (
      <CustomDrawerLayout
        open={isDrawerOpen}
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
              <Col lg={10} sm={24} xs={24}>
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
              <Col lg={10} sm={24} xs={24}>
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
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  {formCategories?.name} Group
                </span>
              }
              required
              rules={[{ required: true, message: 'Please select employees' }]}
            >
              <Select
                mode="multiple"
                size="large"
                className="text-sm w-full h-10"
                allowClear
                placeholder="Select employees"
                value={selectedUsers.map((user) => user.userId)}
                onChange={(userIds: string[]) =>
                  setSelectedUsers(userIds.map((id) => ({ userId: id })))
                }
              >
                {employees?.items.map((employee: any) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee?.firstName + ' ' + employee?.middleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
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
          </Form>
        </div>
      </CustomDrawerLayout>
    )
  );
}

export default FormDrawer;
