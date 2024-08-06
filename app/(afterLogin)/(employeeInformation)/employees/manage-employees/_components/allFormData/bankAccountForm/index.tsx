import { Col, Form, Row, Select, Input } from 'antd';
import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
const { Option } = Select;

const BankInformationForm = () => {
  const { bankInfoForm, setBankInfoForm } = useEmployeeManagmentStore();

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Bank Account
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'bankName'}
            label="Bank Name"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a option and change input text above"
              allowClear
            >
              <Option value="bank 1">bank 1</Option>
              <Option value="bank 2">bank 2</Option>
              <Option value="bank 3">bank 3</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'branch'}
            label="Branch"
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
            name={'accountName'}
            label="Account Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'accountNumber'}
            label="Account Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <DynamicFormFields fields={bankInfoForm.form} />
        <AddCustomField
          formTitle="address"
          setNewValue={setBankInfoForm}
          customEmployeeInformationForm={bankInfoForm}
        />
      </Row>
    </div>
  );
};

export default BankInformationForm;
