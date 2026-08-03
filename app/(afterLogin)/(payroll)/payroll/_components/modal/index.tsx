import React from 'react';
import {
  Modal,
  Form,
  Switch,
  Select,
  Button,
  ConfigProvider,
  Alert,
} from 'antd';
import { IoCloseOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import {
  PayrollView,
  payrollViewToIncludeFlags,
} from '@/store/uistate/features/payroll/payroll/view';

interface Props {
  onClose: () => void;
  onGenerate: (data: GeneratePayrollFormValues) => void;
  loading?: boolean;
  /** When true, modal copy reflects regenerating existing payroll (vs first-time generate). */
  isRegenerate?: boolean;
  /** Active list view — used to prefill include switches. */
  payrollView?: PayrollView;
  /** Preferred pay period when opening the modal. */
  defaultPayPeriodId?: string;
}

export interface GeneratePayrollFormValues {
  includePayroll: boolean;
  includeVariablePay: boolean;
  includeIncentive: boolean;
  payPeriodId: string;
}

const GeneratePayrollModal: React.FC<Props> = ({
  onClose,
  onGenerate,
  loading = false,
  isRegenerate = false,
  payrollView = 'payroll',
  defaultPayPeriodId,
}) => {
  const [form] = Form.useForm();
  const includePayroll = Form.useWatch('includePayroll', form);
  const includeVariablePay = Form.useWatch('includeVariablePay', form);
  const includeIncentive = Form.useWatch('includeIncentive', form);

  const { data: payPeriodData } = useGetPayPeriod();

  const hasAtLeastOneInclude =
    Boolean(includePayroll) ||
    Boolean(includeVariablePay) ||
    Boolean(includeIncentive);

  const isTaxOnly =
    !includePayroll && (includeVariablePay || includeIncentive);

  React.useEffect(() => {
    const flags = payrollViewToIncludeFlags(payrollView);
    const activePeriod =
      payPeriodData?.find((p: any) => p.id === defaultPayPeriodId) ||
      payPeriodData?.find((p: any) => p.status === 'OPEN') ||
      payPeriodData?.[0];

    form.setFieldsValue({
      ...flags,
      payPeriod: defaultPayPeriodId || activePeriod?.id,
    });
  }, [payPeriodData, form, payrollView, defaultPayPeriodId]);

  const handleGenerate = () => {
    form
      .validateFields()
      .then((values) => {
        if (
          !values.includePayroll &&
          !values.includeVariablePay &&
          !values.includeIncentive
        ) {
          form.setFields([
            {
              name: 'includePayroll',
              errors: ['Select at least one option to include'],
            },
          ]);
          return;
        }
        onGenerate({
          includePayroll: Boolean(values.includePayroll),
          includeVariablePay: Boolean(values.includeVariablePay),
          includeIncentive: Boolean(values.includeIncentive),
          payPeriodId: values.payPeriod,
        });
      })
      .catch(() => {
        // validation errors are displayed by antd Form
      });
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
            disabled={!hasAtLeastOneInclude}
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
            initialValues={{
              ...payrollViewToIncludeFlags(payrollView),
              payPeriod: defaultPayPeriodId,
            }}
            data-cy="payroll-generate-modal-form"
          >
            <p
              className="text-sm font-medium text-gray-700 mb-3"
              data-cy="payroll-generate-modal-include-section-label"
            >
              Include in this run
            </p>

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
                className="mb-4"
              >
                <Switch data-cy="payroll-generate-modal-payroll-toggle-switch" />
              </Form.Item>
            </div>

            <div data-cy="payroll-generate-modal-vp-toggle-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-vp-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include Variable Pay
                  </span>
                }
                name="includeVariablePay"
                valuePropName="checked"
                className="mb-4"
              >
                <Switch data-cy="payroll-generate-modal-vp-toggle-switch" />
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
              >
                <Switch data-cy="payroll-generate-modal-incentive-toggle-switch" />
              </Form.Item>
            </div>

            {isTaxOnly ? (
              <Alert
                type="info"
                showIcon
                className="mb-5"
                data-cy="payroll-generate-modal-tax-only-alert"
                message="VP-only or Incentive-only runs calculate tax only."
              />
            ) : null}

            <div data-cy="payroll-generate-modal-payperiod-view-container">
              <Form.Item
                label={
                  <span
                    data-cy="payroll-generate-modal-payperiod-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Pay Period
                  </span>
                }
                name="payPeriod"
                className="mb-0"
                rules={[
                  { required: true, message: 'Please select a pay period' },
                ]}
              >
                <Select
                  data-cy="payroll-generate-modal-payperiod-view-select"
                  placeholder="Select pay period"
                  size="large"
                  options={
                    payPeriodData?.map((period: any) => ({
                      value: period.id,
                      label: `${dayjs(period.startDate).format('MMM DD, YYYY')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
                    })) || []
                  }
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default GeneratePayrollModal;
