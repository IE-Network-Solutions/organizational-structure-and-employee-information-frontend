import React, { useEffect } from 'react';
import { Button, Form, Modal, Select } from 'antd';
import { useGetJobInformation } from '@/store/server/features/recruitment/jobs/query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';

interface TransferCandidateModalProps {
  selectedCandidate: any;
  visible: boolean;
  onConfirm: (value: any) => void;
  onCancel: () => void;
}

const TransferTalentPoolToCandidateModal: React.FC<
  TransferCandidateModalProps
> = ({ visible, onConfirm, onCancel, selectedCandidate }) => {
  const [form] = Form.useForm();

  const { data: jobInformations } = useGetJobInformation();
  const { userId } = useAuthenticationStore();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = (values: any) => {
    const fullData = {
      ...values,
      jobCandidateInformationId: selectedCandidate?.jobCandidateInformationId,
      createdBy: userId,
    };
    onConfirm(fullData);
  };
  return (
    <Modal
      title="Add to Candidates"
      data-cy="talent-acquisition-talent-pool-modal-reonboard"
      open={visible}
      onCancel={onCancel}
      footer={
        <div
          id="talent-acquisition-talent-pool-modal-footer-reonboard"
          data-cy="talent-acquisition-talent-pool-modal-footer-reonboard"
          className="flex justify-end gap-2"
        >
          <Button
            type="default"
            id="talent-acquisition-talent-pool-button-reonboard-cancel"
            data-cy="talent-acquisition-talent-pool-button-reonboard-cancel"
            onClick={onCancel}
            className="h-8"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            id="talent-acquisition-talent-pool-button-reonboard-submit"
            data-cy="talent-acquisition-talent-pool-button-reonboard-submit"
            className="h-8"
            onClick={handleFinish}
          >
            Add to Candidates
          </Button>
        </div>
      }
    >
      <Form
        id="talent-acquisition-talent-pool-form-reonboard"
        data-cy="talent-acquisition-talent-pool-form-reonboard"
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={CustomLabel}
      >
        <Form.Item
          name="departmentId"
          label={
            <span
              data-cy="talent-acquisition-talent-pool-form-label-department"
              className="text-md my-2 font-semibold text-gray-700"
            >
              Select Department
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select the department ',
            },
          ]}
        >
          <Select
            id="selectDepartment"
            data-cy="talent-acquisition-talent-pool-select-department-reonboard"
            placeholder="Select Department"
            allowClear
            className="w-full h-10"
          >
            {EmployeeDepartment &&
              EmployeeDepartment?.map((item: any) => (
                <Select.Option
                  key={item?.id}
                  value={item?.id}
                  id={`talent-acquisition-talent-pool-option-department-reonboard-${item?.id}`}
                  data-cy={`talent-acquisition-talent-pool-option-department-reonboard-${item?.id}`}
                >
                  {item?.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="jobInformations"
          label={
            <span
              data-cy="talent-acquisition-talent-pool-form-label-job-information"
              className="text-md my-2 font-semibold text-gray-700"
            >
              Job Information
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please input the job information IDs!',
            },
          ]}
        >
          <Select
            id="talent-acquisition-talent-pool-select-job-information"
            data-cy="talent-acquisition-talent-pool-select-job-information"
            mode="multiple"
            placeholder="Select Job Information"
            className="h-10"
          >
            {jobInformations?.items?.map((jobInformation: any) => (
              <Select.Option
                key={jobInformation.id}
                value={jobInformation.id}
                id={`talent-acquisition-talent-pool-option-job-${jobInformation.id}`}
                data-cy={`talent-acquisition-talent-pool-option-job-${jobInformation.id}`}
              >
                {jobInformation.jobTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferTalentPoolToCandidateModal;
