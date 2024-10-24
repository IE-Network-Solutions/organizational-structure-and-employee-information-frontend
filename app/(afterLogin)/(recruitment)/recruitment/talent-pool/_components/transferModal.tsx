import React, { useEffect } from 'react';
import { Modal, Button, Form, Divider, Select } from 'antd';
import { useGetApplicantStatusStages } from '@/store/server/features/recruitment/tallentPool/query';
import { useGetJobInformation } from '@/store/server/features/recruitment/jobs/query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface TransferCandidateModalProps {
  selectedCandidate: any;
  visible: boolean;
  onConfirm: (value: any) => void;
  onCancel: () => void;
}

/* eslint-enable @typescript-eslint/naming-convention */
const TransferTalentPoolToCandidateModal: React.FC<
  TransferCandidateModalProps
> = ({ visible, onConfirm, onCancel, selectedCandidate }) => {
  const [form] = Form.useForm();

  const { data: applicantStatusStage } = useGetApplicantStatusStages();
  const { data: jobInformations } = useGetJobInformation();
  const { userId } = useAuthenticationStore();

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
      title="Move Candidate to Candidates"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Move"
      footer={null}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 20 }}
      >
        {' '}
        <Form.Item
          name="applicantStatusStageId"
          label="Applicant Status Stages"
          rules={[
            {
              required: true,
              message: 'Please select the applicant status stage!',
            },
          ]}
        >
          <Select placeholder="Select Applicant Status Stage">
            {applicantStatusStage?.items?.map((stage: any) => (
              <Select.Option key={stage.id} value={stage.id}>
                {stage.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Divider />
        <Form.Item
          name="jobInformations"
          label="Job Informations"
          rules={[
            {
              required: true,
              message: 'Please input the job information IDs!',
            },
          ]}
        >
          <Select mode="multiple" placeholder="Select Job Information">
            {jobInformations?.items?.map((jobInformation: any) => (
              <Select.Option key={jobInformation.id} value={jobInformation.id}>
                {jobInformation.jobTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginTop: 10 }}>
            Move
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* eslint-disable @typescript-eslint/naming-convention */
export default TransferTalentPoolToCandidateModal;
