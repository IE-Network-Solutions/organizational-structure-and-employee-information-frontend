import { useUpdatePosition } from '@/store/server/features/employees/positions/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { Button, Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

  const editSlug = toSlug(selectedPositionId ?? 'position-edit');

  return (
    editModal && (
      <Modal
        title="Edit Job"
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={false}
        data-cy={`settings-position-edit-modal-${editSlug}`}
      >
        <Form
          requiredMark={false}
          form={form}
          onFinish={handleUpdateJob}
          layout="vertical"
          initialValues={selectedPosition}
          id={`settings-position-edit-form-${editSlug}`}
          data-cy={`settings-position-edit-form-${editSlug}`}
        >
          <Form.Item
            id="PositionName"
            data-cy="settings-position-edit-name-item"
            name="name"
            label={
              <span
                className="text-md my-2 font-semibold text-gray-700"
                id="settings-position-edit-name-label"
                data-cy="settings-position-edit-name-label"
              >
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
              id={`settings-position-edit-name-input-${editSlug}`}
              data-cy={`settings-position-edit-name-input-${editSlug}`}
            />
          </Form.Item>
          <Form.Item
            id="description"
            data-cy="settings-position-edit-description-item"
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
            <TextArea
              rows={4}
              placeholder="Description"
              id={`settings-position-edit-description-input-${editSlug}`}
              data-cy={`settings-position-edit-description-input-${editSlug}`}
            />
          </Form.Item>
          <Form.Item id="settings-position-edit-actions-wrapper" data-cy="settings-position-edit-actions-wrapper">
            <div
              className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6"
              id={`settings-position-edit-actions-${editSlug}`}
              data-cy={`settings-position-edit-actions-${editSlug}`}
            >
              <Button
                onClick={() => setEditModal(false)}
                className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
                id={`settings-position-edit-cancel-${editSlug}`}
                data-cy={`settings-position-edit-cancel-${editSlug}`}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
                id={`settings-position-edit-submit-${editSlug}`}
                data-cy={`settings-position-edit-submit-${editSlug}`}
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
