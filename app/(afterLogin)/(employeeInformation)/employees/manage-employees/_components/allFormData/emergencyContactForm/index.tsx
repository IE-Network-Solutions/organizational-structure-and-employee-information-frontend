import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import React from 'react';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import AddCustomField from '../../addCustomField';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';

const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const EmregencyContactForm = UseSetCategorizedFormData('Emergency contact');

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Emergency Contact
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactfullName']}
            label="Full Name"
            id="emergencyContactfullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactlastName']}
            id="emergencyContactlastName"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactemailAddress']}
            label="Email Address"
            id="emergencyContactemailAddress"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactgender']}
            label="Gender"
            id="emergencyContactgender"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'emergencyContactDateOfBirth']}
            id="emergencyContactDateOfBirth"
            label="Date Of Birth"
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
            <Select
              placeholder="Select an option and change input text above"
              allowClear
            >
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
        fields={EmregencyContactForm.form}
      />
      <AddCustomField
        formTitle="Emergency contact"
        customEmployeeInformationForm={EmregencyContactForm}
      />
    </div>
  );
};

export default EmergencyContactForm;
