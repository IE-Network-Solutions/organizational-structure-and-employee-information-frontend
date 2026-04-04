import React, { useEffect } from 'react';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import { useCreatePensionRule } from '@/store/server/features/payroll/payroll/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/pensionRules/pensionRulesStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

<style data-cy="pension-components-drawer-index-tsx-index-style-8" jsx global>{`
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

  const handleClose = () => {
    closeDrawer();
    form.resetFields();
  };

  // Reset form when drawer opens
  useEffect(() => {
    if (isDrawerVisible) {
      form.resetFields();
    }
  }, [isDrawerVisible, form]);

  useEffect(() => {
    if (isCreateSuccess) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateSuccess]);

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
    <Modal
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
        id="payroll-pension-modal-header-view-container"
        data-cy="payroll-pension-modal-header-view-container"
        className="flex items-center justify-between px-2 pt-2 pb-6"
      >
        <h2
          id="payroll-pension-modal-title-view-text"
          data-cy="payroll-pension-modal-title-view-text"
          className="text-xl font-bold text-gray-900"
        >
          Define New Pension Rule
        </h2>

        <button
          id="payroll-pension-modal-close-click-button"
          data-cy="payroll-pension-modal-close-click-button"
          type="button"
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div
        id="payroll-pension-modal-body-view-container"
        data-cy="payroll-pension-modal-body-view-container"
        className="px-2 pb-2"
      >
        <div
          id="payroll-pension-modal-card-view-container"
          data-cy="payroll-pension-modal-card-view-container"
          className="border border-gray-200 rounded-lg p-6"
        >
          <Form
            id="pension-rule-form"
            data-cy="payroll-pension-modal-form-submit-form"
            layout="vertical"
            form={form}
            className="px-1"
            onFinish={onFinish}
          >
            <Form.Item
              id="payroll-pension-modal-name-view-formitem"
              data-cy="payroll-pension-modal-name-view-formitem"
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input the name!' }]}
            >
              <Input
                id="payroll-pension-modal-name-view-input"
                data-cy="payroll-pension-modal-name-view-input"
                placeholder="Rule name"
                className="h-12 mt-2"
              />
            </Form.Item>

            <Form.Item
              id="payroll-pension-modal-description-view-formitem"
              data-cy="payroll-pension-modal-description-view-formitem"
              label="Description"
              name="description"
            >
              <Input.TextArea
                id="payroll-pension-modal-description-view-textarea"
                data-cy="payroll-pension-modal-description-view-textarea"
                rows={3}
                placeholder="Enter description (optional)"
                className="mt-2"
              />
            </Form.Item>

            <Form.Item
              id="payroll-pension-modal-employee-view-formitem"
              data-cy="payroll-pension-modal-employee-view-formitem"
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
                id="payroll-pension-modal-employee-view-input"
                data-cy="payroll-pension-modal-employee-view-input"
                className="h-12 mt-2 w-full input-number-mobile"
                placeholder="Input employee contribution"
                min={0}
                max={100}
                step={0.01}
                controls={true}
                addonAfter={
                  <span
                    data-cy="pension-components-drawer-index-tsx-index-span-158"
                    style={{ color: '#bdbdbd', fontWeight: 600 }}
                  >
                    %
                  </span>
                }
              />
            </Form.Item>

            <Form.Item
              id="payroll-pension-modal-employer-view-formitem"
              data-cy="payroll-pension-modal-employer-view-formitem"
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
                id="payroll-pension-modal-employer-view-input"
                data-cy="payroll-pension-modal-employer-view-input"
                className="w-full h-12 mt-2 input-number-mobile"
                placeholder="Input employer contribution"
                min={0}
                max={100}
                step={0.01}
                controls={true}
                addonAfter={
                  <span
                    data-cy="pension-components-drawer-index-tsx-index-span-194"
                    style={{ color: '#bdbdbd', fontWeight: 600 }}
                  >
                    %
                  </span>
                }
              />
            </Form.Item>
          </Form>
        </div>
      </div>

      <div
        id="payroll-pension-modal-footer-view-container"
        data-cy="payroll-pension-modal-footer-view-container"
        className="px-2 pb-2 pt-6 flex justify-end space-x-3"
      >
        <Button
          id="payroll-pension-modal-cancel-click-button"
          data-cy="payroll-pension-modal-cancel-click-button"
          type="default"
          className="h-10 px-10"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          id="payroll-pension-modal-submit-click-button"
          data-cy="payroll-pension-modal-submit-click-button"
          type="primary"
          className="h-10 px-10"
          onClick={() => form.submit()}
          loading={isCreateLoading}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default Drawer;
