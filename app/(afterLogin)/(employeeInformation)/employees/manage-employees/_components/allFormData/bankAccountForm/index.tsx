import { Form, Input, Card } from 'antd';
import React from 'react';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const BankInformationForm = () => {
  const currentBankForm = UseSetCategorizedFormData('bankInformation');

  return (
    <div id="bank-info-form" data-cy="bank-info-form">
      <Card
        title={
          <div
            data-cy="bank-account-form-title-div"
            className="flex items-center gap-2 text-gray-600"
          >
            <div
              data-cy="bank-account-form-icon-div"
              className="p-1.5 bg-blue-50 rounded text-blue-500"
            >
              <AccountBalanceIcon fontSize="small" />
            </div>
            <span
              data-cy="bank-account-form-title"
              className="text-sm font-medium"
            >
              Bank Information
            </span>
          </div>
        }
        className="h-full shadow-sm"
        bodyStyle={{ padding: '16px' }}
      >
        <Form.Item
          name={['bankInformation', 'bankName']}
          label="Bank Name"
          rules={[{ required: true, message: 'Bank Name is required' }]}
        >
          <Input placeholder="Bank Name" />
        </Form.Item>

        <Form.Item
          name={['bankInformation', 'accountNumber']}
          label="Account Number"
          rules={[
            { required: true, message: 'Account Number is required' },
            { pattern: /^[0-9]+$/, message: 'Must be numeric' },
          ]}
        >
          <Input placeholder="123456789" />
        </Form.Item>

        <Form.Item
          className="font-semibold text-xs w-full"
          name={['bankInformation', 'branch']}
          id="bankInformationBranch"
          data-cy="bankInformationBranch"
          label={
            <span
              className="mb-1 font-semibold text-xs"
              data-cy="bank-account-form-branch-label"
            >
              Branch
            </span>
          }
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
          <Input id="bank-info-branch-input" data-cy="bank-info-branch-input" />
        </Form.Item>
        <DynamicFormFields
          formTitle="bankInformation"
          fields={currentBankForm.form}
          data-cy="bank-info-dynamic-fields"
        />
      </Card>

      {/* <Row gutter={16} id="bank-info-row-main" data-cy="bank-info-row-main">
        <Col
          xs={24}
          sm={12}
          id="bank-info-bank-name-col"
          data-cy="bank-info-bank-name-col"
        >
            <Form.Item
            className="font-semibold text-xs w-full"
            name={['bankInformation', 'branch']}
            id="bankInformationBranch"
            data-cy="bankInformationBranch"
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="bank-account-form-branch-label"
              >
                Branch
              </span>
            }
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
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="bank-account-form-branch-label"
              >
                Branch
              </span>
            }
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
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="bank-account-form-account-name-label"
              >
                Account Name
              </span>
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
      </Row> */}

      {/* <AddCustomField
        formTitle="bankInformation"
        customEmployeeInformationForm={currentBankForm}
        className="mt-4"
        id="bank-info-custom-field"
        data-cy="bank-info-custom-field"
      /> */}
    </div>
  );
};

export default BankInformationForm;
