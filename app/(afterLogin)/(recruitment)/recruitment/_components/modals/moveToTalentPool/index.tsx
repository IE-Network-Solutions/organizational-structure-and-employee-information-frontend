import { useMoveToTalentPool } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/candidate/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Button, Form, Modal, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect } from 'react';

const { Option } = Select;

const MoveToTalentPool: React.FC = () => {
  const [form] = Form.useForm();

  const { data: talentPool } = useGetTalentPoolCategory();

  const {
    moveToTalentPoolModal,
    setMoveToTalentPoolModal,
    selectedCandidate,
    setSelectedCandidate,
    setSelectedRowKeys,
  } = useCandidateState();

  const createdBy = useAuthenticationStore.getState().userId;

  const { mutate: moveToTalentPool, isLoading } = useMoveToTalentPool();

  useEffect(() => {
    const candidateArray = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];
    if (candidateArray.length > 0) {
      form.setFieldsValue({
        jobCandidateInformationId: candidateArray.map((item: any) => item.id),
      });
    }
  }, [selectedCandidate]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((formValues) => {
        const candidateArray = Array.isArray(selectedCandidate)
          ? selectedCandidate
          : [];

        const formattedValues = {
          ...formValues,
          createdBy: createdBy,
          jobCandidateId: candidateArray
            .map((candidate: any) => candidate?.jobCandidate?.[0]?.id)
            .filter(Boolean),
          jobCandidateInformationId: candidateArray.map(
            (candidate: any) => candidate.id,
          ),
        };

        moveToTalentPool(formattedValues, {
          onSuccess: () => {
            form.resetFields();
            setSelectedCandidate([]);
            setSelectedRowKeys([]);
            setMoveToTalentPoolModal(false);
          },
        });
      })
      .catch(() => {
        // Validation errors are displayed by antd Form; no extra handling needed
      });
  };

  const handleChange = (values: string[]) => {
    const candidateArray = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];
    const selectedOptions = candidateArray.filter((item: any) =>
      values.includes(item.id),
    );
    setSelectedCandidate(selectedOptions);
  };

  const handleCancel = () => {
    setMoveToTalentPoolModal(false);
    form.resetFields();
    setSelectedCandidate([]);
    setSelectedRowKeys([]);
  };

  return (
    moveToTalentPoolModal && (
      <Modal
        data-cy="talent-acquisition-move-talent-pool-modal"
        open={moveToTalentPoolModal}
        onCancel={handleCancel}
        footer={null}
        width={630}
        title={
          <div
            id="talent-acquisition-move-talent-pool-div-header"
            data-cy="talent-acquisition-move-talent-pool-div-header"
            className="flex flex-col"
          >
            <span
              className="text-lg font-bold text-gray-900"
              data-cy="talent-acquisition-move-talent-pool-modal-title"
            >
              Move to Talent Pool
            </span>
          </div>
        }
        maskClosable={false}
        destroyOnClose
        styles={{
          body: {
            backgroundColor: '#FFFFFF',
            padding: 32,
          },
        }}
        zIndex={10002}
      >
        <Form
          id="talent-acquisition-move-talent-pool-form"
          data-cy="talent-acquisition-move-talent-pool-form"
          form={form}
          layout="vertical"
        >
          <div
            id="talent-acquisition-move-talent-pool-div-form-container"
            data-cy="talent-acquisition-move-talent-pool-div-form-container"
            className="bg-white border border-[#D9D9D9] rounded-lg px-4 py-2"
          >
            <Form.Item
              id="jobCandidateInformationId"
              data-cy="talent-acquisition-move-talent-pool-form-item-candidates"
              name="jobCandidateInformationId"
              label={
                <span
                  data-cy="-components-modals-movetotalentpool-index-tsx-index-span-146"
                  className="text-sm font-medium text-gray-700"
                >
                  Candidate{' '}
                  <span
                    className="text-red-500"
                    aria-hidden
                    data-cy="talent-acquisition-move-talent-pool-required-mark"
                  >
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select at least one candidate',
                },
              ]}
            >
              <Select
                id="talent-acquisition-move-talent-pool-select-candidates"
                data-cy="talent-acquisition-move-talent-pool-select-candidates"
                mode="multiple"
                className="text-sm w-full min-h-10"
                placeholder="select candidate"
                value={(Array.isArray(selectedCandidate)
                  ? selectedCandidate
                  : []
                ).map((item: any) => item.id)}
                onChange={handleChange}
                tagRender={({ label, closable, onClose }) => (
                  <span
                    id="talent-acquisition-move-talent-pool-div-candidate-option"
                    data-cy="talent-acquisition-move-talent-pool-div-candidate-option"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-sm text-gray-800 mr-1 mb-1"
                  >
                    <span
                      data-cy="-components-modals-movetotalentpool-index-tsx-index-span-188"
                      id="talent-acquisition-move-talent-pool-div-candidate-info"
                    >
                      {label}
                    </span>
                    {closable && (
                      <CloseOutlined
                        role="button"
                        tabIndex={0}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
                        onClick={onClose}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onClose();
                          }
                        }}
                      />
                    )}
                  </span>
                )}
              >
                {(Array.isArray(selectedCandidate)
                  ? selectedCandidate
                  : []
                ).map((item: any) => (
                  <Option
                    key={item.id}
                    value={item.id}
                    id={`talent-acquisition-move-talent-pool-option-candidate-${item.id}`}
                    data-cy={`talent-acquisition-move-talent-pool-option-candidate-${item.id}`}
                  >
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              id="talentPoolCategoryId"
              data-cy="talent-acquisition-move-talent-pool-form-item-category"
              name="talentPoolCategoryId"
              label={
                <span
                  data-cy="-components-modals-movetotalentpool-index-tsx-index-span-237"
                  className="text-sm font-medium text-gray-700"
                >
                  Talent Pool Category
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select talent pool category',
                },
              ]}
            >
              <Select
                id="talent-acquisition-move-talent-pool-select-category"
                data-cy="talent-acquisition-move-talent-pool-select-category"
                className="text-sm w-full h-10"
                placeholder="Select talent pool category"
              >
                {talentPool?.items?.map((item: any) => (
                  <Option
                    key={item?.id}
                    value={item?.id}
                    id={`talent-acquisition-move-talent-pool-option-category-${item?.id}`}
                    data-cy={`talent-acquisition-move-talent-pool-option-category-${item?.id}`}
                  >
                    {item?.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="reason"
              data-cy="talent-acquisition-move-talent-pool-form-item-reason"
              name="reason"
              label={
                <span
                  data-cy="-components-modals-movetotalentpool-index-tsx-index-span-271"
                  className="text-sm font-medium text-gray-700"
                >
                  Reason
                </span>
              }
              rules={[{ required: true, message: 'Please input your reason' }]}
            >
              <TextArea
                id="talent-acquisition-move-talent-pool-textarea-reason"
                data-cy="talent-acquisition-move-talent-pool-textarea-reason"
                rows={3}
                placeholder="Please provide your reason for moving to the talent pool."
                className="text-sm"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <div
              id="talent-acquisition-move-talent-pool-div-footer"
              data-cy="talent-acquisition-move-talent-pool-div-footer"
              className="flex justify-end w-full bg-[#fff] px-0 pt-4 gap-3"
            >
              <Button
                id="talent-acquisition-move-talent-pool-button-cancel"
                data-cy="talent-acquisition-move-talent-pool-button-cancel"
                onClick={handleCancel}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white px-3 h-8 hover:border-[#4096FF] border-gray-300 hover:text-[#4096FF]"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                id="talent-acquisition-move-talent-pool-button-add"
                data-cy="talent-acquisition-move-talent-pool-button-add"
                type="primary"
                className="flex justify-center text-sm font-medium text-white bg-primary px-3 h-8 border-none hover:bg-[#4096FF]"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                Add
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default MoveToTalentPool;
