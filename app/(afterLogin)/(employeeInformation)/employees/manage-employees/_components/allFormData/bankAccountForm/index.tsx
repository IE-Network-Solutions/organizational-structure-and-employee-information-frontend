import { Col, Form, Row, Input } from 'antd';
import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';

const BankInformationForm = () => {
  const currentBankForm = UseSetCategorizedFormData('bankInformation');

  return (
    <div id="bank-info-form" data-cy="bank-info-form">
      <div
        className="text-gray-950 text-sm font-semibold mb-4 text-center"
        id="bank-info-title"
        data-cy="bank-info-title"
      >
        Bank Account
      </div>
      <Row gutter={16} id="bank-info-row-main" data-cy="bank-info-row-main">
        <Col
          xs={24}
          sm={12}
          id="bank-info-bank-name-col"
          data-cy="bank-info-bank-name-col"
        >
          <Form.Item
            className="font-semibold text-xs w-full"
            name={['bankInformation', 'bankName']}
            id="bankInformationBankName"
            data-cy="bankInformationBankName"
            label={
              <span className="mb-1 font-semibold text-xs">Bank Name</span>
            }
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('Bank Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Bank Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="bank-info-bank-name-input"
              data-cy="bank-info-bank-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="bank-info-branch-col"
          data-cy="bank-info-branch-col"
        >
          <Form.Item
            className="font-semibold text-xs w-full"
            name={['bankInformation', 'branch']}
            id="bankInformationBranch"
            data-cy="bankInformationBranch"
            label={<span className="mb-1 font-semibold text-xs">Branch</span>}
            rules={[
              {
                required: false,
                validator: (rule, value) =>
                  !validateName('Branch', value, false)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Branch', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="bank-info-branch-input"
              data-cy="bank-info-branch-input"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="bank-info-row-account"
        data-cy="bank-info-row-account"
      >
        <Col
          xs={24}
          sm={12}
          id="bank-info-account-name-col"
          data-cy="bank-info-account-name-col"
        >
          <Form.Item
            className="font-semibold text-xs w-full"
            name={['bankInformation', 'accountName']}
            label={
              <span className="mb-1 font-semibold text-xs">Account Name</span>
            }
            id="bankInformationAccountName"
            data-cy="bankInformationAccountName"
            rules={[
              {
                required: false,
                validator: (rule, value) =>
                  !validateName('Account Name', value, false)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Account Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="bank-info-account-name-input"
              data-cy="bank-info-account-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="bank-info-account-number-col"
          data-cy="bank-info-account-number-col"
        >
          <Form.Item
            className="font-semibold text-xs w-full"
            name={['bankInformation', 'accountNumber']}
            id="bankInformationAccountNumber"
            data-cy="bankInformationAccountNumber"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                id="bank-info-account-number-label"
                data-cy="bank-info-account-number-label"
              >
                Account Number
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please enter your bank account number',
              },
              {
                pattern: /^[0-9]{8,20}$/,
                message:
                  'Account number must be a valid number and 8–20 digits long',
              },
            ]}
          >
            <Input
              maxLength={20}
              placeholder="Enter bank account number"
              id="bank-info-account-number-input"
              data-cy="bank-info-account-number-input"
            />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields
        formTitle="bankInformation"
        fields={currentBankForm.form}
        data-cy="bank-info-dynamic-fields"
      />
      <AddCustomField
        formTitle="bankInformation"
        customEmployeeInformationForm={currentBankForm}
        className="mt-4"
        id="bank-info-custom-field"
        data-cy="bank-info-custom-field"
      />
    </div>
  );
};

export default BankInformationForm;
