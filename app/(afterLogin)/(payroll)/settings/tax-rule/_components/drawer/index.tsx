import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateTaxRule,
  useUpdateTaxRule,
} from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';

<style jsx global>{`
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
        'maximum-income': currentTaxRule.maxIncome,
        'minmum-income': currentTaxRule.minIncome,
        rate: currentTaxRule.rate,
        deduction: currentTaxRule.deduction,
      });
    }
  }, [currentTaxRule, form]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      form.resetFields();
      closeDrawer();
    }
  }, [isCreateLoading, isUpdateSuccess]);

  const onFinish = async (values: any) => {
    const taxRuleData = {
      name: values.name,
      minIncome: parseFloat(values['minmum-income']),
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
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className=" flex justify-center text-xl font-semibold">
          {currentTaxRule ? 'Edit Tax Rule' : 'Define New Tax Rule'}
        </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4 p-4">
            <Button
              type="default"
              className="h-10 px-10"
              onClick={() => {
                closeDrawer(), form.resetFields();
              }}
            >
              Cancel
            </Button>

            <Button
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
        layout="vertical"
        form={form}
        className="px-3"
        onFinish={onFinish}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input placeholder="Full Name" className="h-12 mt-2" />
        </Form.Item>

        <Form.Item
          label="Maximum Income"
          name="maximum-income"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the maximum income!',
            },
          ]}
        >
          <InputNumber
            className="h-12 mt-2 w-full input-number-mobile"
            placeholder="Input Maximum Income"
            min={0}
            step={1}
            controls={true}
            addonAfter={null}
          />
        </Form.Item>

        <Form.Item
          label="Minimum Income"
          name="minmum-income"
          rules={[
            { required: true, message: 'Please input the minimum income!' },
          ]}
        >
          <InputNumber
            className="h-12 mt-2 w-full input-number-mobile"
            placeholder="Input Minimum Income"
            min={0}
            step={1}
            controls={true}
            addonAfter={null}
          />
        </Form.Item>

        <Form.Item
          label="Rate in %"
          name="rate"
          rules={[{ required: true, message: 'Please input the tax rate!' }]}
        >
          <InputNumber
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
          label="Deduction"
          name="deduction"
          rules={[{ required: true, message: 'Please input the deduction!' }]}
        >
          <InputNumber
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
