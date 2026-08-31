'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  ColorPicker,
  Form,
  Input,
  Modal,
  Steps,
  message,
} from 'antd';
import { DeleteOutlined, LockOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  SPACE_COLORS,
  useAnnouncementChannelsStore,
} from '@/store/uistate/features/organizationStructure/announcementChannels';
import type { CollaborationSpace } from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { SpaceVisibilityCards } from './CreateSpaceChannelModals';

const SELECT_STEP_ITEMS = [
  { title: 'Select Space' },
  { title: 'Select Channel' },
];

const CREATE_STEP_ITEMS = [
  { title: 'Create Space' },
  { title: 'Create Channels' },
];

type WizardMode = 'select' | 'create-space' | 'create-channel';

type SpaceVisibility = 'public' | 'private';

type CreateSpaceChannelDraft = {
  name: string;
  description?: string;
};

type CreateSpaceWithChannelForm = {
  spaceName: string;
  spaceDescription?: string;
  color: string;
  visibility: SpaceVisibility;
  channels: CreateSpaceChannelDraft[];
};

type CreateChannelForm = {
  channels: CreateSpaceChannelDraft[];
};

type AnnouncementIntegrationWizardProps = {
  open: boolean;
  focusSpaceId?: string | null;
  onClose: () => void;
};

const ChannelDraftList = ({ dataCyPrefix }: { dataCyPrefix: string }) => (
  <Form.List
    name="channels"
    rules={[
      {
        validator: async (_, channels) => {
          if (!channels || channels.length < 1) {
            return Promise.reject(new Error('Add at least one channel'));
          }
        },
      },
    ]}
  >
    {(fields, { add, remove }, { errors }) => (
      <div className="pb-2">
        <div className="mb-3 flex max-h-[280px] flex-col gap-3 overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <div
              key={field.key}
              className="rounded-lg border border-[#E8EDF2] bg-[#FAFBFC] p-4"
              data-cy={`${dataCyPrefix}-${index}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  Channel {index + 1}
                </span>
                {fields.length > 1 ? (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}
                    aria-label={`Remove channel ${index + 1}`}
                    data-cy={`${dataCyPrefix}-remove-${index}`}
                  />
                ) : null}
              </div>
              <Form.Item
                {...field}
                name={[field.name, 'name']}
                label="Channel name"
                className="!mb-4"
                rules={[
                  { required: true, message: 'Enter a channel name' },
                  { min: 2, message: 'Name is too short' },
                ]}
              >
                <Input
                  placeholder="e.g. announcements"
                  className="!bg-white !border-[#E8EDF2]"
                  data-cy={`${dataCyPrefix}-name-${index}`}
                />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'description']}
                label="Description"
                className="!mb-0"
                rules={[{ max: 255, message: 'Max 255 characters' }]}
              >
                <Input.TextArea
                  rows={2}
                  maxLength={255}
                  placeholder="What is this channel for?"
                  className="!bg-white !border-[#E8EDF2]"
                  data-cy={`${dataCyPrefix}-description-${index}`}
                />
              </Form.Item>
            </div>
          ))}
        </div>
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          className="mb-1"
          onClick={() => add({ name: '', description: '' })}
          data-cy={`${dataCyPrefix}-add`}
        >
          Add channel
        </Button>
        <Form.ErrorList errors={errors} />
      </div>
    )}
  </Form.List>
);

const SpaceOption = ({
  space,
  selected,
  onSelect,
}: {
  space: CollaborationSpace;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
      selected
        ? 'border-primary bg-[#F0F5FF]'
        : 'border-[#E8EDF2] bg-white hover:border-gray-300'
    }`}
    data-cy={`announcement-integration-space-${space.id}`}
    data-selected={selected ? 'true' : 'false'}
  >
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: space.color }}
      aria-hidden
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-semibold text-gray-900">
          {space.name}
        </span>
        {space.isPrivate ? (
          <LockOutlined className="text-xs text-gray-400" />
        ) : null}
      </div>
      <span className="text-xs text-gray-400">{space.subtitle}</span>
    </div>
    <span className="text-xs text-gray-400">
      {space.channels.length} channel{space.channels.length === 1 ? '' : 's'}
    </span>
  </button>
);

