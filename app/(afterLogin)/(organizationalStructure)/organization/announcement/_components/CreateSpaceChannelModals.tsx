'use client';

import type { ReactNode } from 'react';
import { Button, ColorPicker, Form, Input, Modal } from 'antd';
import { GlobalOutlined, LockOutlined } from '@ant-design/icons';
import type {
  CollaborationChannel,
  CollaborationSpace,
} from './mockAnnouncementService';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  SPACE_COLORS,
  useAnnouncementChannelsStore,
} from '@/store/uistate/features/organizationStructure/announcementChannels';
import { collaborationColors } from './collaborationColors';

type SpaceVisibility = 'public' | 'private';

type SpaceFormValues = {
  name: string;
  description?: string;
  color: string;
  visibility: SpaceVisibility;
};

export const SpaceVisibilityCards = ({
  value,
  onChange,
}: {
  value?: SpaceVisibility;
  onChange?: (value: SpaceVisibility) => void;
}) => {
  const options: {
    value: SpaceVisibility;
    title: string;
    description: string;
    icon: ReactNode;
  }[] = [
    {
      value: 'public',
      title: 'Public',
      description: 'Anyone in the organization can find and join.',
      icon: <GlobalOutlined className="text-base" />,
    },
    {
      value: 'private',
      title: 'Private',
      description: 'Only invited members can see this space.',
      icon: <LockOutlined className="text-base" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2" data-cy="announcement-space-visibility-cards">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className="rounded-lg border px-3 py-3 text-left transition"
            style={{
              borderColor: selected ? collaborationColors.primary : '#E5E7EB',
              borderWidth: selected ? 2 : 1,
              background: selected ? '#F8FAFB' : '#FFFFFF',
            }}
            data-cy={`announcement-space-visibility-${option.value}`}
            data-selected={selected ? 'true' : 'false'}
          >
            <span
              className="mb-2 inline-flex"
              style={{ color: selected ? collaborationColors.primary : '#6B7280' }}
            >
              {option.icon}
            </span>
            <span
              className="block text-sm font-semibold"
              style={{ color: selected ? collaborationColors.primary : '#111827' }}
            >
              {option.title}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-gray-500">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
};

type EditSpaceModalProps = {
  open: boolean;
  space?: CollaborationSpace | null;
  onClose: () => void;
};

export const EditSpaceModal = ({ open, space, onClose }: EditSpaceModalProps) => {
  const [form] = Form.useForm<SpaceFormValues>();
  const updateSpace = useAnnouncementChannelsStore((state) => state.updateSpace);
  const colorValue = Form.useWatch('color', form) || space?.color || SPACE_COLORS[0];

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleOk = async () => {
    if (!space) return;
    try {
      const values = await form.validateFields();
      const updated = updateSpace(space.id, {
        name: values.name,
        description: values.description,
        color: values.color || SPACE_COLORS[0],
        isPrivate: values.visibility === 'private',
      });
      if (!updated) {
        NotificationMessage.error({ message: 'Could not update space' });
        return;
      }
      NotificationMessage.success({
        message: 'Space updated',
        description: `${updated.name} settings were saved.`,
      });
      handleClose();
    } catch {
      /* validation */
    }
  };

  return (
    <Modal
      title="Space settings"
      open={open}
      onCancel={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="primary"
            onClick={() => void handleOk()}
            data-cy="announcement-edit-space-submit"
          >
            Save
          </Button>
          <Button onClick={handleClose} data-cy="announcement-edit-space-cancel">
            Cancel
          </Button>
        </div>
      }
      destroyOnClose
      width={440}
      afterOpenChange={(isOpen) => {
        if (!isOpen || !space) return;
        form.setFieldsValue({
          name: space.name,
          description: space.description || '',
          color: space.color || SPACE_COLORS[0],
          visibility: space.isPrivate ? 'private' : 'public',
        });
      }}
      data-cy="announcement-edit-space-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="pt-1"
        data-cy="announcement-edit-space-form"
      >
        <Form.Item label="Name" className="!mb-4">
          <div className="flex items-start gap-2">
            <Form.Item
              name="name"
              noStyle
              rules={[
                { required: true, message: 'Enter a space name' },
                { min: 2, message: 'Name is too short' },
              ]}
            >
              <Input
                placeholder="e.g. Product Launch"
                className="!bg-[#F3F5F8] !border-[#E8EDF2]"
                data-cy="announcement-edit-space-name"
              />
            </Form.Item>
            <Form.Item
              name="color"
              noStyle
              getValueFromEvent={(color) =>
                typeof color === 'string' ? color : color.toHexString()
              }
              getValueProps={(value) => ({ value: value || SPACE_COLORS[0] })}
            >
              <ColorPicker
                size="large"
                showText={false}
                presets={[{ label: 'Recommended', colors: SPACE_COLORS }]}
                className="!shrink-0"
                data-cy="announcement-edit-space-color"
              >
                <button
                  type="button"
                  aria-label="Choose space color"
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-[#E8EDF2] p-0"
                  style={{ backgroundColor: colorValue }}
                  data-cy="announcement-edit-space-color-swatch"
                />
              </ColorPicker>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          className="!mb-4"
          rules={[{ max: 255, message: 'Max 255 characters' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={255}
            placeholder="What is this space about?"
            className="!bg-[#F3F5F8] !border-[#E8EDF2]"
            data-cy="announcement-edit-space-description"
          />
        </Form.Item>

        <Form.Item
          name="visibility"
          label="Type"
          className="!mb-6"
          rules={[{ required: true, message: 'Choose a space type' }]}
        >
          <SpaceVisibilityCards />
        </Form.Item>
      </Form>
    </Modal>
  );
};

type EditChannelModalProps = {
  open: boolean;
  spaceId?: string | null;
  channel?: CollaborationChannel | null;
  onClose: () => void;
};

type EditChannelForm = {
  name: string;
  description?: string;
};

export const EditChannelModal = ({
  open,
  spaceId,
  channel,
  onClose,
}: EditChannelModalProps) => {
  const [form] = Form.useForm<EditChannelForm>();
  const updateChannel = useAnnouncementChannelsStore(
    (state) => state.updateChannel,
  );

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleOk = async () => {
    if (!spaceId || !channel) return;
    try {
      const values = await form.validateFields();
      const updated = updateChannel(spaceId, channel.id, {
        name: values.name,
        description: values.description,
      });
      if (!updated) {
        NotificationMessage.error({
          message: 'Could not update channel',
          description: 'Channel name may already exist in this space.',
        });
        return;
      }
      NotificationMessage.success({
        message: 'Channel updated',
        description: `#${updated.name} settings were saved.`,
      });
      handleClose();
    } catch {
      /* validation */
    }
  };

  return (
    <Modal
      title={channel ? `Settings · #${channel.name}` : 'Channel settings'}
      open={open}
      onCancel={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="primary"
            onClick={() => void handleOk()}
            data-cy="announcement-edit-channel-submit"
          >
            Save
          </Button>
          <Button onClick={handleClose} data-cy="announcement-edit-channel-cancel">
            Cancel
          </Button>
        </div>
      }
      destroyOnClose
      width={440}
      afterOpenChange={(isOpen) => {
        if (!isOpen || !channel) return;
        form.setFieldsValue({
          name: channel.name,
          description: channel.description || '',
        });
      }}
      data-cy="announcement-edit-channel-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="pt-1"
        data-cy="announcement-edit-channel-form"
      >
        <Form.Item
          name="name"
          label="Channel name"
          className="!mb-4"
          rules={[
            { required: true, message: 'Enter a channel name' },
            { min: 2, message: 'Name is too short' },
          ]}
        >
          <Input
            placeholder="e.g. project-alpha"
            className="!bg-[#F3F5F8] !border-[#E8EDF2]"
            data-cy="announcement-edit-channel-name"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          className="!mb-8"
          rules={[{ max: 255, message: 'Max 255 characters' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={255}
            placeholder="What is this channel for?"
            className="!bg-[#F3F5F8] !border-[#E8EDF2]"
            data-cy="announcement-edit-channel-description"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

