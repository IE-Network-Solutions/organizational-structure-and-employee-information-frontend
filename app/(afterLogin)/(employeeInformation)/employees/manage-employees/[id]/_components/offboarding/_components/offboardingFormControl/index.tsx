'use client';

import { useAddOffboardingItem } from '@/store/server/features/employees/offboarding/mutation';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { Form, DatePicker, Select, Button, Modal, Input, Row } from 'antd';
import React from 'react';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
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

  const { setEmployeeDetailActiveTab } = useEmployeeManagementStore();

  const handleAddTerminationReason = () => {
    if (newTerminationOption) {
      addCustomTerminationOption(newTerminationOption);
      // createTerminationItem({ name: newTerminationOption });
      setNewTerminationOption('');
      setIsTerminationModalVisible(false);
    }
  };

  const onFinish = (values: any) => {
    values['effectiveDate'] = dayjs(values.effectiveDate).format('YYYY-MM-DD');
    values['userId'] = userId;

    values['jobInformationId'] = employeeData.employeeJobInformation[0].id;
    setIsEmploymentFormVisible(false);
    createOffboardingItem(values, {
      onSuccess: () => {
        setEmployeeDetailActiveTab('5');
      },
    });
  };
  return (
    <Modal
      title={
        <div
          data-cy="offboarding-employment-modal-title"
          className="flex flex-col gap-1"
        >
          <span
            data-cy="offboarding-employment-modal-title-text"
            className="text-[#FF4D4F] text-base font-bold"
          >
            Initiate Termination
          </span>
          <span
            data-cy="offboarding-employment-modal-title-description"
            className="text-[#FFA39E] text-sm font-normal"
          >
            You must enter all the information to Initiate Termination
          </span>
        </div>
      }
      open={isEmploymentFormVisible}
      footer={false}
      onCancel={() => setIsEmploymentFormVisible(false)}
      data-cy="offboarding-employment-modal"
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        id="offboarding-employment-form"
        data-cy="offboarding-employment-form"
        requiredMark={false}
      >
        <Form.Item
          name="effectiveDate"
          label={
            <span
              data-cy={`offboarding-effective-date-label`}
              className="mb-1 text-sm font-normal"
            >
              Effective Date{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`job-timeline-effective-start-date-required`}
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Effective Date is Required' }]}
          id="offboarding-effective-date-form-item"
          data-cy="offboarding-effective-date-form-item"
        >
          <DatePicker
            className="w-full h-10"
            id="offboarding-effective-date-picker"
            data-cy="offboarding-effective-date-picker"
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={
            <span
              data-cy={`offboarding-termination-type-label`}
              className="mb-1 text-sm font-normal"
            >
              Termination Type{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`job-timeline-effective-start-date-required`}
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Termination Type is Required ' }]}
          id="offboarding-termination-type-form-item"
          data-cy="offboarding-termination-type-form-item"
        >
          <Select
            id="selectTerminationType"
            allowClear
            className="w-full h-10"
            data-cy="offboarding-termination-type-select"
          >
            <Option
              value="Resignation"
              id="offboarding-type-resignation"
              data-cy="offboarding-type-resignation"
            >
              Resignation
            </Option>
            <Option
              value="Termination"
              id="offboarding-type-termination"
              data-cy="offboarding-type-termination"
            >
              Termination
            </Option>
            <Option
              value="Death"
              id="offboarding-type-death"
              data-cy="offboarding-type-death"
            >
              Death
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="eligibleForRehire"
          label={
            <span
              data-cy={`offboarding-eligible-for-rehire-label`}
              className="mb-1 text-sm font-normal"
            >
              Eligible for Rehire{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`job-timeline-effective-start-date-required`}
              >
                *
              </span>
            </span>
          }
          rules={[
            { required: true, message: 'Eligible for Rehire is Required ' },
          ]}
          id="offboarding-eligible-form-item"
          data-cy="offboarding-eligible-form-item"
        >
          <Select
            id="selectEligibleForHire"
            allowClear
            className="w-full h-10"
            data-cy="offboarding-eligible-select"
          >
            <Option
              value="yes"
              id="offboarding-eligible-yes"
              data-cy="offboarding-eligible-yes"
            >
              Yes
            </Option>
            <Option
              value="no"
              id="offboarding-eligible-no"
              data-cy="offboarding-eligible-no"
            >
              No
            </Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="reason"
          label={
            <span
              data-cy={`offboarding-termination-reason-label`}
              className="mb-1 text-sm font-normal"
            >
              Termination Reason{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`job-timeline-effective-start-date-required`}
              >
                *
              </span>
            </span>
          }
          rules={[
            { required: true, message: 'Termination Reason is Required ' },
          ]}
          id="offboarding-termination-reason-form-item"
          data-cy="offboarding-termination-reason-form-item"
        >
          <Input.TextArea
            placeholder="Enter termination reason"
            id="selectTerminationReason"
            allowClear
            className="w-full h-[52px]"
            data-cy="offboarding-termination-reason-input"
          />
        </Form.Item>

        <Form.Item
          id="offboarding-employment-form-buttons"
          data-cy="offboarding-employment-form-buttons"
        >
          <Row
            className="flex justify-end gap-3 mt-3"
            id="offboarding-employment-form-row"
            data-cy="offboarding-employment-form-row"
          >
            <Button
              type="default"
              className="border border-[#D9D9D9] h-8 font-normal"
              htmlType="button"
              value={'cancel'}
              name="cancel"
              onClick={() => setIsEmploymentFormVisible(false)}
              id="offboarding-employment-cancel-btn"
              data-cy="offboarding-employment-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              value={'submit'}
              name="submit"
              id="offboarding-employment-submit-btn"
              data-cy="offboarding-employment-submit-btn"
              className="h-8 font-normal bg-[#FF4D4F] text-white"
            >
              Initiate Termination
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
        data-cy="offboarding-employment-status-modal"
      >
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Enter new employment status"
          id="offboarding-employment-status-input"
          data-cy="offboarding-employment-status-input"
        />
      </Modal>
      <Modal
        title="Add New Termination Reason"
        okText="Add"
        open={isTerminationModalVisible}
        onOk={handleAddTerminationReason}
        onCancel={() => setIsTerminationModalVisible(false)}
        data-cy="offboarding-termination-reason-modal"
      >
        <Input
          value={newTerminationOption}
          onChange={(e) => setNewTerminationOption(e.target.value)}
          placeholder="Enter new termination reason"
          id="offboarding-termination-reason-input"
          data-cy="offboarding-termination-reason-input"
        />
      </Modal>
    </Modal>
  );
};

export default OffboardingFormControl;