const AnnouncementIntegrationWizard = ({
  open,
  focusSpaceId,
  onClose,
}: AnnouncementIntegrationWizardProps) => {
  const spaces = useAnnouncementChannelsStore((state) => state.spaces);
  const enabledChannelIds = useAnnouncementChannelsStore(
    (state) => state.enabledChannelIds,
  );
  const addEnabledChannels = useAnnouncementChannelsStore(
    (state) => state.addEnabledChannels,
  );
  const createSpace = useAnnouncementChannelsStore((state) => state.createSpace);
  const createChannel = useAnnouncementChannelsStore(
    (state) => state.createChannel,
  );

  const [mode, setMode] = useState<WizardMode>('select');
  const [current, setCurrent] = useState(0);
  const [createStep, setCreateStep] = useState(0);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [channelSearch, setChannelSearch] = useState('');

  const [createSpaceForm] = Form.useForm<CreateSpaceWithChannelForm>();
  const [createChannelForm] = Form.useForm<CreateChannelForm>();
  const spaceColorValue =
    Form.useWatch('color', createSpaceForm) || SPACE_COLORS[0];
  const draftSpaceName = Form.useWatch('spaceName', createSpaceForm);

  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);

  const filteredSpaces = useMemo(() => {
    const query = spaceSearch.trim().toLowerCase();
    if (!query) return spaces;
    return spaces.filter(
      (space) =>
        space.name.toLowerCase().includes(query) ||
        space.subtitle.toLowerCase().includes(query),
    );
  }, [spaces, spaceSearch]);

  const availableChannels = useMemo(() => {
    if (!selectedSpace) return [];
    return selectedSpace.channels.filter(
      (channel) => !enabledChannelIds.includes(channel.id),
    );
  }, [selectedSpace, enabledChannelIds]);

  const filteredChannels = useMemo(() => {
    const query = channelSearch.trim().toLowerCase();
    if (!query) return availableChannels;
    return availableChannels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.kind.toLowerCase().includes(query),
    );
  }, [availableChannels, channelSearch]);

  const resetCreateForms = () => {
    createSpaceForm.resetFields();
    createChannelForm.resetFields();
  };

  useEffect(() => {
    if (!open) return;
    setMode('select');
    setCreateStep(0);
    createSpaceForm.resetFields();
    createChannelForm.resetFields();
    if (focusSpaceId) {
      setSelectedSpaceId(focusSpaceId);
      setCurrent(1);
    } else {
      setSelectedSpaceId(null);
      setCurrent(0);
    }
    setSelectedChannelIds([]);
    setSpaceSearch('');
    setChannelSearch('');
  }, [open, focusSpaceId, createSpaceForm, createChannelForm]);

  useEffect(() => {
    setChannelSearch('');
  }, [current, selectedSpaceId]);

  const toggleChannel = (channelId: string, checked: boolean) => {
    setSelectedChannelIds((currentIds) =>
      checked
        ? Array.from(new Set([...currentIds, channelId]))
        : currentIds.filter((id) => id !== channelId),
    );
  };

  const allFilteredSelected =
    filteredChannels.length > 0 &&
    filteredChannels.every((channel) =>
      selectedChannelIds.includes(channel.id),
    );
  const someFilteredSelected =
    filteredChannels.some((channel) =>
      selectedChannelIds.includes(channel.id),
    ) && !allFilteredSelected;

  const toggleAllFilteredChannels = (checked: boolean) => {
    const filteredIds = filteredChannels.map((channel) => channel.id);
    setSelectedChannelIds((currentIds) => {
      if (checked) {
        return Array.from(new Set([...currentIds, ...filteredIds]));
      }
      return currentIds.filter((id) => !filteredIds.includes(id));
    });
  };

  const enterCreateSpaceMode = () => {
    createSpaceForm.setFieldsValue({
      color: SPACE_COLORS[0],
      spaceDescription: '',
      visibility: 'public',
      channels: [{ name: '', description: '' }],
    });
    setCreateStep(0);
    setMode('create-space');
  };

  const enterCreateChannelMode = () => {
    createChannelForm.setFieldsValue({
      channels: [{ name: '', description: '' }],
    });
    setMode('create-channel');
  };

  const handleBack = () => {
    if (mode === 'create-space') {
      if (createStep === 1) {
        setCreateStep(0);
        return;
      }
      resetCreateForms();
      setCreateStep(0);
      setMode('select');
      return;
    }
    if (mode === 'create-channel') {
      createChannelForm.resetFields();
      setMode('select');
      return;
    }
    if (current === 0 || focusSpaceId) {
      onClose();
      return;
    }
    setCurrent(0);
    setSelectedChannelIds([]);
    setChannelSearch('');
  };

  const handleCreateSpaceContinue = async () => {
    try {
      await createSpaceForm.validateFields([
        'spaceName',
        'spaceDescription',
        'color',
        'visibility',
      ]);
      setCreateStep(1);
    } catch {
      /* validation */
    }
  };

  const handleCreateSpaceWithChannel = async () => {
    try {
      const values = await createSpaceForm.validateFields();
      const drafts = (values.channels || []).filter((channel) =>
        channel.name?.trim(),
      );
      if (drafts.length === 0) {
        message.warning('Add at least one channel');
        return;
      }

      const normalizedNames = drafts.map((channel) =>
        channel.name
          .trim()
          .replace(/^#/, '')
          .toLowerCase()
          .replace(/\s+/g, '-'),
      );
      if (new Set(normalizedNames).size !== normalizedNames.length) {
        message.warning('Channel names must be unique');
        return;
      }

      const space = createSpace({
        name: values.spaceName,
        description: values.spaceDescription,
        color: values.color || SPACE_COLORS[0],
        isPrivate: values.visibility === 'private',
      });

      const createdChannels = [];
      for (const draft of drafts) {
        const channel = createChannel({
          spaceId: space.id,
          name: draft.name,
          description: draft.description,
          channelType: 'posts',
          enableForAnnouncement: true,
        });
        if (!channel) {
          NotificationMessage.error({
            message: 'Could not create channel',
            description: `#${draft.name} could not be created.`,
          });
          return;
        }
        createdChannels.push(channel);
      }

      NotificationMessage.success({
        message: 'Space & channels added',
        description: `${space.name} · ${createdChannels.length} channel${
          createdChannels.length === 1 ? '' : 's'
        } ready on Announcement.`,
      });
      resetCreateForms();
      setCreateStep(0);
      onClose();
    } catch {
      /* validation */
    }
  };

  const handleCreateChannel = async () => {
    if (!selectedSpaceId) {
      message.warning('Select a space first');
      return;
    }
    try {
      const values = await createChannelForm.validateFields();
      const drafts = (values.channels || []).filter((channel) =>
        channel.name?.trim(),
      );
      if (drafts.length === 0) {
        message.warning('Add at least one channel');
        return;
      }

      const normalizedNames = drafts.map((channel) =>
        channel.name
          .trim()
          .replace(/^#/, '')
          .toLowerCase()
          .replace(/\s+/g, '-'),
      );
      if (new Set(normalizedNames).size !== normalizedNames.length) {
        message.warning('Channel names must be unique');
        return;
      }

      const createdIds: string[] = [];
      for (const draft of drafts) {
        const channel = createChannel({
          spaceId: selectedSpaceId,
          name: draft.name,
          description: draft.description,
          channelType: 'posts',
          enableForAnnouncement: false,
        });
        if (!channel) {
          NotificationMessage.error({
            message: 'Could not create channel',
            description: `#${draft.name} could not be created. It may already exist.`,
          });
          return;
        }
        createdIds.push(channel.id);
      }

      NotificationMessage.success({
        message:
          createdIds.length === 1 ? 'Channel created' : 'Channels created',
        description: `${createdIds.length} channel${
          createdIds.length === 1 ? '' : 's'
        } created. Select below to integrate.`,
      });
      setSelectedChannelIds((currentIds) =>
        Array.from(new Set([...currentIds, ...createdIds])),
      );
      createChannelForm.resetFields();
      setMode('select');
    } catch {
      /* validation */
    }
  };

  const handleContinue = () => {
    if (mode === 'create-space') {
      if (createStep === 0) {
        void handleCreateSpaceContinue();
        return;
      }
      void handleCreateSpaceWithChannel();
      return;
    }
    if (mode === 'create-channel') {
      void handleCreateChannel();
      return;
    }

    if (current === 0) {
      if (!selectedSpaceId) {
        message.warning('Select a Collaboration space to continue');
        return;
      }
      setCurrent(1);
      return;
    }

    if (selectedChannelIds.length === 0) {
      message.warning('Select at least one channel');
      return;
    }

    addEnabledChannels(selectedChannelIds);
    message.success(
      `${selectedChannelIds.length} channel${
        selectedChannelIds.length === 1 ? '' : 's'
      } added to Announcement`,
    );
    onClose();
  };

  const modalTitle =
    mode === 'create-space'
      ? createStep === 0
        ? 'Create space'
        : 'Create channels'
      : mode === 'create-channel'
        ? 'Create channels'
        : 'Integrate Collaboration channel';

  const primaryLabel =
    mode === 'create-space'
      ? createStep === 0
        ? 'Continue'
        : 'Create'
      : mode === 'create-channel'
        ? 'Create'
        : current === 0
          ? 'Continue'
          : 'Add channels';

  const backLabel =
    mode !== 'select' || (current !== 0 && !focusSpaceId) ? 'Back' : 'Cancel';

  const primaryDisabled =
    mode === 'select' &&
    current === 1 &&
    (availableChannels.length === 0 || selectedChannelIds.length === 0);

  const showSteps = mode === 'select' || mode === 'create-space';
  const stepsCurrent = mode === 'create-space' ? createStep : current;
  const stepsItems =
    mode === 'create-space' ? CREATE_STEP_ITEMS : SELECT_STEP_ITEMS;

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      width={640}
      destroyOnClose
      footer={
        <div
          className="flex justify-end gap-2"
          data-cy="announcement-integration-actions"
        >
          <Button onClick={handleBack} data-cy="announcement-integration-back">
            {backLabel}
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={primaryDisabled}
            data-cy="announcement-integration-continue"
          >
            {primaryLabel}
          </Button>
        </div>
      }
      data-cy="announcement-integration-wizard"
    >
      {showSteps ? (
        <div data-cy="announcement-integration-steps-container" className="my-2">
          <style data-cy="announcement-integration-steps-style">{`
            .announcement-integration-steps .ant-steps-item-title {
              white-space: nowrap !important;
            }
            .announcement-integration-steps .ant-steps-item-process .ant-steps-item-title,
            .announcement-integration-steps .ant-steps-item-finish .ant-steps-item-title {
              color: #1e40af !important;
            }
            .announcement-integration-steps .ant-steps-item-wait .ant-steps-item-title {
              color: #d9d9d9 !important;
            }
          `}</style>
          <Steps
            responsive={false}
            current={stepsCurrent}
            labelPlacement="vertical"
            progressDot
            className="announcement-integration-steps mx-auto max-w-xl px-4"
            items={stepsItems}
            data-cy="announcement-integration-steps"
          />
        </div>
      ) : null}

      <div className="mt-6" data-cy="announcement-integration-step-content">
        {mode === 'create-space' ? (
          <div data-cy="announcement-integration-create-space">
            <Form
              form={createSpaceForm}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                color: SPACE_COLORS[0],
                spaceDescription: '',
                visibility: 'public',
                channels: [{ name: '', description: '' }],
              }}
              data-cy="announcement-integration-create-space-form"
            >
              {createStep === 0 ? (
                <>
                  <p className="mb-3 text-sm text-gray-500">
                    Set up a new Collaboration space. Next you&apos;ll create
                    its channels.
                  </p>
                  <Form.Item label="Name" className="!mb-4">
                    <div className="flex items-start gap-2">
                      <Form.Item
                        name="spaceName"
                        noStyle
                        rules={[
                          { required: true, message: 'Enter a space name' },
                          { min: 2, message: 'Name is too short' },
                        ]}
                      >
                        <Input
                          placeholder="e.g. Product Launch"
                          className="!bg-[#F3F5F8] !border-[#E8EDF2]"
                          data-cy="announcement-integration-create-space-name"
                        />
                      </Form.Item>
                      <Form.Item
                        name="color"
                        noStyle
                        getValueFromEvent={(color) =>
                          typeof color === 'string'
                            ? color
                            : color.toHexString()
                        }
                        getValueProps={(value) => ({
                          value: value || SPACE_COLORS[0],
                        })}
                      >
                        <ColorPicker
                          size="large"
                          showText={false}
                          presets={[
                            { label: 'Recommended', colors: SPACE_COLORS },
                          ]}
                          className="!shrink-0"
                          data-cy="announcement-integration-create-space-color"
                        >
                          <button
                            type="button"
                            aria-label="Choose space color"
                            className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-[#E8EDF2] p-0"
                            style={{ backgroundColor: spaceColorValue }}
                            data-cy="announcement-integration-create-space-color-swatch"
                          />
                        </ColorPicker>
                      </Form.Item>
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="spaceDescription"
                    label="Description"
                    className="!mb-4"
                    rules={[{ max: 255, message: 'Max 255 characters' }]}
                  >
                    <Input.TextArea
                      rows={3}
                      maxLength={255}
                      placeholder="What is this space about?"
                      className="!bg-[#F3F5F8] !border-[#E8EDF2]"
                      data-cy="announcement-integration-create-space-description"
                    />
                  </Form.Item>

                  <Form.Item
                    name="visibility"
                    label="Type"
                    className="!mb-2"
                    rules={[
                      { required: true, message: 'Choose a space type' },
                    ]}
                  >
                    <SpaceVisibilityCards />
                  </Form.Item>
                </>
              ) : (
                <>
                  <p className="mb-1 text-sm font-medium text-gray-900">
                    {draftSpaceName?.trim() || 'New space'}
                  </p>
                  <p className="mb-3 text-sm text-gray-500">
                    Create channels for this space. All of them will be added to
                    Announcement.
                  </p>
                  <ChannelDraftList dataCyPrefix="announcement-integration-create-space-channel" />
                </>
              )}
            </Form>
          </div>
        ) : mode === 'create-channel' ? (
          <div data-cy="announcement-integration-create-channel">
            <p className="mb-1 text-sm font-medium text-gray-900">
              {selectedSpace?.name}
            </p>
            <p className="mb-3 text-sm text-gray-500">
              Create one or more posts channels in this space, then select them
              to integrate.
            </p>
            <Form
              form={createChannelForm}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                channels: [{ name: '', description: '' }],
              }}
              data-cy="announcement-integration-create-channel-form"
            >
              <ChannelDraftList dataCyPrefix="announcement-integration-create-channel" />
            </Form>
          </div>
        ) : current === 0 ? (
          <div data-cy="announcement-integration-step-space">
            <p className="mb-3 text-sm text-gray-500">
              Choose a space from Selamnew Collaboration to integrate.
            </p>
            <div className="mb-3 flex items-center gap-2">
              <Input
                allowClear
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search spaces..."
                value={spaceSearch}
                onChange={(event) => setSpaceSearch(event.target.value)}
                className="min-w-0 flex-1"
                data-cy="announcement-integration-space-search"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="shrink-0"
                onClick={enterCreateSpaceMode}
                data-cy="announcement-integration-create-space"
              >
                Create space
              </Button>
            </div>
            <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
              {filteredSpaces.length === 0 ? (
                <p
                  className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-400"
                  data-cy="announcement-integration-space-empty"
                >
                  No spaces match your search.
                </p>
              ) : (
                filteredSpaces.map((space) => (
                  <SpaceOption
                    key={space.id}
                    space={space}
                    selected={selectedSpaceId === space.id}
                    onSelect={() => setSelectedSpaceId(space.id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div data-cy="announcement-integration-step-channel">
            <p className="mb-1 text-sm font-medium text-gray-900">
              {selectedSpace?.name}
            </p>
            <p className="mb-3 text-sm text-gray-500">
              Select the channels that should appear on the Announcement page.
            </p>
            <div className="mb-3 flex items-center gap-2">
              <Input
                allowClear
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search channels..."
                value={channelSearch}
                onChange={(event) => setChannelSearch(event.target.value)}
                className="min-w-0 flex-1"
                disabled={availableChannels.length === 0}
                data-cy="announcement-integration-channel-search"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="shrink-0"
                disabled={!selectedSpaceId}
                onClick={enterCreateChannelMode}
                data-cy="announcement-integration-create-channel"
              >
                Create channel
              </Button>
            </div>
            {availableChannels.length === 0 ? (
              <p
                className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-400"
                data-cy="announcement-integration-no-channels"
              >
                All channels from this space are already integrated. Create a
                new channel above to add more.
              </p>
            ) : (
              <div className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
                  {filteredChannels.length === 0 ? (
                    <p
                      className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-400"
                      data-cy="announcement-integration-channel-empty"
                    >
                      No channels match your search.
                    </p>
                  ) : (
                    <>
                      <label
                        className="mb-1 flex cursor-pointer items-center gap-2 rounded-md border-b border-gray-100 px-2 pb-2 pt-1"
                        data-cy="announcement-integration-select-all"
                      >
                        <Checkbox
                          checked={allFilteredSelected}
                          indeterminate={someFilteredSelected}
                          onChange={(event) =>
                            toggleAllFilteredChannels(event.target.checked)
                          }
                          data-cy="announcement-integration-select-all-check"
                        />
                        <span className="text-sm font-medium text-gray-800">
                          Select all
                          {channelSearch.trim() ? ' matching' : ''}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({selectedChannelIds.length}/
                          {availableChannels.length})
                        </span>
                      </label>
                      {filteredChannels.map((channel) => (
                        <label
                          key={channel.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-50"
                          data-cy={`announcement-integration-channel-${channel.id}`}
                        >
                          <Checkbox
                            checked={selectedChannelIds.includes(channel.id)}
                            onChange={(event) =>
                              toggleChannel(channel.id, event.target.checked)
                            }
                            data-cy={`announcement-integration-channel-check-${channel.id}`}
                          />
                          <span className="text-sm text-gray-800">
                            #{channel.name}
                          </span>
                          <span className="text-xs capitalize text-gray-400">
                            {channel.kind}
                          </span>
                        </label>
                      ))}
                    </>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AnnouncementIntegrationWizard;
