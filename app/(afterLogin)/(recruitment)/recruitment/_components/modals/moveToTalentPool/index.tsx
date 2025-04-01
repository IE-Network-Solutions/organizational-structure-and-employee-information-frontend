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
  } = useCandidateState();

  const createdBy = useAuthenticationStore.getState().userId;

  const { mutate: moveToTalentPool, isLoading } = useMoveToTalentPool();

  useEffect(() => {
    if (selectedCandidate?.length > 0) {
      form.setFieldsValue({
        jobCandidateInformationId: selectedCandidate.map(
          (item: any) => item.id,
        ),
      });
    }
  }, [selectedCandidate]);

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();

    const formattedValues = {
      ...formValues,
      createdBy: createdBy,
      jobCandidateId: selectedCandidate?.map(
        (candidate: any) => candidate.jobCandidate[0].id,
      ),
      jobCandidateInformationId:
        selectedCandidate?.map((candidate: any) => candidate.id) || [],
    };

    moveToTalentPool(formattedValues, {
      onSuccess: () => {
        setMoveToTalentPoolModal(false);
      },
    });
  };

  const handleChange = (values: string[]) => {
    const selectedOptions = selectedCandidate.filter((item: any) =>
      values.includes(item.id),
    );
    setSelectedCandidate(selectedOptions);
  };

  return (
    moveToTalentPoolModal && (
      <Modal
        open={moveToTalentPoolModal}
        onOk={handleSubmit}
        onCancel={() => setMoveToTalentPoolModal(false)}
        centered
        confirmLoading={isLoading}
        width={700}
        footer={
          <div className="w-full flex justify-center gap-4">
            <Button
              key="cancel"
              className="p-6"
              onClick={() => setMoveToTalentPoolModal(false)}
            >
              Cancel
            </Button>
            <Button
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
            form={form}
            // onFinish={() => {
            //   handleSubmit();
            // }}
            layout="vertical"
          >
            <Form.Item
              id="jobCandidateInformationId"
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
                mode="multiple"
                className="text-sm w-full min-h-12"
                placeholder="Select talent pool category"
                value={selectedCandidate.map((item: any) => item.id)}
                onChange={handleChange}
                tagRender={({ label, value }) => {
                  const candidate = selectedCandidate.find(
                    (item: any) => item.id === value,
                  );

                  return (
                    <div className="flex items-center gap-2 px-2 py-1 border rounded bg-gray-100 m-1">
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
                  const isChecked = selectedCandidate.some(
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
                {selectedCandidate.map((item: any) => (
                  <Option key={item.id} value={item.id}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              id="talentPoolCategoryId"
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
                className="text-sm w-full h-10"
                placeholder="Select talent pool category"
              >
                {talentPool?.items?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              id="reason"
              name="reason"
              label={
                <span className="text-md font-semibold text-gray-700 py-1">
                  Reason
                </span>
              }
              rules={[{ required: true, message: 'Please input your reason' }]}
            >
              <TextArea
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
