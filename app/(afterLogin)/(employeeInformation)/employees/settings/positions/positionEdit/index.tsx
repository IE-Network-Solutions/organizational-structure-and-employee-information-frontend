import { useUpdatePosition } from '@/store/server/features/employees/positions/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { Button, Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';

const PositionsEdit: React.FC = () => {
  const [form] = Form.useForm();
  const { editModal, selectedPositionId, selectedPosition, setEditModal } =
    usePositionState();
  const { mutate: updatePosition } = useUpdatePosition();

  const updatedBy = useAuthenticationStore.getState().userId;

  const handleUpdateJob = () => {
    const formValues = form.getFieldsValue();
    const updatedFormValues = {
      id: selectedPositionId,
      updatedBy: updatedBy,
      name: formValues?.name,
      description: formValues?.description,
    };
    updatePosition({ data: updatedFormValues, id: selectedPositionId });
    setEditModal(false);
  };

  return (
    editModal && (
      <Modal
        title="Edit Job"
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={false}
      >
        <Form
          requiredMark={false}
          form={form}
          onFinish={handleUpdateJob}
          layout="vertical"
          initialValues={selectedPosition}
        >
          <Form.Item
            id="PositionName"
            name="name"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Position Name
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input Position name!',
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Job title"
              className="text-sm w-full  h-10"
              allowClear
            />
          </Form.Item>
          <Form.Item
            id="description"
            name="description"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Position Description
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input Position Description!',
              },
            ]}
          >
            <TextArea rows={4} placeholder="Description" />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6">
              <Button
                htmlType="reset"
                className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
              >
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default PositionsEdit;
