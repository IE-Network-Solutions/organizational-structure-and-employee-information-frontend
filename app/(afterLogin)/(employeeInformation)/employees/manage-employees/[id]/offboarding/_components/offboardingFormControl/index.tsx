'use client';

import {
  useAddOffboardingItem,
  useAddTerminationItem,
  useUpdateOffboardingItem,
} from '@/store/server/features/employees/offboarding/mutation';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { Form, DatePicker, Select, Button, Modal, Input, Divider } from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

const { Option } = Select;

const OffboardingFormControl: React.FC<any> = () => {
  const [form] = Form.useForm();
  const { mutate: updateOffboardingItem } = useUpdateOffboardingItem();
  const { mutate: createOffboardingItem } = useAddOffboardingItem();
  const { mutate: createTerminationItem } = useAddTerminationItem();

  const {
    setIsModalVisible,
    newOption,
    addCustomOption,
    customOptions,
    isModalVisible,
    newTerminationOption,
    setNewOption,
    isTerminationModalVisible,
    isEmploymentFormVisible,
    setIsTerminationModalVisible,
    setIsEmploymentFormVisible,
    setNewTerminationOption,
    addCustomTerminationOption,
  } = useOffboardingStore();

  const handleStatusChange = (value: string) => {
    if (value === 'addItem') {
      setIsModalVisible(true);
    } else if (value === 'addTerminationOption') {
      setIsTerminationModalVisible(true);
    }
  };

  const handleAddEmploymentStatus = () => {
    if (newOption) {
      addCustomOption(newOption);
      createOffboardingItem({ name: newOption });
      setNewOption('');
      setIsModalVisible(false);
    }
  };
  const handleAddTerminationReason = () => {
    if (newTerminationOption) {
      addCustomTerminationOption(newTerminationOption);
      createTerminationItem({ name: newTerminationOption });
      setNewTerminationOption('');
      setIsTerminationModalVisible(false);
    }
  };

  const onFinish = (values: any) => {
    updateOffboardingItem(values);
  };
  return (
    <Modal
      title="Add Employment Status"
      okText="Submit"
      open={isEmploymentFormVisible}
      onOk={handleAddTerminationReason}
      onCancel={() => setIsEmploymentFormVisible(false)}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="effectiveDate"
          label="Effective Date"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-[250px]" />
        </Form.Item>
        <Form.Item name="terminationType" label="Termination Type">
          <Select id="selectTerminationType" allowClear className="w-[250px]">
            <Option value="voluntary">Voluntary</Option>
            <Option value="involuntary">Involuntary</Option>
          </Select>
        </Form.Item>
        <Form.Item name="terminationReason" label="Termination Reason">
          <Select
            id="selectTerminationReason"
            allowClear
            className="w-[250px]"
            onChange={handleStatusChange}
          >
            <Option value="resignation">Resignation</Option>
            <Option value="layoff">Layoff</Option>
            {customOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
            <Option
              value="addTerminationOption"
              className="text-blue border-t-[1px]"
            >
              <PlusOutlined size={20} /> Add Item
            </Option>
          </Select>
        </Form.Item>
        <Form.Item name="eligibleForRehire" label="Eligible for Rehire">
          <Select id="selectEligibleForHire" allowClear className="w-[250px]">
            <Option value="yes">Yes</Option>
            <Option value="no">No</Option>
          </Select>
        </Form.Item>
        <Form.Item name="comment" label="Comment">
          <TextArea rows={4} />
        </Form.Item>
        <Divider dashed />
        <Form.Item
          name="commentForApprover"
          label="Comment for the Approver(s)"
        >
          <TextArea rows={4} />
        </Form.Item>
        <div className="flex justify-end space-x-4">
          <Button type="default">Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>
        </div>
      </Form>
      <Modal
        title="Add New Employment Status"
        okText="Add"
        open={isModalVisible}
        onOk={handleAddEmploymentStatus}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Enter new employment status"
        />
      </Modal>
      <Modal
        title="Add New Termination Reason"
        okText="Add"
        open={isTerminationModalVisible}
        onOk={handleAddTerminationReason}
        onCancel={() => setIsTerminationModalVisible(false)}
      >
        <Input
          value={newTerminationOption}
          onChange={(e) => setNewTerminationOption(e.target.value)}
          placeholder="Enter new termination reason"
        />
      </Modal>
    </Modal>
  );
};

export default OffboardingFormControl;
