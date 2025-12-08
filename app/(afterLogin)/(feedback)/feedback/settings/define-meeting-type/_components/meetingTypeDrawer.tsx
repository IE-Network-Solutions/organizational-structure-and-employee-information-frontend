import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateMeetingType,
  useUpdateMeetingType,
} from '@/store/server/features/CFR/meeting/type/mutations';

import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

import { Form, Input } from 'antd';
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

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      data-cy="meeting-type-drawer-header"
      id="meetingTypeDrawerHeader"
    >
      {meetType ? 'Update Meeting Type' : 'Add New Meeting Type'}
    </div>
  );

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

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      data-cy="meeting-type-drawer-footer"
      id="meetingTypeDrawerFooter"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        loading={loading}
        data-cy="meeting-type-drawer-cancel-button"
        id="meetingTypeDrawerCancelButton"
      />
      <CustomButton
        htmlType="submit"
        title={meetType ? 'Update' : 'Submit'}
        type="primary"
        onClick={() => form.submit()}
        loading={loading}
        data-cy="meeting-type-drawer-submit-button"
        id="meetingTypeDrawerSubmitButton"
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width="40%"
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
            placeholder="Enter name"
            data-cy="meeting-type-drawer-name-input"
            id="meetingTypeDrawerNameInput"
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
            rows={4}
            placeholder="Enter description"
            data-cy="meeting-type-drawer-description-textarea"
            id="meetingTypeDrawerDescriptionTextarea"
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default MeetingTypeDrawer;
