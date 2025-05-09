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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create Employee Survey
    </div>
  );

  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        loading={createLoading}
      />
      <CustomButton
        title={'Add'}
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        loading={createLoading}
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        name="employee_survey"
      >
        <Form.List name="employees">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-4 items-center mb-4"
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
                    />
                  </Form.Item>

                  {/* Score Input - span 4 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'score']}
                    label="Score"
                    rules={[{ required: true, message: 'Please input score' }]}
                    className="col-span-4"
                  >
                    <InputNumber
                      min={0}
                      max={10}
                      className="w-full"
                      placeholder="Enter score"
                    />
                  </Form.Item>

                  {/* Remove Button - span 2 */}
                  <div className="col-span-1 flex justify-start pt-1">
                    <Button
                      danger
                      type="text"
                      icon={<MdDelete />}
                      onClick={() => remove(name)}
                      className="bg-red-500 text-white mt-1"
                    />
                  </div>
                </div>
              ))}

              <Form.Item className="flex justify-end">
                <Button onClick={() => add()} icon={<PlusOutlined />}>
                  Add Employee
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </CustomDrawerLayout>
  );
};

export default EmployeeSurveyDrawer;
