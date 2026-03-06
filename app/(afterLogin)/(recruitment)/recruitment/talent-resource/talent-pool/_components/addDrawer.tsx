import React from 'react';
import { Button, Form, Modal, Select } from 'antd';
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
    <Modal
      data-cy="talent-acquisition-talent-pool-drawer"
      title={
        <span
          data-cy="talent-acquisition-talent-pool-drawer-title"
          className=""
        >
          Add New Candidate
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div
          id="talent-acquisition-talent-pool-drawer-footer"
          data-cy="talent-acquisition-talent-pool-drawer-footer"
          className="flex justify-end items-center space-x-5 p-2"
        >
          <Button
            id="talent-acquisition-talent-pool-button-cancel"
            data-cy="talent-acquisition-talent-pool-button-cancel"
            onClick={() => {
              form.resetFields();
              onClose();
            }}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white  h-8 hover:border-gray-500 border-gray-300 "
          >
            Cancel
          </Button>
          <Button
            id="talent-acquisition-talent-pool-button-submit"
            data-cy="talent-acquisition-talent-pool-button-submit"
            className="h-8"
            type="primary"
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      }
      zIndex={10002}
    >
      <div
        data-cy="talent-acquisition-talent-pool-drawer-body"
        className="py-10 px-6"
      >
        <div
          data-cy="talent-acquisition-talent-pool-drawer-body-form"
          className="border-2 border-[#d9d9d9] rounded-md py-4 px-2"
        >
          <Form
            id="talent-acquisition-talent-pool-form-add-candidate"
            data-cy="talent-acquisition-talent-pool-form-add-candidate"
            // className="h-full"
            form={form}
            layout="vertical"
            requiredMark={CustomLabel}
          >
            <Form.Item
              label={
                <span
                  id="talent-acquisition-talent-pool-form-label-candidate"
                  data-cy="talent-acquisition-talent-pool-form-label-candidate"
                  className="text-md my-2 font-semibold text-gray-700"
                >
                  Candidate
                </span>
              }
              name="candidateId"
              rules={[
                { required: true, message: 'Please select a candidate!' },
              ]}
            >
              <Select
                id="talent-acquisition-talent-pool-select-candidate"
                data-cy="talent-acquisition-talent-pool-select-candidate"
                placeholder="Select a candidate"
                className="h-10"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  String(option?.children ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {candidates?.items?.map((candidate: any) => (
                  <Select.Option
                    key={candidate.id}
                    value={candidate.id}
                    id={`talent-acquisition-talent-pool-option-candidate-${candidate.id}`}
                    data-cy={`talent-acquisition-talent-pool-option-candidate-${candidate.id}`}
                  >
                    {candidate?.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span
                  data-cy="talent-acquisition-talent-pool-form-label-category"
                  className="text-md my-2 font-semibold text-gray-700"
                >
                  Category
                </span>
              }
              name="category"
              rules={[{ required: true, message: 'Please select a category!' }]}
            >
              <Select
                id="talent-acquisition-talent-pool-select-category"
                data-cy="talent-acquisition-talent-pool-select-category"
                placeholder="Select a talent pool category"
                className="h-10"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  String(option?.children ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {talentPoolCategory?.items?.map((item: any) => (
                  <Select.Option
                    key={item.id}
                    value={item?.id}
                    id={`talent-acquisition-talent-pool-option-category-${item.id}`}
                    data-cy={`talent-acquisition-talent-pool-option-category-${item.id}`}
                  >
                    {item?.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span
                  data-cy="talent-acquisition-talent-pool-form-label-reason"
                  className="text-md my-2 font-semibold text-gray-700"
                >
                  Reason
                </span>
              }
              name="reason"
              rules={[{ required: true, message: 'Please input the reason!' }]}
            >
              <TextArea
                id="talent-acquisition-talent-pool-textarea-reason"
                data-cy="talent-acquisition-talent-pool-textarea-reason"
                placeholder="Reason for selecting candidate"
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};
/* eslint-disable @typescript-eslint/naming-convention */
export default AddCandidate;
