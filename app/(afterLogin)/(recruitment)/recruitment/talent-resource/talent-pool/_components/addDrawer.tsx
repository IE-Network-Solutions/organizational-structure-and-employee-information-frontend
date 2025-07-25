import React from 'react';
import { Button, Form, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetCandidates } from '@/store/server/features/recruitment/tallentPool/query';
import { useCreateTalentPoolCandidate } from '@/store/server/features/recruitment/tallentPool/mutation';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CustomLabel from '@/components/form/customLabel/customLabel';
import TextArea from 'antd/es/input/TextArea';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';

interface AddCandidateProps {
  open: boolean;
  onClose: () => void;
}
/* eslint-enable @typescript-eslint/naming-convention */
const AddCandidate: React.FC<AddCandidateProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { pageSize, currentPage } = useTalentPoolSettingsStore();
  const { data: candidates } = useGetCandidates();
  const { data: talentPoolCategory } = useGetTalentPoolCategory(
    pageSize,
    currentPage,
  );
  const { userId } = useAuthenticationStore();
  const createCandidateMutation = useCreateTalentPoolCandidate();
  const onSubmit = () => {
    form.validateFields().then((values) => {
      const { candidateId, reason, category } = values;
      const candidateData = {
        jobCandidateInformationId: candidateId,
        reason,
        talentPoolCategoryId: category,
        createdBy: userId,
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
      modalHeader={
        <div className="flex justify-start  text-xl font-extrabold text-gray-800">
          Add New Candidate
        </div>
      }
      width="40%"
      footer={
        <div className="flex justify-center items-center space-x-5 p-2">
          <Button
            onClick={onClose}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300 "
          >
            Cancel
          </Button>
          <Button className=" p-4 px-10 h-10" type="primary" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      }
    >
      <Form
        // className="h-full"
        form={form}
        layout="vertical"
        requiredMark={CustomLabel}
      >
        <Form.Item
          label={
            <span className="text-md my-2 font-semibold text-gray-700">
              Candidate
            </span>
          }
          name="candidateId"
          rules={[{ required: true, message: 'Please select a candidate!' }]}
        >
          <Select placeholder="Select a candidate" className="h-10">
            {candidates?.items?.map((candidate: any) => (
              <Select.Option key={candidate.id} value={candidate.id}>
                {candidate?.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <span className="text-md my-2 font-semibold text-gray-700">
              Category
            </span>
          }
          name="category"
          rules={[{ required: true, message: 'Please select a category!' }]}
        >
          <Select placeholder="Select a talent pool category" className="h-10">
            {talentPoolCategory?.items?.map((item: any) => (
              <Select.Option key={item.id} value={item?.id}>
                {item?.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <span className="text-md my-2 font-semibold text-gray-700">
              Reason
            </span>
          }
          name="reason"
          rules={[{ required: true, message: 'Please input the reason!' }]}
        >
          <TextArea rows={6} placeholder="Reason for selecting candidate" />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};
/* eslint-disable @typescript-eslint/naming-convention */
export default AddCandidate;
