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
          className="text-xl font-bold text-black"
        >
          Add Candidate
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div
          id="talent-acquisition-talent-pool-drawer-footer"
          data-cy="talent-acquisition-talent-pool-drawer-footer"
          className="flex justify-end items-center gap-2 pb-6 sm:px-6"
        >
          <Button
            type="default"
            id="talent-acquisition-talent-pool-button-cancel"
            data-cy="talent-acquisition-talent-pool-button-cancel"
            onClick={() => {
              form.resetFields();
              onClose();
            }}
            className="h-8 border-[1px] border-[#d9d9d9] font-normal"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            id="talent-acquisition-talent-pool-button-submit"
            data-cy="talent-acquisition-talent-pool-button-submit"
            className="h-8 font-normal"
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      }
      zIndex={10002}
      width={620}
    >
      <div
        data-cy="talent-acquisition-talent-pool-drawer-body"
        className="pt-10 sm:px-6"
      >
        <div
          data-cy="talent-acquisition-talent-pool-drawer-body-form"
          className="border-[1px] border-[#d9d9d9] rounded-lg py-4 px-4"
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
                  className="text-sm my-2 font-normal text-black"
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
                className="h-8"
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
                    className="hover:bg-[#E6F4FF] [&.ant-select-item-option-selected]:!bg-[#E6F4FF]"
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
                  className="text-sm my-2 font-normal text-black"
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
                className="h-8"
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
                    className="hover:bg-[#E6F4FF] [&.ant-select-item-option-selected]:!bg-[#E6F4FF]"
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
                  className="text-sm my-2 font-normal text-black"
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
                className="h-14"
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
