import {
  useCreateMeetingType,
  useUpdateMeetingType,
} from '@/store/server/features/CFR/meeting/type/mutations';

import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';

interface MeetingTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  meetType?: any | null;
}

const MeetingTypeDrawer: React.FC<MeetingTypeDrawerProps> = ({
  open,
  onClose,
  meetType,
}) => {
  const { setMeetingType } = useMeetingStore();
  const [form] = Form.useForm();
  const { mutate: createMeetingType, isLoading: createLoading } =
    useCreateMeetingType();
  const { mutate: updateMeetingType, isLoading: updateLoading } =
    useUpdateMeetingType();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
    setMeetingType(null);
  };

  // Set form values when OkrRule changes
  useEffect(() => {
    if (meetType) {
      form.setFieldsValue(meetType); // Set form fields with OkrRule values
    } else {
      form.resetFields(); // Reset form if OkrRule is null
    }
  }, [meetType, form]);

  const onFinish = (values: any) => {
    meetType == null
      ? createMeetingType(values, {
          onSuccess() {
            handleDrawerClose();
          },
        })
      : updateMeetingType(
          { ...values, id: meetType.id },
          {
            onSuccess() {
              handleDrawerClose();
            },
          },
        );
  };
  const loading = createLoading || updateLoading;

  return (
    <Modal
      open={open}
      onCancel={handleDrawerClose}
      footer={null}
      centered
      width={780}
      destroyOnClose
      bodyStyle={{ paddingTop: 8 }}
      title={
        <div
          className="text-4 font-semibold text-gray-700"
          data-cy="meeting-type-drawer-header"
          id="meetingTypeDrawerHeader"
        >
          Meeting Type
        </div>
      }
      data-cy="meeting-type-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        name="itemForm"
        onFinish={onFinish}
        data-cy="meeting-type-drawer-form"
        id="meetingTypeDrawerForm"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter the item name.' },
            { min: 3, message: 'Name must be at least 3 characters.' },
          ]}
          data-cy="meeting-type-drawer-name-field"
          id="meetingTypeDrawerNameField"
        >
          <Input
            placeholder="Input"
            data-cy="meeting-type-drawer-name-input"
            id="meetingTypeDrawerNameInput"
            className="h-12"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter the item description.' },
            { min: 5, message: 'Description must be at least 5 characters.' },
          ]}
          data-cy="meeting-type-drawer-description-field"
          id="meetingTypeDrawerDescriptionField"
        >
          <Input.TextArea
            rows={3}
            placeholder="Textarea"
            data-cy="meeting-type-drawer-description-textarea"
            id="meetingTypeDrawerDescriptionTextarea"
          />
        </Form.Item>

        <div
          className="w-full flex justify-end items-center gap-3 pt-4"
          data-cy="meeting-type-drawer-footer"
          id="meetingTypeDrawerFooter"
        >
          <Button
            onClick={handleDrawerClose}
            loading={loading}
            className="h-10 px-6"
            data-cy="meeting-type-drawer-cancel-button"
            id="meetingTypeDrawerCancelButton"
          >
            Cancel
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            className="h-10 px-6"
            data-cy="meeting-type-drawer-submit-button"
            id="meetingTypeDrawerSubmitButton"
          >
            {meetType ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default MeetingTypeDrawer;
