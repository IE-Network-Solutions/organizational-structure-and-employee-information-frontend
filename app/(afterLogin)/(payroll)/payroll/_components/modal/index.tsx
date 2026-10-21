import React from 'react';
import {
  Modal,
  Form,
  Switch,
  Button,
  ConfigProvider,
} from 'antd';
import { IoCloseOutline } from 'react-icons/io5';

interface Props {
  onClose: () => void;
  onGenerate: (data: PayrollGenerationOptions) => void;
  loading?: boolean;
  /** When true, modal copy reflects regenerating existing payroll (vs first-time generate). */
  isRegenerate?: boolean;
}

export interface PayrollGenerationOptions {
  includePayroll: boolean;
  includeIncentive: boolean;
  /** PP Monthly (scoreBy MONTH) payouts for the pay period. */
  includeMonthlyVariablePay: boolean;
  /** PP Quarterly (scoreBy SESSION) payouts for the pay period. */
  includeSessionVariablePay: boolean;
}

const GeneratePayrollModal: React.FC<Props> = ({
  onClose,
  onGenerate,
  loading = false,
  isRegenerate = false,
}) => {
  const [form] = Form.useForm();
  const [selectionError, setSelectionError] = React.useState('');

  const handleGenerate = () => {
    const values = form.getFieldsValue();
    const generationOptions = {
      includePayroll: Boolean(values.includePayroll),
      includeIncentive: Boolean(values.includeIncentive),
      includeMonthlyVariablePay: Boolean(values.includeMonthlyVariablePay),
      includeSessionVariablePay: Boolean(values.includeSessionVariablePay),
    };

    if (!Object.values(generationOptions).some(Boolean)) {
      setSelectionError('Select at least one payment type');
      return;
    }

    setSelectionError('');
    onGenerate(generationOptions);
  };

  const customizeRequiredMark = (
    label: React.ReactNode,
    { required }: { required: boolean },
  ) => (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      data-cy="payroll-generate-modal-required-mark"
    >
      {label}
      {required && (
        <span
          style={{ color: '#ff4d4f' }}
          data-cy="payroll-generate-modal-required-asterisk"
        >
          *
        </span>
      )}
    </span>
  );

  return (
    // eslint-disable-next-line local-rules/data-cy-required
    <ConfigProvider
      data-cy="payroll-generate-modal-config-provider"
      theme={{
        token: {
          colorPrimary: '#2543b5',
          borderRadius: 6,
          fontFamily: 'inherit',
        },
        components: {
          Button: {
            fontWeight: 400,
          },
          Form: {
            labelColor: '#333333',
          },
        },
      }}
    >
      <Modal
        data-cy="payroll-generate-modal"
        title={
          <h2
            className="text-[16px] font-normal text-gray-900 m-0 leading-tight"
            data-cy="payroll-generate-modal-title-view-text"
          >
            {isRegenerate ? 'Regenerate Payroll' : 'Generate Payroll'}
          </h2>
        }
        open={true}
        maskClosable={!loading}
        onCancel={() => {
          if (!loading) onClose();
        }}
        closeIcon={
          <IoCloseOutline
            size={24}
            className="text-gray-600 hover:text-gray-900"
          />
        }
        width={520}
        centered
        footer={[
          <Button
            key="cancel"
            data-cy="payroll-generate-modal-cancel-click-button"
            type="default"
            htmlType="button"
            size="large"
            disabled={loading}
            onClick={onClose}
            className="px-6 !font-normal !text-[#4D4D4D] border border-solid !border-[#D9D9D9]"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            data-cy="payroll-generate-modal-submit-click-button"
            type="primary"
            htmlType="button"
            size="large"
            loading={loading}
            onClick={handleGenerate}
            className="px-6 !font-normal shadow-none"
          >
            {isRegenerate ? 'Continue' : 'Generate'}
          </Button>,
        ]}
      >
        <div
          data-cy="payroll-generate-modal-body-view-container"
          className="border border-gray-200 rounded-lg p-6 mt-6 mb-2"
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark={customizeRequiredMark}
            onValuesChange={(_, values) => {
              if (Object.values(values).some(Boolean)) setSelectionError('');
            }}
            initialValues={{
              includePayroll: true,
              includeIncentive: false,
              includeMonthlyVariablePay: false,
              includeSessionVariablePay: false,
            }}
            data-cy="payroll-generate-modal-form"
          >
            <div data-cy="payroll-generate-modal-payroll-toggle-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-payroll-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include Payroll
                  </span>
                }
                name="includePayroll"
                valuePropName="checked"
                className="mb-5"
              >
                <Switch data-cy="payroll-generate-modal-payroll-toggle-switch" />
              </Form.Item>
            </div>

            <div data-cy="payroll-generate-modal-incentive-toggle-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-incentive-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include Incentive
                  </span>
                }
                name="includeIncentive"
                valuePropName="checked"
                className="mb-5"
                required
              >
                <Switch data-cy="payroll-generate-modal-incentive-toggle-switch" />
              </Form.Item>
            </div>

            <div data-cy="payroll-generate-modal-vp-monthly-toggle-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-vp-monthly-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include PP Monthly
                  </span>
                }
                name="includeMonthlyVariablePay"
                valuePropName="checked"
                className="mb-5"
              >
                <Switch data-cy="payroll-generate-modal-vp-monthly-toggle-switch" />
              </Form.Item>
            </div>

            <div data-cy="payroll-generate-modal-vp-quarterly-toggle-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-vp-quarterly-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include PP Quarterly
                  </span>
                }
                name="includeSessionVariablePay"
                valuePropName="checked"
                className="mb-5"
              >
                <Switch data-cy="payroll-generate-modal-vp-quarterly-toggle-switch" />
              </Form.Item>
            </div>

            {selectionError && (
              <div
                role="alert"
                className="mb-4 text-sm text-red-500"
                data-cy="payroll-generate-modal-selection-error"
              >
                {selectionError}
              </div>
            )}

          </Form>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default GeneratePayrollModal;
