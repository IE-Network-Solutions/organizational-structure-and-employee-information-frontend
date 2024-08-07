import { Col, Form, Row, Select, Input } from 'antd';
import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';
const { Option } = Select;

const BankInformationForm = () => {
  const currentBankForm = UseSetCategorizedFormData('Bank information');
  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Bank Account
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['bankInformation', 'bankName']}
            id="bankInformationBankName"
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
            name={['bankInformation', 'branch']}
            id="bankInformationBranch"
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
            name={['bankInformation', 'accountName']}
            label="Account Name"
            id="bankInformationAccountName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['bankInformation', 'accountNumber']}
            id="bankInformationAccountNumber"
            label="Account Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields
        formTitle="bankInformation"
        fields={currentBankForm.form}
      />
      <AddCustomField
        formTitle="Bank information"
        customEmployeeInformationForm={currentBankForm}
      />
    </div>
  );
};

export default BankInformationForm;
