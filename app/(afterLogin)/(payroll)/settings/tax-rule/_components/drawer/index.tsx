import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
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

  const handleClose = () => {
    form.resetFields();
    closeDrawer();
  };
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
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateSuccess, isUpdateSuccess]);

  const onFinish = async (values: any) => {
    const taxRuleData = {
      name: values.name,
      minIncome: parseFloat(values['minimum-income']),
      maxIncome: parseFloat(values['maximum-income']),
      rate: parseFloat(values.rate),
      deduction: parseFloat(values.deduction),
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
    <Modal
      data-cy="payroll-tax-rule-drawer-view-component"
      open={isDrawerVisible}
      onCancel={handleClose}
      footer={null}
      centered
      width={640}
      destroyOnClose
      maskClosable={false}
      closable={false}
    >
      <div
        id="payroll-tax-rule-modal-header-view-container"
        data-cy="payroll-tax-rule-modal-header-view-container"
        className="flex items-center justify-between px-2 pt-2 pb-6"
      >
        <h2
          id="payroll-tax-rule-drawer-title-view-text"
          data-cy="payroll-tax-rule-drawer-title-view-text"
          className="text-xl font-bold text-gray-900"
        >
          {currentTaxRule ? 'Edit Tax Rule' : 'Define New Tax Rule'}
        </h2>

        <button
          id="payroll-tax-rule-modal-close-click-button"
          data-cy="payroll-tax-rule-modal-close-click-button"
          type="button"
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div
        id="payroll-tax-rule-modal-body-view-container"
        data-cy="payroll-tax-rule-modal-body-view-container"
        className="px-2 pb-2"
      >
        <div
          id="payroll-tax-rule-modal-card-view-container"
          data-cy="payroll-tax-rule-modal-card-view-container"
          className="border border-gray-200 rounded-lg p-6"
        >
      <Form
        id="tax-rule-form"
        data-cy="payroll-tax-rule-drawer-form-submit-form"
        layout="vertical"
        form={form}
        className="px-1"
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
            placeholder="Rule name"
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
            placeholder="Input minimum Income"
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
            placeholder="Input maximum Income"
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
            placeholder="Input tax rate"
            controls={true}
            addonAfter={
              <span
                data-cy="tax-rule-components-drawer-index-tsx-index-span-270"
                style={{ color: '#bdbdbd', fontWeight: 600 }}
              >
                %
              </span>
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
            placeholder="0"
            controls={true}
            addonAfter={null}
          />
        </Form.Item>
      </Form>
        </div>
      </div>

      <div
        id="payroll-tax-rule-drawer-footer-view-container"
        data-cy="payroll-tax-rule-drawer-footer-view-container"
        className="px-2 pb-2 pt-6 flex justify-end space-x-3"
      >
        <Button
          id="payroll-tax-rule-drawer-cancel-click-button"
          data-cy="payroll-tax-rule-drawer-cancel-click-button"
          type="default"
          className="h-10 px-10"
          onClick={handleClose}
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
          {currentTaxRule ? 'Update' : 'Continue'}
        </Button>
      </div>
    </Modal>
  );
};

export default Drawer;
