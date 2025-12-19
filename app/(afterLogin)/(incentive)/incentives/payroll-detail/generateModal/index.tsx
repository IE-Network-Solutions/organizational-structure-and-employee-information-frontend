import { useGenerateIncentive } from '@/store/server/features/incentive/project/mutation';
import {
  useFetchAllPayPeriod,
  useFetchIncentiveSessions,
} from '@/store/server/features/incentive/project/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Form, Modal, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const GenerateModal: React.FC = () => {
  const { showGenerateModal, setShowGenerateModal, isSwitchOn, setIsSwitchOn } =
    useIncentiveStore();
  const [form] = Form.useForm();

  const { data: payPeriodData } = useFetchAllPayPeriod();
  const { data: allSessions } = useFetchIncentiveSessions();

  const { mutate: generateIncentive } = useGenerateIncentive();

  const handleModalClose = () => {
    setShowGenerateModal(false);
    form.resetFields();
  };

  const handleSwitchChange = (checked: boolean) => {
    setIsSwitchOn(checked);
    if (checked) {
      form.resetFields(['selectSession']);
    }
  };
  const handleSubmit = () => {
    const formValues = form.getFieldsValue();
    const formattedValues = {
      sessionId: formValues?.session,
      payPeriodId: formValues?.payPeriod,
      generateAll: formValues?.generateAll,
    };
    generateIncentive(formattedValues, {
      onSuccess: () => {
        handleModalClose();
      },
    });
  };

  return (
    <Modal
      data-cy="generate-modal"
      title={
        <div
          id="generate-modal-title"
          data-cy="generate-modal-title"
          className="font-semibold text-md"
        >
          Generate Incentive
        </div>
      }
      open={showGenerateModal}
      onCancel={handleModalClose}
      centered
      closable={false}
      footer={
        <div
          id="generate-modal-footer"
          data-cy="generate-modal-footer"
          className="flex items-center justify-center gap-3 mt-2"
        >
          <Button
            id="generate-modal-cancel-button"
            data-cy="generate-modal-cancel-button"
            onClick={handleModalClose}
            className="bg-[#f5f5f5] text-[#000] my-3 px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
            id="generate-modal-submit-button"
            data-cy="generate-modal-submit-button"
            type="primary"
            className="px-5 my-3 font-medium shadow-none"
            onClick={handleSubmit}
          >
            Generate
          </Button>
        </div>
      }
    >
      <Form
        id="generate-modal-form"
        data-cy="generate-modal-form"
        requiredMark={false}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="my-4"
        initialValues={{ generateAll: false }}
      >
        <Form.Item
          id="generate-modal-form-generate-all"
          data-cy="generate-modal-form-generate-all"
          label={
            <div
              id="generate-modal-form-generate-all-label"
              data-cy="generate-modal-form-generate-all-label"
              className="text-medium font-md"
            >
              Generate for all unpaid Incentives
            </div>
          }
          valuePropName="checked"
          name="generateAll"
        >
          <Switch
            id="generate-modal-form-generate-all-switch"
            data-cy="generate-modal-form-generate-all-switch"
            onChange={handleSwitchChange}
          />
        </Form.Item>

        <Form.Item
          data-cy="generate-modal-form-session"
          rules={
            !isSwitchOn
              ? [{ required: true, message: 'Please select a session!' }]
              : []
          }
          label={
            <span
              id="generate-modal-form-session-label"
              data-cy="generate-modal-form-session-label"
              className="font-semibold"
            >
              Select Session
              <span
                id="generate-modal-form-session-required"
                data-cy="generate-modal-form-session-required"
                className="text-red-500"
              >
                *
              </span>
            </span>
          }
          name="session"
          id="incentiveSessionId"
        >
          {isSwitchOn ? (
            <Select
              id="generate-modal-form-session-select-disabled"
              data-cy="generate-modal-form-session-select-disabled"
              disabled
              size="large"
              placeholder="You are generating all unpaid incentives."
            />
          ) : (
            <Select
              id="generate-modal-form-session-select"
              data-cy="generate-modal-form-session-select"
              mode="multiple"
              size="large"
              placeholder="Select session"
            >
              {allSessions?.items?.map((session: any) => (
                <Select.Option
                  id={`generate-modal-form-session-option-${session?.id}`}
                  data-cy={`generate-modal-form-session-option-${session?.id}`}
                  value={session?.id}
                  key={session?.id}
                >
                  {session?.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          data-cy="generate-modal-form-pay-period"
          rules={[{ required: true, message: 'Please select a pay period!' }]}
          label={
            <span
              id="generate-modal-form-pay-period-label"
              data-cy="generate-modal-form-pay-period-label"
              className="font-semibold"
            >
              Pay Period
              <span
                id="generate-modal-form-pay-period-required"
                data-cy="generate-modal-form-pay-period-required"
                className="text-red-500"
              >
                *
              </span>
            </span>
          }
          className="mb-4"
          id="incentivePayPeriodId"
          name="payPeriod"
        >
          <Select
            id="generate-modal-form-pay-period-select"
            data-cy="generate-modal-form-pay-period-select"
            size="large"
            className="font-normal text-sm mb-8"
            placeholder="select pay period"
            allowClear
          >
            {payPeriodData?.map((payPeriod: any) => (
              <Select.Option
                id={`generate-modal-form-pay-period-option-${payPeriod?.id}`}
                data-cy={`generate-modal-form-pay-period-option-${payPeriod?.id}`}
                value={payPeriod?.id}
                key={payPeriod?.id}
              >
                {`${dayjs(payPeriod?.startDate).format('YYYY-MM-DD')} — ${dayjs(payPeriod?.endDate).format('YYYY-MM-DD')}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GenerateModal;
