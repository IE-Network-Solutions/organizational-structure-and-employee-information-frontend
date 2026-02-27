import { useCreatePosition } from '@/store/server/features/employees/positions/mutation';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CreatePosition: React.FC = () => {
  const [form] = Form.useForm();
  const { setOpenPositionDrawer, setFormValues } = usePositionState();
  const { mutate: handleCreatePosition } = useCreatePosition();
  const handleCloseDrawer = () => {
    setOpenPositionDrawer(false);
  };

  const drawerSlug = toSlug('create-position-drawer');

  const handleAddJobStateUpdate = useDebounce(setFormValues, 1500);

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();
    handleCreatePosition(formValues);
    handleCloseDrawer();
    form.resetFields();
  };

  return (
    <div
      data-cy="settings-position-create-drawer"
      className="border border-gray-200 rounded-lg"
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => {
          handleAddJobStateUpdate(form.getFieldsValue());
        }}
        onFinish={() => {
          handleSubmit();
        }}
        id={`settings-position-create-form-${drawerSlug}`}
        data-cy={`settings-position-create-form-${drawerSlug}`}
        className="p-4"
      >
        <Form.Item
          id="positionTitle"
          name="name"
          label={
            <span
              className="text-md my-2 font-semibold text-gray-700"
              data-cy="create-position-name-label"
            >
              Position Name
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please input the position name!',
            },
          ]}
          data-cy="settings-position-create-name-item"
        >
          <Input
            size="large"
            placeholder="Job title"
            className="text-sm w-full  h-10"
            allowClear
            id={`settings-position-create-name-input-${drawerSlug}`}
            data-cy={`settings-position-create-name-input-${drawerSlug}`}
          />
        </Form.Item>
        <Form.Item
          id="positionDescription"
          name="description"
          label={
            <span
              className="text-lg my-2 font-semibold text-gray-700"
              id="settings-position-create-description-label"
              data-cy="settings-position-create-description-label"
            >
              Position Description
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please input the position description!',
            },
          ]}
          data-cy="settings-position-create-description-item"
        >
          <TextArea
            className="h-12"
            rows={4}
            placeholder="Job description"
            allowClear
            id={`settings-position-create-description-input-${drawerSlug}`}
            data-cy={`settings-position-create-description-input-${drawerSlug}`}
          />
        </Form.Item>
        <div
          className="flex justify-end w-full bg-[#fff] space-x-5 p-4 "
          id={`settings-position-create-footer-${drawerSlug}`}
          data-cy={`settings-position-create-footer-${drawerSlug}`}
        >
          <Button
            className="h-8 text-base"
            type="primary"
            onClick={() => form.submit()}
            id={`settings-position-create-submit-${drawerSlug}`}
            data-cy={`settings-position-create-submit-${drawerSlug}`}
          >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreatePosition;
