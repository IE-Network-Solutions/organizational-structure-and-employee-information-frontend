import React from 'react';
import { Modal, Form, Button, ConfigProvider } from 'antd';
import { IoCloseOutline } from 'react-icons/io5';
import OptionRow from '../optionRow';
import type { PayrollGenerationType } from '@/store/server/features/payroll/payrollApproval/generationTypes';

interface Props {
  onClose: () => void;
  onGenerate: (data: PayrollGenerationOptions) => void;
  loading?: boolean;
  /** When true, modal copy reflects regenerating existing payroll (vs first-time generate). */
  isRegenerate?: boolean;
  /** Generation types already approved for this pay period; they can't be generated again. */
  lockedTypes?: PayrollGenerationType[];
}

export interface PayrollGenerationOptions {
  includePayroll: boolean;
  includeIncentive: boolean;
  /** PP Monthly (scoreBy MONTH) payouts for the pay period. */
  includeMonthlyVariablePay: boolean;
  /** PP Quarterly (scoreBy SESSION) payouts for the pay period. */
  includeSessionVariablePay: boolean;
}

type OptionField = keyof PayrollGenerationOptions;

const OPTIONS: {
  field: OptionField;
  type: PayrollGenerationType;
  title: string;
  description: string;
  cy: string;
}[] = [
  {
    field: 'includePayroll',
    type: 'PAYROLL',
    title: 'Salary',
    description: 'Basic pay with allowances, deductions, pension and tax',
    cy: 'payroll',
  },
  {
    field: 'includeIncentive',
    type: 'INCENTIVE',
    title: 'Incentive',
    description: 'Incentive amounts for this pay period',
    cy: 'incentive',
  },
  {
    field: 'includeMonthlyVariablePay',
    type: 'PP_MONTHLY',
    title: 'Monthly performance',
    description: 'Performance pay from the monthly scores',
    cy: 'vp-monthly',
  },
  {
    field: 'includeSessionVariablePay',
    type: 'PP_QUARTERLY',
    title: 'Quarterly performance',
    description: 'Performance pay from the quarterly scores',
    cy: 'vp-quarterly',
  },
];

const GeneratePayrollModal: React.FC<Props> = ({
  onClose,
  onGenerate,
  loading = false,
  isRegenerate = false,
  lockedTypes = [],
}) => {
  const [form] = Form.useForm();
  const isLocked = (type: PayrollGenerationType) => lockedTypes.includes(type);
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

  return (
    // eslint-disable-next-line local-rules/data-cy-required
    <ConfigProvider
      data-cy="payroll-generate-modal-config-provider"
      theme={{
        token: {
          colorPrimary: '#1E40AF',
          borderRadius: 6,
          fontFamily: 'inherit',
        },
        components: {
          Button: {
            fontWeight: 500,
          },
        },
      }}
    >
      <Modal
        data-cy="payroll-generate-modal"
        title={
          <h2
            className="m-0 text-base font-semibold leading-tight text-[#161A2C]"
            data-cy="payroll-generate-modal-title-view-text"
          >
            {isRegenerate ? 'Regenerate payroll' : 'Generate payroll'}
          </h2>
        }
        open={true}
        maskClosable={!loading}
        onCancel={() => {
          if (!loading) onClose();
        }}
        closeIcon={
          <IoCloseOutline
            size={22}
            className="text-slate-500 hover:text-[#161A2C]"
          />
        }
        width={480}
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
            className="px-6"
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
            className="px-6 shadow-none"
          >
            {isRegenerate ? 'Continue' : 'Generate'}
          </Button>,
        ]}
      >
        <div
          data-cy="payroll-generate-modal-body-view-container"
          className="mt-4"
        >
          <p
            className="m-0 mb-4 text-[13px] text-slate-500"
            data-cy="payroll-generate-modal-description"
          >
            Choose what to generate for this pay period.
          </p>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changedValues, values) => {
              if (Object.values(values).some(Boolean)) setSelectionError('');
            }}
            initialValues={{
              includePayroll: !isLocked('PAYROLL'),
              includeIncentive: false,
              includeMonthlyVariablePay: false,
              includeSessionVariablePay: false,
            }}
            data-cy="payroll-generate-modal-form"
          >
            <div
              className="flex flex-col gap-3"
              data-cy="payroll-generate-modal-options"
            >
              {OPTIONS.map(({ field, type, title, description, cy }) => {
                const locked = isLocked(type);
                return (
                  <Form.Item
                    key={field}
                    name={field}
                    valuePropName="checked"
                    noStyle
                    data-cy={`payroll-generate-modal-${cy}-form-item`}
                  >
                    <OptionRow
                      title={title}
                      description={
                        locked
                          ? 'Already approved for this pay period'
                          : description
                      }
                      disabled={locked}
                      status={
                        locked
                          ? { label: 'Approved', tone: 'success' }
                          : undefined
                      }
                      dataCy={`payroll-generate-modal-${cy}`}
                    />
                  </Form.Item>
                );
              })}
            </div>

            {selectionError && (
              <div
                role="alert"
                className="mt-3 text-[13px] text-red-600"
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
