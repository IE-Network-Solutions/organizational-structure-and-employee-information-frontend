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
  Select,
  Spin,
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
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useGetFormsByCategoryID } from '@/store/server/features/feedback/form/queries';

function FormDrawer({ onClose, id }: { onClose: any; id: string }) {
  const { current, pageSize, searchFormParams } = CategoriesManagementStore();
  const { data: formCategories } = useGetFormCategories(id);
  const { mutate: addForm, isLoading: addFormLoading } = useAddForm();
  const { isAddOpen, setIsAddOpen, clearSelectedUsers } = useDynamicFormStore();
  const { data: employees, isLoading: isEmployeesLoading } = useFetchUsers('');
  const { refetch: refetchForms } = useGetFormsByCategoryID(
    id,
    searchFormParams?.form_name || '',
    searchFormParams?.form_description || '',
    searchFormParams?.createdBy || '',
    pageSize,
    current,
  );

  const { selectedUsers, setSelectedUsers } = CategoriesManagementStore();

  const [form] = Form.useForm();

  const drawerHeader = (
    <div
      id="form-drawer-header"
      data-cy="form-drawer-header"
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
    >
      Create {formCategories?.name}
    </div>
  );

  const handleCloseDrawer = () => {
    setIsAddOpen(false);
    form.resetFields();
    clearSelectedUsers();
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
          refetchForms();
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
        data-cy="form-drawer-custom-drawer-layout"
      >
        <div
          id="form-drawer-content"
          data-cy="form-drawer-content"
          className="flex flex-col h-full"
        >
          <Form
            id="form-drawer-form"
            data-cy="form-drawer-form"
            form={form}
            layout="vertical"
          >
            <Form.Item
              id="FormName"
              data-cy="FormName"
              label={
                <span
                  id="form-name-label"
                  data-cy="form-name-label"
                  className="text-md my-2 font-semibold text-gray-700"
                >
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
                id="form-name-input"
                data-cy="form-name-input"
                allowClear
                size="large"
                placeholder={`Enter ${formCategories?.name} name`}
                className="text-sm w-full h-10"
              />
            </Form.Item>
            <Form.Item
              id="categoryDescription"
              data-cy="categoryDescription"
              label={
                <span
                  id="form-description-label"
                  data-cy="form-description-label"
                  className="text-md my-2 font-semibold text-gray-700"
                >
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
                id="form-description-textarea"
                data-cy="form-description-textarea"
                allowClear
                rows={4}
                placeholder={`Enter ${formCategories?.name} description`}
              />
            </Form.Item>
            <Row
              id="form-drawer-date-row"
              data-cy="form-drawer-date-row"
              gutter={[16, 24]}
              className="mb-8"
            >
              <Col
                id="form-drawer-start-date-col"
                data-cy="form-drawer-start-date-col"
                lg={12}
                sm={24}
                xs={24}
              >
                <Form.Item
                  id="form-drawer-start-date-item"
                  data-cy="form-drawer-start-date-item"
                  name="surveyStartDate"
                  label={
                    <span
                      id="form-drawer-start-date-label"
                      data-cy="form-drawer-start-date-label"
                      className="text-md my-2 font-semibold text-gray-700"
                    >
                      {formCategories?.name} Start Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select start date' },
                  ]}
                >
                  <DatePicker
                    id="form-drawer-start-date-picker"
                    data-cy="form-drawer-start-date-picker"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select Start Date"
                    className="w-full h-10"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col
                id="form-drawer-end-date-col"
                data-cy="form-drawer-end-date-col"
                lg={12}
                sm={24}
                xs={24}
              >
                <Form.Item
                  id="form-drawer-end-date-item"
                  data-cy="form-drawer-end-date-item"
                  name="surveyEndDate"
                  label={
                    <span
                      id="form-drawer-end-date-label"
                      data-cy="form-drawer-end-date-label"
                      className="text-md my-2 font-semibold text-gray-700"
                    >
                      {formCategories?.name} End Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select end date' },
                    ({ getFieldValue }) => ({
                      /* eslint-disable-next-line @typescript-eslint/naming-convention */
                      validator(_, value) {
                        /* eslint-enable-next-line @typescript-eslint/naming-convention */
                        if (
                          !value ||
                          !getFieldValue('surveyStartDate') ||
                          value.isAfter(getFieldValue('surveyStartDate'))
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('End date must be after start date'),
                        );
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    id="form-drawer-end-date-picker"
                    data-cy="form-drawer-end-date-picker"
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
              id="form-drawer-anonymous-item"
              data-cy="form-drawer-anonymous-item"
              name="isAnonymous"
              label={
                <span
                  id="form-drawer-anonymous-label"
                  data-cy="form-drawer-anonymous-label"
                  className="text-md my-2 font-semibold text-gray-700"
                >
                  Allow to be anonymous
                </span>
              }
              valuePropName="checked"
              initialValue={false}
            >
              <Switch
                id="form-drawer-anonymous-switch"
                data-cy="form-drawer-anonymous-switch"
                size="small"
              />
            </Form.Item>
            <Form.Item
              id="form-drawer-permissions-item"
              data-cy="form-drawer-permissions-item"
              label={
                <span
                  id="form-drawer-permissions-label"
                  data-cy="form-drawer-permissions-label"
                  className="text-md my-2 font-semibold text-gray-700"
                >
                  Permitted Employees to view results
                </span>
              }
            >
              <Select
                id="form-drawer-permissions-select"
                data-cy="form-drawer-permissions-select"
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
                  <Select.Option
                    id={`employee-option-${employee.id}`}
                    data-cy={`employee-option-${employee.id}`}
                    key={employee.id}
                    value={employee.id}
                  >
                    {isEmployeesLoading ? (
                      <Spin
                        data-cy={`employee-option-spinner-${employee.id}`}
                        size="small"
                      />
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
              {/* <Collapse>
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
              </Collapse> */}
            </Form.Item>

            <Form.Item
              id="form-drawer-actions-item"
              data-cy="form-drawer-actions-item"
            >
              <div
                id="form-drawer-actions-container"
                data-cy="form-drawer-actions-container"
                className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-8"
              >
                <Button
                  id="form-drawer-cancel-button"
                  data-cy="form-drawer-cancel-button"
                  onClick={handleCloseDrawer}
                  className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  id="form-drawer-submit-button"
                  data-cy="form-drawer-submit-button"
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
