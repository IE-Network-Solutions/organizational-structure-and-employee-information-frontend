import React from 'react';
import { Col, Form, Input, Row, Select } from 'antd';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import AddCustomField from '../../addCustomField';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateName, validatePhoneNumber } from '@/utils/validation';

const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const emergencyContactForm = UseSetCategorizedFormData('emergencyContact');

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
            label="First Name"
            id="emergencyContactFirstName"
            rules={[
              {
                required: true,
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
        <Col xs={24} sm={8}>
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'middleName']}
            label="Middle Name"
            id="emergencyContactMiddleName"
            rules={[
              {
                validator: (rule, value) =>
                  !value || !validateName('Middle Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Middle Name', value) || ''),
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
                required: true,
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
            name={['emergencyContact', 'phoneNumber']}
            label="Phone Number"
            id="phoneNumber"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validatePhoneNumber(value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validatePhoneNumber(value) || ''),
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
