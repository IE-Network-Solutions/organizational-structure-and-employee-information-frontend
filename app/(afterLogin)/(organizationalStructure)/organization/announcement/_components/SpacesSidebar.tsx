'use client';

import { Button, Collapse, Dropdown, Empty, Typography } from 'antd';
import {
  LockOutlined,
  MoreOutlined,
  SettingOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { collaborationColors } from './collaborationColors';
import type {
  CollaborationChannel,
  CollaborationSpace,
} from './mockAnnouncementService';

const { Text } = Typography;

export type SelectedChannelTarget = {
  spaceId: string;
  channelId: string;
};

type SpacesSidebarProps = {
  spaces: CollaborationSpace[];
  selected: SelectedChannelTarget | null;
  expandedSpaceKeys: string[];
  onExpandedChange: (keys: string[]) => void;
  onSelectChannel: (target: SelectedChannelTarget) => void;
  onAddSpaceMembers?: (spaceId: string) => void;
  onEditSpace?: (spaceId: string) => void;
  onEditChannel?: (target: SelectedChannelTarget) => void;
};

const SpaceActivityIndicator = ({ space }: { space: CollaborationSpace }) => {
  if (space.hasMention) {
    return (
      <span
        className="inline-flex shrink-0 items-center text-sm font-semibold leading-none text-[#EF4444]"
        aria-label="You were mentioned"
        title="Mention"
        data-cy={`announcement-space-mention-${space.id}`}
      >
        @
      </span>
    );
  }

  if (space.hasNotification) {
    return (
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#EF4444]"
        aria-label="Unread notifications"
        title="Unread"
        data-cy={`announcement-space-notification-${space.id}`}
      />
    );
  }

  return null;
};

const SpacePanelHeader = ({
  space,
  onAddSpaceMembers,
  onEditSpace,
}: {
  space: CollaborationSpace;
  onAddSpaceMembers?: (spaceId: string) => void;
  onEditSpace?: (spaceId: string) => void;
}) => (
  <div
    className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5"
    data-cy={`announcement-space-header-${space.id}`}
  >
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: space.color }}
      aria-hidden
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <span className="truncate text-sm font-semibold text-gray-900">
          {space.name}
        </span>
        <SpaceActivityIndicator space={space} />
      </div>
      <div className="truncate text-xs text-gray-400">{space.subtitle}</div>
    </div>
    {space.isPrivate ? (
      <LockOutlined
        className="shrink-0 text-xs text-gray-400"
        data-cy={`announcement-space-lock-${space.id}`}
      />
    ) : null}
    {onAddSpaceMembers || onEditSpace ? (
      <Dropdown
        menu={{
          items: [
            ...(onEditSpace
              ? [
                  {
                    key: 'settings',
                    icon: <SettingOutlined />,
                    label: 'Settings',
                    onClick: ({ domEvent }: { domEvent: Event }) => {
                      domEvent.stopPropagation();
                      onEditSpace(space.id);
                    },
                  },
                ]
              : []),
            ...(onAddSpaceMembers
              ? [
                  {
                    key: 'add-members',
                    icon: <UserAddOutlined />,
                    label: 'Add members',
                    onClick: ({ domEvent }: { domEvent: Event }) => {
                      domEvent.stopPropagation();
                      onAddSpaceMembers(space.id);
                    },
                  },
                ]
              : []),
          ],
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          onClick={(event) => event.stopPropagation()}
          className="!flex !h-6 !w-6 !shrink-0 !items-center !justify-center !text-gray-400 hover:!text-gray-700"
          aria-label={`Space options for ${space.name}`}
          data-cy={`announcement-space-menu-${space.id}`}
        />
      </Dropdown>
    ) : null}
  </div>
);

const ChannelRow = ({
  channel,
  selected,
  onSelect,
  onEditChannel,
}: {
  channel: CollaborationChannel;
  selected: boolean;
  onSelect: () => void;
  onEditChannel?: () => void;
}) => (
  <div
    className={`group flex w-full items-center gap-1 rounded-md px-1 py-0.5 transition ${
      selected ? '' : 'hover:bg-white/70'
    }`}
    style={
      selected
        ? {
            background: '#DBEAFE',
            boxShadow: `inset 0 0 0 1px ${collaborationColors.primary}33`,
          }
        : undefined
    }
    data-cy={`announcement-channel-row-${channel.id}`}
  >
    <button
      type="button"
      onClick={onSelect}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-md border-0 bg-transparent px-1.5 py-1 text-left text-sm"
      style={{
        color: selected ? collaborationColors.primary : '#4B5563',
        fontWeight: selected ? 500 : undefined,
      }}
      data-cy={`announcement-channel-${channel.id}`}
      data-selected={selected ? 'true' : 'false'}
    >
      <span className="min-w-0 truncate">{channel.name}</span>
    </button>
    {onEditChannel ? (
      <Dropdown
        menu={{
          items: [
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                onEditChannel();
              },
            },
          ],
        }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          onClick={(event) => event.stopPropagation()}
          className="!flex !h-6 !w-6 !shrink-0 !items-center !justify-center !text-gray-400 opacity-0 group-hover:!opacity-100 hover:!text-gray-700 focus-visible:!opacity-100"
          aria-label={`Channel options for ${channel.name}`}
          data-cy={`announcement-channel-menu-${channel.id}`}
        />
      </Dropdown>
    ) : null}
  </div>
);

