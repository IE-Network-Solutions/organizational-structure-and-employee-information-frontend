import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';

const EmployeeAddressForm = () => {
  const currentAddressForm = UseSetCategorizedFormData('Address');

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Address
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'addressCountry']}
            label="Country"
            id="addressCountryId"
            rules={[{ required: true, message: 'Please enter the country' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'addressCity']}
            label="City"
            id="addressCityId"
            rules={[{ required: true, message: 'Please enter the city' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields formTitle="address" fields={currentAddressForm.form} />
      <AddCustomField
        formTitle="Address"
        customEmployeeInformationForm={currentAddressForm}
      />
    </div>
  );
};

export default EmployeeAddressForm;
