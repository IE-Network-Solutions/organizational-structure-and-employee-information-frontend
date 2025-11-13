import { useMoveToTalentPool } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/candidate/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Button, Checkbox, Form, Modal, Select } from 'antd';
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
    const formValues = form.getFieldsValue();
    const candidateArray = Array.isArray(selectedCandidate)
      ? selectedCandidate
      : [];

    const formattedValues = {
      ...formValues,
      createdBy: createdBy,
      jobCandidateId: candidateArray
        .map((candidate: any) => candidate?.jobCandidate?.[0]?.id)
        .filter(Boolean), // Filter out undefined values
      jobCandidateInformationId: candidateArray.map(
        (candidate: any) => candidate.id,
      ),
    };

    moveToTalentPool(formattedValues, {
      onSuccess: () => {
        form.resetFields();
        setSelectedCandidate([]);
        setSelectedRowKeys([]); // Clear table selection
        setMoveToTalentPoolModal(false);
      },
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

  return (
    moveToTalentPoolModal && (
      <Modal
        data-cy="talent-acquisition-move-talent-pool-modal"
        open={moveToTalentPoolModal}
        onOk={handleSubmit}
        onCancel={() => setMoveToTalentPoolModal(false)}
        centered
        confirmLoading={isLoading}
        width={700}
        footer={
          <div className="w-full flex justify-center gap-4">
            <Button
              id="talent-acquisition-move-talent-pool-button-cancel"
              data-cy="talent-acquisition-move-talent-pool-button-cancel"
              key="cancel"
              className="p-6"
              onClick={() => {
                setMoveToTalentPoolModal(false);
                form.resetFields();
                setSelectedCandidate([]);
                setSelectedRowKeys([]);
              }}
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-move-talent-pool-button-add"
              data-cy="talent-acquisition-move-talent-pool-button-add"
              key="submit"
              type="primary"
              className="p-6"
              onClick={handleSubmit}
              loading={isLoading}
            >
              Add
            </Button>
          </div>
        }
      >
        <div className="text-xl font-bold text-start py-2">
          Move to Talent Pool?
        </div>
        <div className="mb-20">
          <Form
            id="talent-acquisition-move-talent-pool-form"
            data-cy="talent-acquisition-move-talent-pool-form"
            form={form}
            // onFinish={() => {
            //   handleSubmit();
            // }}
            layout="vertical"
          >
            <Form.Item
              id="jobCandidateInformationId"
              data-cy="talent-acquisition-move-talent-pool-form-item-candidates"
              name="jobCandidateInformationId"
              label={
                <span className="text-md font-semibold text-gray-700 py-1">
                  Candidates
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
                id="talent-acquisition-move-talent-pool-select-candidates"
                data-cy="talent-acquisition-move-talent-pool-select-candidates"
                mode="multiple"
                className="text-sm w-full min-h-12"
                placeholder="Select talent pool category"
                value={(Array.isArray(selectedCandidate)
                  ? selectedCandidate
                  : []
                ).map((item: any) => item.id)}
                onChange={handleChange}
                tagRender={({ label, value }) => {
                  const candidateArray = Array.isArray(selectedCandidate)
                    ? selectedCandidate
                    : [];
                  const candidate = candidateArray.find(
                    (item: any) => item.id === value,
                  );

                  return (
                    <div id="talent-acquisition-move-talent-pool-div-candidate-option" data-cy="talent-acquisition-move-talent-pool-div-candidate-option" className="flex items-center gap-2 px-2 py-1 border rounded bg-gray-100 m-1">
                      <Checkbox checked={true} />{' '}
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-gray-500 text-xs">
                          ({candidate?.phone})
                        </span>{' '}
                      </div>
                    </div>
                  );
                }}
                optionRender={(option) => {
                  const candidateArray = Array.isArray(selectedCandidate)
                    ? selectedCandidate
                    : [];
                  const isChecked = candidateArray.some(
                    (item: any) => item.id === option.value,
                  );

                  return (
                    <div className="flex items-center cursor-pointer">
                      <Checkbox checked={isChecked} />
                      <span className="ml-2">{option.label}</span>
                    </div>
                  );
                }}
              >
                {(Array.isArray(selectedCandidate)
                  ? selectedCandidate
                  : []
                ).map((item: any) => (
                  <Option key={item.id} value={item.id} id={`talent-acquisition-move-talent-pool-option-candidate-${item.id}`} data-cy={`talent-acquisition-move-talent-pool-option-candidate-${item.id}`}>
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
                <span className="text-md font-semibold text-gray-700 py-1">
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
                  <Option key={item?.id} value={item?.id} id={`talent-acquisition-move-talent-pool-option-category-${item?.id}`} data-cy={`talent-acquisition-move-talent-pool-option-category-${item?.id}`}>
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
                <span className="text-md font-semibold text-gray-700 py-1">
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
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    )
  );
};

export default MoveToTalentPool;
