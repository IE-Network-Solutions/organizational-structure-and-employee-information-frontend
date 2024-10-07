import React from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetCandidates } from '@/store/server/features/recruitment/tallentPool/query';
import { useCreateTalentPoolCandidate } from '@/store/server/features/recruitment/tallentPool/mutation';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomButton from '@/components/common/buttons/customButton';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface AddCandidateProps {
  open: boolean;
  onClose: () => void;
  handleCancel: () => void;
  isEditMode: boolean;
  handleSubmit: () => void;
}

const AddCandidate: React.FC<AddCandidateProps> = ({
  open,
  onClose,
  handleCancel,
  isEditMode,
  handleSubmit,
}) => {
  const [form] = Form.useForm();
  const { data: candidates } = useGetCandidates();
  const { data: talentPoolCategory } = useGetTalentPoolCategory();
  const { userId } = useAuthenticationStore();
  const createCandidateMutation = useCreateTalentPoolCandidate();
  const onSubmit = () => {
    form.validateFields().then((values) => {
      const { candidateId, reason, category } = values;
      const candidateData = {
        jobCandidateInformationId: candidateId,
        reason,
        talentPoolCategoryId: category,
        createdBy: '179055e7-a27c-4d9d-9538-2b2a115661bd',
      };

      createCandidateMutation.mutate(candidateData, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    });
  };

  return (
    <CustomDrawerLayout
      open={open}
      onClose={onClose}
      modalHeader="Add New Candidate"
      width="30%"
      footer={
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton title="Cancel" onClick={handleCancel} />
            <CustomButton
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      <Form className="h-full" form={form} layout="vertical">
        <Form.Item
          label="Select Candidate"
          name="candidateId"
          rules={[{ required: true, message: 'Please select a candidate!' }]}
        >
          <Select placeholder="Select a candidate">
            {candidates?.items?.map((candidate: any) => (
              <Select.Option key={candidate.id} value={candidate.id}>
                {candidate?.applicantStatusStage?.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Select Talent Pool Category"
          name="category"
          rules={[{ required: true, message: 'Please select a category!' }]}
        >
          <Select placeholder="Select a category">
            {talentPoolCategory?.items?.map((item: any) => (
              <Select.Option key={item.id} value={item?.id}>
                {item?.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: 'Please input the reason!' }]}
        >
          <Input.TextArea placeholder="Reason for adding candidate" />
        </Form.Item>
      </Form>
      <div className="flex justify-center  items-center">
        <Button className=" h-12" type="primary" onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </CustomDrawerLayout>
  );
};

export default AddCandidate;
