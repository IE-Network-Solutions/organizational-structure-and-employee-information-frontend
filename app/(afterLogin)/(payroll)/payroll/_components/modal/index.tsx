import React from 'react';
import { Modal, Form, Switch, DatePicker, Select, Button, ConfigProvider } from 'antd';
import { IoCloseOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';

interface Props {
  onClose: () => void;
  onGenerate: (data: Incentive) => void;
}

export interface Incentive {
  includeIncentive: boolean;
}

const GeneratePayrollModal: React.FC<Props> = ({ onClose, onGenerate }) => {
  const [form] = Form.useForm();
  
  const { data: payPeriodData } = useGetPayPeriod();

  React.useEffect(() => {
    if (payPeriodData && payPeriodData.length > 0) {
      // Find the currently active (OPEN) pay period
      const activePeriod = payPeriodData.find((p: any) => p.status === 'OPEN') || payPeriodData[0];
      if (activePeriod && !form.getFieldValue('payPeriod')) {
        form.setFieldsValue({ payPeriod: activePeriod.id });
      }
    }
  }, [payPeriodData, form]);

  const handleGenerate = () => {
    form
      .validateFields()
      .then((values) => {
        onGenerate({ includeIncentive: values.includeIncentive });
      })
      .catch(() => {
        // validation errors are displayed by antd Form; no console output needed
      });
  };

  const customizeRequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
    <React.Fragment>
      {label}
      {required && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>}
    </React.Fragment>
  );

  return (
    <ConfigProvider
    data-cy="payroll-generate-modal-config-provider"
      theme={{
        token: {
          colorPrimary: '#2543b5',
          borderRadius: 6,
          fontFamily: 'inherit',
        },
        components: {
          Modal: {
            titleFontSize: 18,
            titleColor: '#000000',
          },
          Form: {
            labelColor: '#333333',
          }
        }
      }}
    >
      <Modal
        data-cy="payroll-generate-modal"
        title={
          <span 
            data-cy="payroll-generate-modal-title-view-text" 
            className="font-bold text-lg text-gray-900 tracking-wide"
          >
            Generate Payroll
          </span>
        }
        open={true}
        onCancel={onClose}
        closeIcon={<IoCloseOutline size={24} className="text-gray-600 hover:text-gray-900" />}
        width={520}
        centered
        footer={[
          <Button 
            key="cancel" 
            data-cy="payroll-generate-modal-cancel-click-button"
            onClick={onClose} 
            className="px-5"
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            data-cy="payroll-generate-modal-submit-click-button"
            type="primary" 
            onClick={handleGenerate} 
            className="px-5"
          >
            Generate
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
            initialValues={{ includeIncentive: true }}
          >
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

            <div data-cy="payroll-generate-modal-daterange-view-container">
              <Form.Item
                label={
                  <span 
                    data-cy="payroll-generate-modal-daterange-label-view-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Date
                  </span>
                }
                name="date"
                className="mb-5"
              >
                <DatePicker 
                  data-cy="payroll-generate-modal-daterange-view-input"
                  style={{ width: '100%' }} 
                  placeholder="Select date" 
                  size="large"
                />
              </Form.Item>
            </div>

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
              >
                <Select 
                  data-cy="payroll-generate-modal-payperiod-view-select"
                  placeholder="Select pay period" 
                  size="large"
                  options={payPeriodData?.map((period: any) => ({
                    value: period.id,
                    label: `${dayjs(period.startDate).format('MMM DD, YYYY')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
                  })) || []}
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
