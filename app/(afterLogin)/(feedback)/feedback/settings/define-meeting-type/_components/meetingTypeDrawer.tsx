import {
  useCreateMeetingType,
  useUpdateMeetingType,
} from '@/store/server/features/CFR/meeting/type/mutations';

import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useIsMobile } from '@/hooks/useIsMobile';

import { Button, Form, Input, Modal } from 'antd';
import SettingsTextArea from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsTextArea';
import { SettingsModalHeader } from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsModalHeader';
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
  const { isMobile } = useIsMobile();
  // Fallback to viewport width in case global isMobile updates after modal open.
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
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
      closeIcon={null}
      footer={null}
      centered={!isMobileViewport}
      width={isMobileViewport ? '100%' : 780}
      destroyOnClose
      style={
        isMobileViewport
          ? {
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              transform: 'none',
              width: '100%',
              maxWidth: '100%',
            }
          : undefined
      }
      styles={{
        content: isMobileViewport
          ? { width: '100%', maxWidth: '100%', margin: 0, borderRadius: 12 }
          : undefined,
        body: isMobileViewport
          ? { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }
          : undefined,
      }}
      title={
        <SettingsModalHeader
          title={
            <span
              className="text-base font-semibold text-gray-700"
              data-cy="meeting-type-drawer-header"
              id="meetingTypeDrawerHeader"
            >
              Meeting Type
            </span>
          }
          onClose={handleDrawerClose}
          data-cy="meeting-type-modal-header"
          closeDataCy="meeting-type-modal-close-button"
        />
      }
      data-cy="meeting-type-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        name="itemForm"
        onFinish={onFinish}
        requiredMark={false}
        data-cy="meeting-type-drawer-form"
        id="meetingTypeDrawerForm"
      >
        <Form.Item
          label={
            <span data-cy="meeting-type-drawer-name-label">
              Name{' '}
              <span
                style={{ color: 'red' }}
                data-cy="meeting-type-drawer-name-required"
              >
                *
              </span>
            </span>
          }
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
          label={
            <span data-cy="meeting-type-drawer-description-label">
              Description{' '}
              <span
                style={{ color: 'red' }}
                data-cy="meeting-type-drawer-description-required"
              >
                *
              </span>
            </span>
          }
          name="description"
          rules={[
            { required: true, message: 'Please enter the item description.' },
            { min: 5, message: 'Description must be at least 5 characters.' },
          ]}
          data-cy="meeting-type-drawer-description-field"
          id="meetingTypeDrawerDescriptionField"
        >
          <SettingsTextArea
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
