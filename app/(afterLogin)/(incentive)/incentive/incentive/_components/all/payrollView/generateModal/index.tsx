import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { Button, Form, Modal, Select, Switch } from 'antd';
import React from 'react';

const GenerateModal: React.FC = () => {
  const { showGenerateModal, setShowGenerateModal } = useIncentiveStore();
  const [form] = Form.useForm();

  const handleModalClose = () => {
    setShowGenerateModal(false);
  };

  const onChange = (checked: boolean) => {};
  const handleSubmit = () => {};
  return (
    <Modal
      title="Generate Incentive"
      open={showGenerateModal}
      onClose={handleModalClose}
      centered
    >
      Generate for all unpaid Incentives
      <Switch onChange={onChange} />
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          rules={[{ required: true, message: 'Please select a session!' }]}
          label={<span className="font-semibold">Select Session</span>}
        >
          <Select size="large">
            <Select.Option value="1">Branch A</Select.Option>
            <Select.Option value="2">Branch B</Select.Option>
            <Select.Option value="3">Branch C</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please select a pay period!' }]}
          label={<span className="">Pay Period</span>}
        >
          <Select size="large">
            <Select.Option value="1">Branch A</Select.Option>
            <Select.Option value="2">Branch B</Select.Option>
            <Select.Option value="3">Branch C</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button>Cancel</Button>
          <Button htmlType="submit">Generate</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GenerateModal;
