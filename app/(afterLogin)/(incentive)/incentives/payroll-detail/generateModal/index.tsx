import { useGenerateIncentive } from '@/store/server/features/incentive/project/mutation';
import {
  useFetchAllPayPeriod,
  useFetchIncentiveSessions,
} from '@/store/server/features/incentive/project/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Checkbox, Form, Modal, Select } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs from 'dayjs';
import React from 'react';

const GenerateModal: React.FC = () => {
  const { showGenerateModal, setShowGenerateModal, isSwitchOn, setIsSwitchOn } =
    useIncentiveStore();
  const [form] = Form.useForm();

  const { data: payPeriodData } = useFetchAllPayPeriod();
  const { data: allSessions } = useFetchIncentiveSessions();

  const { mutate: generateIncentive, isLoading: submitPending } =
    useGenerateIncentive();

  const resetFormAfterClose = () => {
    form.resetFields();
    setIsSwitchOn(false);
  };

  const handleModalClose = () => {
    setShowGenerateModal(false);
  };

  const handleSwitchChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setIsSwitchOn(checked);
    form.setFieldsValue({
      generateAll: checked,
    });
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
      destroyOnClose
      afterClose={resetFormAfterClose}
      title={
        <div
          id="generate-modal-title"
          data-cy="generate-modal-title"
          className="font-bold text-black opacity-70 text-base"
        >
          Generate Incentive
        </div>
      }
      open={showGenerateModal}
      onCancel={handleModalClose}
      centered
      closable
      footer={
        <div
          id="generate-modal-footer"
          data-cy="generate-modal-footer"
          className="flex justify-end gap-2"
        >
          <Button
            type="default"
            id="generate-modal-cancel-button"
            data-cy="generate-modal-cancel-button"
            onClick={handleModalClose}
            className="font-normal border border-[#D9D9D9]"
          >
            Cancel
          </Button>
          <Button
            id="generate-modal-submit-button"
            data-cy="generate-modal-submit-button"
            type="primary"
            className="font-normal"
            onClick={() => form.submit()}
            loading={submitPending}
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
        initialValues={{ generateAll: false }}
      >
        <Form.Item
          id="generate-modal-form-generate-all"
          data-cy="generate-modal-form-generate-all"
          className="border border-[#D9D9D9] rounded-lg p-2"
          valuePropName="checked"
          name="generateAll"
        >
          <Checkbox
            id="generate-modal-form-generate-all-checkbox"
            data-cy="generate-modal-form-generate-all-checkbox"
            className="text-sm font-normal text-black opacity-70"
            onChange={handleSwitchChange}
          >
            Generate for unpaid incentive
          </Checkbox>
          <p
            data-cy="generate-modal-form-generate-all-description"
            className="text-xs text-black opacity-45 px-6"
          >
            Generate incentive for unpaid recognition
          </p>
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
              className="font-normal text-sm mb-1 text-black"
            >
              Select Session{' '}
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
              className="h-10"
              placeholder="You are generating all unpaid incentives."
            />
          ) : (
            <Select
              id="generate-modal-form-session-select"
              data-cy="generate-modal-form-session-select"
              mode="multiple"
              className="h-10"
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
              className="font-normal text-sm mb-1 text-black"
            >
              Pay Period{' '}
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
            className="h-10"
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
