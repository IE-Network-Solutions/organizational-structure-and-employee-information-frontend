'use client';

import React, { useEffect } from 'react';
import { Form, Select, InputNumber, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { MdDelete } from 'react-icons/md';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreateEmployeeSurvey } from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface EmployeeSurveyDrawerProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeSurveyDrawer: React.FC<EmployeeSurveyDrawerProps> = ({
  onClose,
  open,
}) => {
  const [form] = Form.useForm();

  const { data: userData, isLoading } = useGetAllUsers(); // Anticipated structure: [{ id, fullName, imageUrl }]
  const users = userData?.items || [];
  const createdBy = useAuthenticationStore.getState().userId;
  const { data: month } = useGetActiveMonth();
  const { mutate: createEmployeeSurvey, isLoading: createLoading } =
    useCreateEmployeeSurvey();
  const handleDrawerClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: any) => {
    const monthId = month?.id; // Assuming you want to use the first monthId from the list
    const data = values.employees.map((entry: any) => ({
      ...entry,
      monthId, // add your monthId from state or props here
      createdBy,
    }));
    createEmployeeSurvey(data, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Employee Survey Created Successfully',
        });
        handleDrawerClose();
      },
    });
    // You can now mutate data using `useUpdateAppLog` etc.
  };

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      data-cy="employee-survey-drawer-header"
    >
      <span data-cy="employee-survey-drawer-header-text">
        Create Employee Survey
      </span>
    </div>
  );

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      data-cy="employee-survey-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        loading={createLoading}
        data-cy="employee-survey-drawer-cancel-button"
      />
      <CustomButton
        title={'Add'}
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        loading={createLoading}
        data-cy="employee-survey-drawer-add-button"
      />
    </div>
  );
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        employees: [
          { userId: null, score: null, monthId: month?.id, createdBy },
        ], // Initialize with one empty employee entry
      });
    }
  }, [open, form]);
  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      data-cy="employee-survey-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        name="employee_survey"
        data-cy="employee-survey-drawer-form"
        id="employeeSurveyDrawerForm"
      >
        <Form.List
          name="employees"
          data-cy="employee-survey-drawer-employees-list"
        >
          {(fields, { add, remove }) => (
            <div data-cy="employee-survey-drawer-employees-list-content">
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-4 items-center mb-4"
                  data-cy={`employee-survey-drawer-employee-item-${name}`}
                  id={`employeeSurveyDrawerEmployeeItem${name}`}
                >
                  {/* Employee Select - span 6 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'userId']}
                    label="Employee"
                    rules={[
                      { required: true, message: 'Please select employee' },
                    ]}
                    className="col-span-7"
                    data-cy={`employee-survey-drawer-employee-field-${name}`}
                    id={`employeeSurveyDrawerEmployeeField${name}`}
                  >
                    <Select
                      showSearch
                      placeholder="Search Employee"
                      className="w-full"
                      allowClear
                      loading={isLoading}
                      //   onChange={(value) => handleFilter(value, 'userId')}
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? '')
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={users?.map((item: any) => ({
                        ...item,
                        value: item?.id,
                        label:
                          item?.firstName +
                          ' ' +
                          item?.middleName +
                          ' ' +
                          item?.lastName,
                      }))}
                      data-cy={`employee-survey-drawer-employee-select-${name}`}
                      id={`employeeSurveyDrawerEmployeeSelect${name}`}
                    />
                  </Form.Item>

                  {/* Score Input - span 4 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'score']}
                    label="Score"
                    rules={[{ required: true, message: 'Please input score' }]}
                    className="col-span-4"
                    data-cy={`employee-survey-drawer-score-field-${name}`}
                    id={`employeeSurveyDrawerScoreField${name}`}
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      className="w-full"
                      placeholder="Enter score"
                      data-cy={`employee-survey-drawer-score-input-${name}`}
                      id={`employeeSurveyDrawerScoreInput${name}`}
                    />
                  </Form.Item>

                  {/* Remove Button - span 2 */}
                  <div
                    className="col-span-1 flex justify-start pt-1"
                    data-cy={`employee-survey-drawer-remove-button-container-${name}`}
                    id={`employeeSurveyDrawerRemoveButtonContainer${name}`}
                  >
                    <Button
                      danger
                      type="text"
                      icon={<MdDelete />}
                      onClick={() => remove(name)}
                      className="bg-red-500 text-white mt-1"
                      data-cy={`employee-survey-drawer-remove-button-${name}`}
                      id={`employeeSurveyDrawerRemoveButton${name}`}
                    />
                  </div>
                </div>
              ))}

              <Form.Item
                className="flex justify-end"
                data-cy="employee-survey-drawer-add-button-container"
                id="employeeSurveyDrawerAddButtonContainer"
              >
                <Button
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  data-cy="employee-survey-drawer-add-button"
                  id="employeeSurveyDrawerAddButton"
                >
                  Add Employee
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>
      </Form>
    </CustomDrawerLayout>
  );
};

export default EmployeeSurveyDrawer;
