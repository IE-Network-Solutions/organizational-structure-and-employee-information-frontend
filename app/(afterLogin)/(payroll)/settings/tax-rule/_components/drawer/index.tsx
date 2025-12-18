import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateTaxRule,
  useUpdateTaxRule,
} from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';

<style jsx global data-cy="payroll-tax-rule-drawer-style">{`
  @media (max-width: 767px) {
    .input-number-mobile .ant-input-number,
    .input-number-mobile .ant-input-number-input {
      height: 48px !important;
      font-size: 20px !important;
      padding: 12px 16px !important;
    }
    .input-number-mobile .ant-input-number-handler-wrap {
      width: 32px !important;
    }
    .input-number-mobile .ant-input-number-handler {
      height: 24px !important;
      font-size: 20px !important;
    }
  }
`}</style>;

const Drawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer, currentTaxRule } = useDrawerStore();

  const {
    mutate: createTaxRule,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
  } = useCreateTaxRule();
  const {
    mutate: updateTaxRule,
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
  } = useUpdateTaxRule();

  const [form] = Form.useForm();
  useEffect(() => {
    if (currentTaxRule) {
      form.setFieldsValue({
        name: currentTaxRule.name,
        'maximum-income': Number(currentTaxRule.maxIncome),
        'minimum-income': Number(currentTaxRule.minIncome),
        rate: Number(currentTaxRule.rate),
        deduction: Number(currentTaxRule.deduction),
      });
    }
  }, [currentTaxRule, form]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      form.resetFields();
      closeDrawer();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const onFinish = async (values: any) => {
    const taxRuleData = {
      name: values.name,
      minIncome: values['minimum-income'],
      maxIncome: values['maximum-income'],
      rate: values.rate,
      deduction: values.deduction,
    };

    try {
      if (currentTaxRule) {
        updateTaxRule({ id: currentTaxRule.id, values: taxRuleData });
      } else {
        createTaxRule(taxRuleData);
      }
    } catch (error) {}
  };

  return (
    <CustomDrawerLayout
      data-cy="payroll-tax-rule-drawer-view-component"
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span
          id="payroll-tax-rule-drawer-title-view-text"
          data-cy="payroll-tax-rule-drawer-title-view-text"
          className=" flex justify-center text-xl font-semibold"
        >
          {currentTaxRule ? 'Edit Tax Rule' : 'Define New Tax Rule'}
        </span>
      }
      width="700px"
      footer={
        <div
          id="payroll-tax-rule-drawer-footer-view-container"
          data-cy="payroll-tax-rule-drawer-footer-view-container"
          className="flex justify-center items-center w-full h-full"
        >
          <div
            id="payroll-tax-rule-drawer-footer-actions-view-container"
            data-cy="payroll-tax-rule-drawer-footer-actions-view-container"
            className="flex justify-between items-center gap-4 p-4"
          >
            <Button
              id="payroll-tax-rule-drawer-cancel-click-button"
              data-cy="payroll-tax-rule-drawer-cancel-click-button"
              type="default"
              className="h-10 px-10"
              onClick={() => {
                (closeDrawer(), form.resetFields());
              }}
            >
              Cancel
            </Button>

            <Button
              id="payroll-tax-rule-drawer-submit-click-button"
              data-cy="payroll-tax-rule-drawer-submit-click-button"
              type="primary"
              className="h-10 px-10"
              onClick={() => form.submit()}
              loading={currentTaxRule ? isUpdateLoading : isCreateLoading}
            >
              {currentTaxRule ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      }
    >
      <Form
        id="tax-rule-form"
        data-cy="payroll-tax-rule-drawer-form-submit-form"
        layout="vertical"
        form={form}
        className="px-3"
        onFinish={onFinish}
      >
        <Form.Item
          id="payroll-tax-rule-name-view-formitem"
          data-cy="payroll-tax-rule-name-view-formitem"
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input
            id="payroll-tax-rule-name-view-input"
            data-cy="payroll-tax-rule-name-view-input"
            placeholder="Full Name"
            className="h-12 mt-2"
          />
        </Form.Item>

        <Form.Item
          id="payroll-tax-rule-minimum-income-view-formitem"
          data-cy="payroll-tax-rule-minimum-income-view-formitem"
          label="Minimum Income"
          name="minimum-income"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the minimum income!',
            },
            {
              validator: (rule, value) => {
                const maxIncome = form.getFieldValue('maximum-income');
                if (value && maxIncome && Number(value) >= Number(maxIncome)) {
                  return Promise.reject(
                    new Error(
                      'Minimum Income must be less than Maximum Income',
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          valuePropName="value"
          getValueFromEvent={(value) =>
            value === null || value === undefined || value === ''
              ? undefined
              : value
          }
        >
          <InputNumber
            id="payroll-tax-rule-minimum-income-view-input"
            data-cy="payroll-tax-rule-minimum-income-view-input"
            className="h-12 mt-2 w-full input-number-mobile"
            placeholder="Input Minimum Income"
            min={0}
            step={1}
            controls={true}
            addonAfter={null}
          />
        </Form.Item>

        <Form.Item
          id="payroll-tax-rule-maximum-income-view-formitem"
          data-cy="payroll-tax-rule-maximum-income-view-formitem"
          label="Maximum Income"
          name="maximum-income"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the maximum income!',
            },
            {
              validator: (rule, value) => {
                const minIncome = form.getFieldValue('minimum-income');
                if (value && minIncome && Number(value) <= Number(minIncome)) {
                  return Promise.reject(
                    new Error(
                      'Maximum Income must be greater than Minimum Income',
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          valuePropName="value"
          getValueFromEvent={(value) =>
            value === null || value === undefined || value === ''
              ? undefined
              : value
          }
        >
          <InputNumber
            id="payroll-tax-rule-maximum-income-view-input"
            data-cy="payroll-tax-rule-maximum-income-view-input"
            className="h-12 mt-2 w-full input-number-mobile"
            placeholder="Input Maximum Income"
            min={0}
            step={1}
            controls={true}
            addonAfter={null}
          />
        </Form.Item>

        <Form.Item
          id="payroll-tax-rule-rate-view-formitem"
          data-cy="payroll-tax-rule-rate-view-formitem"
          label="Rate in %"
          name="rate"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the tax rate!',
            },
          ]}
          valuePropName="value"
          getValueFromEvent={(value) =>
            value === null || value === undefined || value === ''
              ? undefined
              : value
          }
        >
          <InputNumber
            id="payroll-tax-rule-rate-view-input"
            data-cy="payroll-tax-rule-rate-view-input"
            className="w-full h-12 mt-2 input-number-mobile"
            min={0}
            max={100}
            step={0.01}
            placeholder="Input Tax Rate"
            controls={true}
            addonAfter={
              <span style={{ color: '#bdbdbd', fontWeight: 600 }}>%</span>
            }
          />
        </Form.Item>

        <Form.Item
          id="payroll-tax-rule-deduction-view-formitem"
          data-cy="payroll-tax-rule-deduction-view-formitem"
          label="Deduction"
          name="deduction"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the deduction!',
            },
          ]}
          valuePropName="value"
          getValueFromEvent={(value) =>
            value === null || value === undefined || value === ''
              ? undefined
              : value
          }
        >
          <InputNumber
            id="payroll-tax-rule-deduction-view-input"
            data-cy="payroll-tax-rule-deduction-view-input"
            className="w-full h-12 mt-2 input-number-mobile"
            min={0}
            step={1}
            placeholder="Input Deduction Amount"
            controls={true}
            addonAfter={null}
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
