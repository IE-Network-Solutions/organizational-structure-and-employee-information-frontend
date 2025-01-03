import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';
import {
  useCreateTaxRule,
  useUpdateTaxRule,
} from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';

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
        <span className="text-xl font-semibold">
          {currentTaxRule ? 'Edit Tax Rule' : 'Define New Tax Rule'}
        </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                closeDrawer(), form.resetFields();
              }}
            />
            <CustomButton
              title={currentTaxRule ? 'Update' : 'Create'}
              onClick={() => form.submit()}
              loading={currentTaxRule ? isUpdateLoading : isCreateLoading}
            />
          </div>
        </div>
      }
    >
      <Form
        id="tax-rule-form"
        layout="vertical"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input placeholder="Abraham Dulla" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Maximum Income"
          name="maximum-income"
          rules={[
            { required: true, message: 'Please input the maximum income!' },
          ]}
        >
          <Input type="number" placeholder="40000" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Minimum Income"
          name="minmum-income"
          rules={[
            { required: true, message: 'Please input the minimum income!' },
          ]}
        >
          <Input type="number" placeholder="40000" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Rate in %"
          name="rate"
          rules={[{ required: true, message: 'Please input the tax rate!' }]}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="10"
            className="w-full h-12"
          />
        </Form.Item>

        <Form.Item
          label="Deduction"
          name="deduction"
          rules={[{ required: true, message: 'Please input the deduction!' }]}
        >
          <Input type="number" placeholder="10" className="w-full h-12" />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
