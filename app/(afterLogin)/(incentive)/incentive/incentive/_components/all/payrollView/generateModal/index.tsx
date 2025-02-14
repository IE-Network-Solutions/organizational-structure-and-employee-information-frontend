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
    generateIncentive(formattedValues);
  };

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
        initialValues={{ generateAll: false }}
      >
        <Form.Item
          label={
            <div className="text-medium font-md">
              Generate for all unpaid Incentives
            </div>
          }
          valuePropName="checked"
          name="generateAll"
        >
          <Switch onChange={handleSwitchChange} />
        </Form.Item>

        <Form.Item
          rules={
            !isSwitchOn
              ? [{ required: true, message: 'Please select a session!' }]
              : []
          }
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
            <Select mode="multiple" size="large" placeholder="Select session">
              {allSessions?.items?.map((session: any) => (
                <Select.Option value={session?.id} key={session?.id}>
                  {session?.name}
                </Select.Option>
              ))}
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
