'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Modal, Steps, message } from 'antd';
import { LockOutlined, SearchOutlined } from '@ant-design/icons';
import { MdTag } from 'react-icons/md';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import type { CollaborationSpace } from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';

const STEP_ITEMS = [
  { title: 'Select Space' },
  { title: 'Select Channel' },
];

type AnnouncementIntegrationWizardProps = {
  open: boolean;
  focusSpaceId?: string | null;
  onClose: () => void;
};

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

  const [current, setCurrent] = useState(0);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [channelSearch, setChannelSearch] = useState('');

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

  useEffect(() => {
    if (!open) return;
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
  }, [open, focusSpaceId]);

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

  const handleBack = () => {
    if (current === 0 || focusSpaceId) {
      onClose();
      return;
    }
    setCurrent(0);
    setSelectedChannelIds([]);
    setChannelSearch('');
  };

  const handleContinue = () => {
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

  return (
    <Modal
      title="Integrate Collaboration channel"
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
            {current === 0 || focusSpaceId ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={
              current === 1 &&
              (availableChannels.length === 0 ||
                selectedChannelIds.length === 0)
            }
            data-cy="announcement-integration-continue"
          >
            {current === 0 ? 'Continue' : 'Add channels'}
          </Button>
        </div>
      }
      data-cy="announcement-integration-wizard"
    >
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
          current={current}
          labelPlacement="vertical"
          progressDot
          className="announcement-integration-steps mx-auto max-w-xl px-4"
          items={STEP_ITEMS}
          data-cy="announcement-integration-steps"
        />
      </div>

      <div className="mt-6" data-cy="announcement-integration-step-content">
        {current === 0 ? (
          <div data-cy="announcement-integration-step-space">
            <p className="mb-3 text-sm text-gray-500">
              Choose a space from Selamnew Collaboration to integrate.
            </p>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search spaces..."
              value={spaceSearch}
              onChange={(event) => setSpaceSearch(event.target.value)}
              className="mb-3"
              data-cy="announcement-integration-space-search"
            />
            <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto">
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
            {availableChannels.length === 0 ? (
              <p
                className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-400"
                data-cy="announcement-integration-no-channels"
              >
                All channels from this space are already integrated.
              </p>
            ) : (
              <>
                <Input
                  allowClear
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search channels..."
                  value={channelSearch}
                  onChange={(event) => setChannelSearch(event.target.value)}
                  className="mb-3"
                  data-cy="announcement-integration-channel-search"
                />
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
                          <MdTag className="text-gray-400" size={14} />
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
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AnnouncementIntegrationWizard;
