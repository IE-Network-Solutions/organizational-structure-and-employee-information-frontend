import React from 'react';
import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import AddCustomField from '../../addCustomField';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateEmail, validateName } from '@/utils/validation';

const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const emergencyContactForm = UseSetCategorizedFormData('Emergency contact');

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Emergency Contact
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactFullName']}
            label="Full Name"
            id="emergencyContactFullName"
            rules={[
              {
                validator: (_, value) =>
                  !validateName('Full Name',value)
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateName('Full Name',value) || '')),
              },
            ]} 
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactLastName']}
            label="Last Name"
            id="emergencyContactLastName"
            rules={[
              {
                validator: (_, value) =>
                  !validateName('Last Name',value)
                    ? Promise.resolve()
                    : Promise.reject(new Error(validateName('Last Name',value) || '')),
              },
            ]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactEmailAddress']}
            label="Email Address"
            id="emergencyContactEmailAddress"
            rules={[
              {
                validator: (_, value) =>
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
            name={['emergencyContact', 'emergencyContactGender']}
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
            name={['emergencyContact', 'emergencyContactDateOfBirth']}
            label="Date of Birth"
            id="emergencyContactDateOfBirth"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactNationality']}
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
        formTitle="Emergency contact"
        customEmployeeInformationForm={emergencyContactForm}
      />
    </div>
  );
};

export default EmergencyContactForm;
