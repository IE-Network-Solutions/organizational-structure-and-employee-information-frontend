import React from 'react';
import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import AddCustomField from '../../addCustomField';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateEmail, validateName } from '@/utils/validation';
import dayjs from 'dayjs';

const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const emergencyContactForm = UseSetCategorizedFormData('emergencyContact');

  const disableFutureDates = (current: any) => {
    return current && current > dayjs().endOf('day');
  };

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Emergency Contact
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'firstName']}
            label="Full Name"
            id="emergencyContactFullName"
            rules={[
              {
                validator: (rule, value) =>
                  !validateName('Full Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Full Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'lastName']}
            label="Last Name"
            id="emergencyContactLastName"
            rules={[
              {
                validator: (rule, value) =>
                  !validateName('Last Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Last Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'email']}
            label="Email Address"
            id="emergencyContactEmailAddress"
            rules={[
              {
                validator: (rule, value) =>
                  !validateEmail(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateEmail(value) || '')),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'gender']}
            label="Gender"
            id="emergencyContactGender"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select gender" allowClear>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'dateOfBirth']}
            label="Date of Birth"
            id="emergencyContactDateOfBirth"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" disabledDate={disableFutureDates} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'nationality']}
            label="Nationality"
            id="emergencyContactNationality"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select nationality" allowClear>
              {nationalities?.items?.map((nationality: any, index: number) => (
                <Option key={index} value={nationality?.id}>
                  {nationality?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields
        formTitle="emergencyContact"
        fields={emergencyContactForm.form}
      />
      <AddCustomField
        formTitle="emergencyContact"
        customEmployeeInformationForm={emergencyContactForm}
      />
    </div>
  );
};

export default EmergencyContactForm;
