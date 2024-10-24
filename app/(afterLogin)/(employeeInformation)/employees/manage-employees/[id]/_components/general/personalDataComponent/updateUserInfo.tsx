import { useForm } from 'antd/es/form/Form';
import React, { useEffect } from 'react';
import { Card, Col, Form, Row, Input, Button } from 'antd';
import { useUpdateEmployeeInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';

function UpdateUserInfo({ employeeData }: any) {
  const { mutate: updateEmployeeInformation, isLoading } =
    useUpdateEmployeeInformation();
  const { setEdit } = useEmployeeManagementStore();

  const [form] = useForm();

  const handleSaveChanges = (values: any) => {
    updateEmployeeInformation(
      {
        id: employeeData?.id,
        values,
      },
      {
        onSuccess: () => {
          setEdit('general');
        },
      },
    );
  };

  useEffect(() => {
    if (employeeData) {
      form.setFieldsValue({
        firstName: employeeData?.firstName ?? '',
        middleName: employeeData?.middleName ?? '',
        lastName: employeeData?.lastName ?? '',
      });
    }
  }, [employeeData, form]);

  return (
    <Card title="Personal Info" className="my-6 mt-0">
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => handleSaveChanges(values)}
      >
        <Row gutter={[16, 24]}>
          <Col lg={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              className="text-gray-950 text-xs w-full"
              rules={[
                {
                  required: true,
                  message: 'Please enter the first name',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              className="text-gray-950 text-xs w-full"
              rules={[
                {
                  required: true,
                  message: 'Please enter the last name',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col lg={10}>
            <Form.Item
              name="middleName"
              label="Middle Name"
              className="text-gray-950 text-xs w-full"
              rules={[
                {
                  required: true,
                  message: 'Please enter the middle name',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button loading={isLoading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default UpdateUserInfo;
