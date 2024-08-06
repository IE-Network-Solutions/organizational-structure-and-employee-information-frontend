import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';

const EmployeeAddressForm = () => {
  const { addressForm, setAddressForm } = useEmployeeManagmentStore();
  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Address
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'addressCountry'}
            label="Country"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'addressCity'}
            label="City"
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
            name={'addressSubcity'}
            label="Subcity/zone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'addressWoreda'}
            label="Woreda"
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
            name={'addressPrimaryAddress'}
            label="Primary Address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'addressHouseNumber'}
            label="House Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields fields={addressForm.form} />
      <AddCustomField
        formTitle="address"
        setNewValue={setAddressForm}
        customEmployeeInformationForm={addressForm}
      />
    </div>
  );
};

export default EmployeeAddressForm;
