import { Form, Input, Card, Button } from 'antd';
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
            className="flex items-center gap-2"
          >
            <Button
              data-cy="bank-account-form-icon"
              className="border border-[#73adff]"
              type="default"
              icon={
                <AccountBalanceIcon
                  fontSize="small"
                  className="text-[#73adff]"
                />
              }
            ></Button>
            <span
              data-cy="bank-account-form-title"
              className="text-sm font-normal text-[#4d4d4d]"
            >
              Bank Information
            </span>
          </div>
        }
        className="h-full"
        bodyStyle={{ padding: '16px' }}
      >
        <Form.Item
          name={['bankInformation', 'bankName']}
          label={
            <span
              className="text-sm font-normal text-[#030712]"
              data-cy="bank-account-form-bank-name-label"
            >
              Bank Name{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`bank-account-form-bank-name-required`}
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Bank Name is required' }]}
        >
          <Input placeholder="Bank Name" />
        </Form.Item>

        <Form.Item
          name={['bankInformation', 'accountNumber']}
          label={
            <span
              className="text-sm font-normal text-[#030712]"
              data-cy="bank-account-form-account-number-label"
            >
              Account Number{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`bank-account-form-account-number-required`}
              >
                *
              </span>
            </span>
          }
          rules={[
            { required: true, message: 'Account Number is required' },
            { pattern: /^[0-9]+$/, message: 'Must be numeric' },
          ]}
        >
          <Input placeholder="123456789" />
        </Form.Item>

        <Form.Item
          className="text-sm font-normal text-[#030712] w-full"
          name={['bankInformation', 'branch']}
          id="bankInformationBranch"
          data-cy="bankInformationBranch"
          label={
            <span
              className="mb-1 text-sm font-normal text-[#030712]"
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
    </div>
  );
};

export default BankInformationForm;
