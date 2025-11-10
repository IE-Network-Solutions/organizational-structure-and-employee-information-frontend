import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCreatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/pensionRules/pensionRulesStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

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
  const { isDrawerVisible, closeDrawer } = useDrawerStore();
  const { tenantId } = useAuthenticationStore();

  const {
    mutate: createPensionRule,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
  } = useCreatePensionRule();

  const [form] = Form.useForm();
  
  // Reset form when drawer opens
  useEffect(() => {
    if (isDrawerVisible) {
      form.resetFields();
    }
  }, [isDrawerVisible, form]);

  useEffect(() => {
    if (isCreateSuccess) {
      form.resetFields();
      closeDrawer();
    }
  }, [isCreateSuccess, form, closeDrawer]);

  const onFinish = async (values: any) => {
    // Only include the fields required by the backend DTO
    const pensionRuleData = {
      name: values.name,
      description: values.description || '',
      employer: Number(values.employer),
      employee: Number(values.employee),
      tenantId: tenantId,
    };

    try {
      // Only create, never update from drawer
      createPensionRule(pensionRuleData);
    } catch (error) {}
  };

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className=" flex justify-center text-xl font-semibold">
          Define New Pension Rule
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
                closeDrawer();
                form.resetFields();
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              className="h-10 px-10"
              onClick={() => form.submit()}
              loading={isCreateLoading}
            >
              Create
            </Button>
          </div>
        </div>
      }
    >
      <Form
        id="pension-rule-form"
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
          <Input placeholder="Pension Rule Name" className="h-12 mt-2" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter description (optional)"
            className="mt-2"
          />
        </Form.Item>

        <Form.Item
          label="Employee Contribution (%)"
          name="employee"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the employee contribution!',
            },
            {
              type: 'number',
              min: 0,
              max: 100,
              message: 'Employee contribution must be between 0 and 100!',
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
            className="h-12 mt-2 w-full input-number-mobile"
            placeholder="Input Employee Contribution"
            min={0}
            max={100}
            step={0.01}
            controls={true}
            addonAfter={
              <span style={{ color: '#bdbdbd', fontWeight: 600 }}>%</span>
            }
          />
        </Form.Item>

        <Form.Item
          label="Employer Contribution (%)"
          name="employer"
          rules={[
            {
              type: 'number',
              required: true,
              message: 'Please input the employer contribution!',
            },
            {
              type: 'number',
              min: 0,
              max: 100,
              message: 'Employer contribution must be between 0 and 100!',
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
            className="w-full h-12 mt-2 input-number-mobile"
            placeholder="Input Employer Contribution"
            min={0}
            max={100}
            step={0.01}
            controls={true}
            addonAfter={
              <span style={{ color: '#bdbdbd', fontWeight: 600 }}>%</span>
            }
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;