const SpacesSidebar = ({
  spaces,
  selected,
  expandedSpaceKeys,
  onExpandedChange,
  onSelectChannel,
  onAddSpaceMembers,
  onEditSpace,
  onEditChannel,
}: SpacesSidebarProps) => {
  const items = spaces.map((space) => ({
    key: space.id,
    label: (
      <SpacePanelHeader
        space={space}
        onAddSpaceMembers={onAddSpaceMembers}
        onEditSpace={onEditSpace}
      />
    ),
    children: (
      <div
        className="flex flex-col gap-0.5 pb-1 pl-1"
        data-cy={`announcement-space-channels-${space.id}`}
      >
        {space.channels.map((channel) => (
          <ChannelRow
            key={channel.id}
            channel={channel}
            selected={
              selected?.spaceId === space.id &&
              selected?.channelId === channel.id
            }
            onSelect={() =>
              onSelectChannel({ spaceId: space.id, channelId: channel.id })
            }
            onEditChannel={
              onEditChannel
                ? () =>
                    onEditChannel({
                      spaceId: space.id,
                      channelId: channel.id,
                    })
                : undefined
            }
          />
        ))}
      </div>
    ),
  }));

  return (
    <aside
      className="flex h-full w-full flex-col border-r border-[#E5E7EB]"
      style={{ background: collaborationColors.surface }}
      data-cy="announcement-spaces-sidebar"
    >
      <div
        className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4"
        data-cy="announcement-spaces-sidebar-header"
      >
        <Text
          className="!mb-0 text-[11px] font-semibold uppercase tracking-wider !text-gray-400"
          data-cy="announcement-spaces-label"
        >
          Spaces
        </Text>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <Collapse
          accordion
          ghost
          bordered={false}
          activeKey={expandedSpaceKeys}
          onChange={(keys) =>
            onExpandedChange(Array.isArray(keys) ? keys : keys ? [keys] : [])
          }
          items={items}
          className="announcement-spaces-collapse [&_.ant-collapse-item]:!border-0 [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!rounded-lg [&_.ant-collapse-header]:!px-2 [&_.ant-collapse-header]:!py-2 [&_.ant-collapse-header]:hover:!bg-white/60 [&_.ant-collapse-content-box]:!px-1 [&_.ant-collapse-content-box]:!pb-0 [&_.ant-collapse-content-box]:!pt-0"
          expandIconPosition="end"
          data-cy="announcement-spaces-accordion"
        />
      </div>
    </aside>
  );
};

export const SelectSpaceEmptyState = ({
  hasIntegratedChannels = true,
}: {
  hasIntegratedChannels?: boolean;
}) => (
  <div
    className="flex h-full min-h-[360px] flex-col items-center justify-center bg-white px-6 text-center"
    data-cy="announcement-select-space-empty"
  >
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="text-center">
          <h2
            className="m-0 text-lg font-semibold text-gray-800"
            data-cy="announcement-select-space-empty-title"
          >
            {hasIntegratedChannels ? 'Select a Space' : 'No channels integrated'}
          </h2>
          <p
            className="mt-2 max-w-sm text-sm text-gray-500"
            data-cy="announcement-select-space-empty-subtitle"
          >
            {hasIntegratedChannels
              ? 'Choose a space from the sidebar, open a channel, or create one from settings.'
              : 'Open Announcement settings to integrate Collaboration channels, or create a space there.'}
          </p>
        </div>
      }
      data-cy="announcement-select-space-empty-antd"
    />
  </div>
);

export default SpacesSidebar;
