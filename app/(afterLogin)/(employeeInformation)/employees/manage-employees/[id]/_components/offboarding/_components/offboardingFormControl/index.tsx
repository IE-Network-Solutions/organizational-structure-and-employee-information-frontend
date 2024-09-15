'use client';

import { useAddOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { Form, DatePicker, Select, Button, Modal, Input, Row } from 'antd';
import React from 'react';
import TextArea from 'antd/es/input/TextArea';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import moment from 'moment';
const { Option } = Select;

const OffboardingFormControl: React.FC<any> = ({
  userId,
}: {
  userId: string;
}) => {
  const [form] = Form.useForm();
  const { mutate: createOffboardingItem } = useAddOffboardingItem();
  const { data: employeeData } = useGetEmployee(userId);

  const {
    setIsModalVisible,
    newOption,
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

  const handleAddTerminationReason = () => {
    if (newTerminationOption) {
      addCustomTerminationOption(newTerminationOption);
      // createTerminationItem({ name: newTerminationOption });
      setNewTerminationOption('');
      setIsTerminationModalVisible(false);
    }
  };

  const onFinish = (values: any) => {
    values['effectiveDate'] = moment(values.effectiveDate).format('YYYY-MM-DD');
    values['userId'] = userId;

    values['jobInformationId'] = employeeData.employeeJobInformation[0].id;
    setIsEmploymentFormVisible(false);
    createOffboardingItem(values);
  };
  return (
    <Modal
      title="Add Employment Status"
      open={isEmploymentFormVisible}
      footer={false}
      onCancel={() => setIsEmploymentFormVisible(false)}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="effectiveDate"
          label="Effective Date"
          rules={[{ required: true, message: 'Effective Date is Required' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          name="type"
          label="Termination Type"
          rules={[{ required: true, message: 'Termination Type is Required ' }]}
        >
          <Select id="selectTerminationType" allowClear className="w-full">
            <Option value="Resignation">Resignation</Option>
            <Option value="Termination">Termination</Option>
            <Option value="Death">Death</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="reason"
          label="Termination Reason"
          rules={[
            { required: true, message: 'Termination Reason is Required ' },
          ]}
        >
          <Input id="selectTerminationReason" allowClear className="w-full" />
        </Form.Item>
        <Form.Item
          name="eligibleForRehire"
          label="Eligible for Rehire"
          rules={[
            { required: true, message: 'Eligible for Rehire is Required ' },
          ]}
        >
          <Select id="selectEligibleForHire" allowClear className="w-full">
            <Option value="yes">Yes</Option>
            <Option value="no">No</Option>
          </Select>
        </Form.Item>
        <Form.Item name="comment" label="Comment">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Row className="flex justify-end gap-3">
            <Button
              type="primary"
              htmlType="submit"
              value={'submit'}
              name="submit"
            >
              Submit
            </Button>
            <Button
              className="text-indigo-500"
              htmlType="button"
              value={'cancel'}
              name="cancel"
              onClick={() => setIsEmploymentFormVisible(false)}
            >
              Cancel{' '}
            </Button>
          </Row>
        </Form.Item>
      </Form>
      <Modal
        title="Add New Employment Status"
        okText="Add"
        open={isModalVisible}
        footer={false}
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
