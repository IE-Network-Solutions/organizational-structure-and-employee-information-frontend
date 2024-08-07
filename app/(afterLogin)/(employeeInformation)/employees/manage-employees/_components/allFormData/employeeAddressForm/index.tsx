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
            id="userAddressCountryId"
            label="Country"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'addressCity']}
            label="City"
            id="userAddressCityId"
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
            name={['address', 'addressSubcity']}
            label="Subcity/zone"
            id="userAddressSubCityId"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'addressWoreda']}
            label="Woreda"
            id="userAddressWoredaId"
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
            name={['address', 'addressPrimaryAddress']}
            label="Primary Address"
            id="userAddressPrimaryAddressId"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'addressHouseNumber']}
            label="House Number"
            id="userAddressHouseNumberId"
            rules={[{ required: true }]}
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
