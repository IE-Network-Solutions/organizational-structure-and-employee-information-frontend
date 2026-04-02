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
    <Card
      title="Personal Info"
      className="my-6 mt-0"
      id="personal-data-update-user-info-card"
      data-cy="personal-data-update-user-info-card"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => handleSaveChanges(values)}
        id="personal-data-update-user-info-form"
        data-cy="personal-data-update-user-info-form"
      >
        <Row
          gutter={[16, 24]}
          id="personal-data-update-user-info-row"
          data-cy="personal-data-update-user-info-row"
        >
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
              id="personal-data-update-user-info-first-name-form-item"
              data-cy="personal-data-update-user-info-first-name-form-item"
            >
              <Input
                id="personal-data-update-user-info-first-name-input"
                data-cy="personal-data-update-user-info-first-name-input"
              />
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
              id="personal-data-update-user-info-last-name-form-item"
              data-cy="personal-data-update-user-info-last-name-form-item"
            >
              <Input
                id="personal-data-update-user-info-last-name-input"
                data-cy="personal-data-update-user-info-last-name-input"
              />
            </Form.Item>
          </Col>
          <Col
            lg={10}
            id="personal-data-update-user-info-middle-name-col"
            data-cy="personal-data-update-user-info-middle-name-col"
          >
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
              id="personal-data-update-user-info-middle-name-form-item"
              data-cy="personal-data-update-user-info-middle-name-form-item"
            >
              <Input
                id="personal-data-update-user-info-middle-name-input"
                data-cy="personal-data-update-user-info-middle-name-input"
              />
            </Form.Item>
          </Col>
          <Col
            span={24}
            style={{ textAlign: 'right' }}
            id="personal-data-update-user-info-submit-col"
            data-cy="personal-data-update-user-info-submit-col"
          >
            <Button
              loading={isLoading}
              type="primary"
              htmlType="submit"
              id="personal-data-update-user-info-submit-btn"
              data-cy="personal-data-update-user-info-submit-btn"
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default UpdateUserInfo;
