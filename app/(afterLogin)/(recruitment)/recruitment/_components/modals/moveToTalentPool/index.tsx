import { useMoveToTalentPool } from '@/store/server/features/recruitment/candidate/mutation';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/candidate/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Form, Modal, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';

const { Option } = Select;

const MoveToTalentPool: React.FC = () => {
  const [form] = Form.useForm();

  const { data: talentPool } = useGetTalentPoolCategory();

  const { moveToTalentPoolModal, setMoveToTalentPoolModal, selectedCandidate } =
    useCandidateState();

  const createdBy = useAuthenticationStore.getState().userId;

  const { mutate: moveToTalentPool } = useMoveToTalentPool();

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();

    const formattedValues = {
      ...formValues,
      createdBy: createdBy,
      jobCandidateId: selectedCandidate?.jobCandidate
        ?.map((item: any) => item?.id)
        .join(','),
      jobCandidateInformationId: selectedCandidate?.id,
    };
    moveToTalentPool(formattedValues);
    setMoveToTalentPoolModal(false);
  };

  return (
    moveToTalentPoolModal && (
      <Modal
        open={moveToTalentPoolModal}
        okText="Move"
        onOk={handleSubmit}
        onCancel={() => setMoveToTalentPoolModal(false)}
        centered
      >
        <div className="text-xl font-bold text-start py-2">
          Move to Talent Pool?
        </div>
        <Form
          form={form}
          // onFinish={() => {
          //   handleSubmit();
          // }}
          layout="vertical"
        >
          <Form.Item
            id="talentPoolCategoryId"
            name="talentPoolCategoryId"
            label={
              <span className="text-md font-semibold text-gray-700 py-1">
                Talent Pool Category
              </span>
            }
            rules={[
              { required: true, message: 'Please select talent pool category' },
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
      </Modal>
    )
  );
};

export default MoveToTalentPool;
