import { useFetchAllPayPeriod } from '@/store/server/features/incentive/project/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Form, Modal, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const GenerateModal: React.FC = () => {
  const { showGenerateModal, setShowGenerateModal, isSwitchOn, setIsSwitchOn } =
    useIncentiveStore();
  const [form] = Form.useForm();

  const { data: payPeriodData, isLoading: responseLoading } =
    useFetchAllPayPeriod();

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
  const handleSubmit = () => {};
  return (
    <Modal
      title={<div className="font-semibold text-md">Generate Incentive</div>}
      open={showGenerateModal}
      onCancel={handleModalClose}
      centered
      closable={false}
      footer={
        <div className="flex items-center justify-center gap-3 mt-2">
          <Button
            onClick={handleModalClose}
            className="bg-[#f5f5f5] text-[#000] my-3 px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
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
        requiredMark={false}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="my-4"
      >
        <Form.Item
          label={
            <div className="text-medium font-md">
              Generate for all unpaid Incentives
            </div>
          }
          valuePropName="checked"
        >
          <Switch onChange={handleSwitchChange} />
        </Form.Item>

        <Form.Item
          rules={[{ required: true, message: 'Please select a session!' }]}
          label={
            <span className="font-semibold">
              Select Session<span className="text-red-500">*</span>
            </span>
          }
          name="session"
          id="incentiveSessionId"
        >
          {isSwitchOn ? (
            <Select
              disabled
              size="large"
              placeholder="You are generating all unpaid incentives."
            />
          ) : (
            <Select mode="multiple" size="large" placeholder="select session">
              <Select.Option value="1">Branch A</Select.Option>
              <Select.Option value="2">Branch B</Select.Option>
              <Select.Option value="3">Branch C</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please select a pay period!' }]}
          label={
            <span className="font-semibold">
              Pay Period<span className="text-red-500">*</span>
            </span>
          }
          className="mb-4"
          id="incentivePayPeriodId"
          name="payPeriod"
        >
          <Select
            size="large"
            className="font-normal text-sm mb-8"
            placeholder="select pay period"
            allowClear
          >
            {payPeriodData?.map((payPeriod: any) => (
              <Select.Option value={payPeriod?.id} key={payPeriod?.id}>
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
