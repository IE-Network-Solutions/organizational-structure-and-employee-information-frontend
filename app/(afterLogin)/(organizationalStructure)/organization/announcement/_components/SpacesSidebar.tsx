'use client';

import {
  Button,
  Collapse,
  Dropdown,
  Empty,
  Typography,
  type MenuProps,
} from 'antd';
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
import { isCollabAdminRole } from '@/store/server/features/collaboration';

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
  mentionChannelIds?: ReadonlySet<string>;
};

const SpaceActivityIndicator = ({
  space,
  hasMention,
}: {
  space: CollaborationSpace;
  hasMention: boolean;
}) => {
  if (hasMention) {
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

const getSpaceHeaderMenuItems = (
  spaceId: string,
  onEditSpace?: (spaceId: string) => void,
  onAddSpaceMembers?: (spaceId: string) => void,
): MenuProps['items'] => {
  const items: NonNullable<MenuProps['items']> = [];

  if (onEditSpace) {
    items.push({
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onEditSpace(spaceId);
      },
    });
  }

  if (onAddSpaceMembers) {
    items.push({
      key: 'add-members',
      icon: <UserAddOutlined />,
      label: 'Add members',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onAddSpaceMembers(spaceId);
      },
    });
  }

  return items;
};

const SpacePanelHeader = ({
  space,
  hasMention,
  onAddSpaceMembers,
  onEditSpace,
}: {
  space: CollaborationSpace;
  hasMention: boolean;
  onAddSpaceMembers?: (spaceId: string) => void;
  onEditSpace?: (spaceId: string) => void;
}) => (
  <div
    className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5"
    data-cy={`announcement-space-header-${space.id}`}
  >
    <span
      data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-span-82"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: space.color }}
      aria-hidden
    />
    <div
      data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-div-87"
      className="min-w-0 flex-1"
    >
      <div
        data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-div-88"
        className="flex items-center gap-1.5"
      >
        <span
          data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-span-89"
          className="truncate text-sm font-semibold text-gray-900"
        >
          {space.name}
        </span>
        <SpaceActivityIndicator space={space} hasMention={hasMention} />
      </div>
      <div
        data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-div-94"
        className="truncate text-xs text-gray-400"
      >
        {space.subtitle}
      </div>
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
          items: getSpaceHeaderMenuItems(
            space.id,
            onEditSpace,
            onAddSpaceMembers,
          ),
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
  hasMention,
  onSelect,
  onEditChannel,
}: {
  channel: CollaborationChannel;
  selected: boolean;
  hasMention: boolean;
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
      <span
        data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-span-187"
        className="min-w-0 truncate"
      >
        {channel.name}
      </span>
      {hasMention ? (
        <span
          className="inline-flex shrink-0 items-center font-semibold leading-none text-[#EF4444]"
          aria-label="You were mentioned in this channel"
          title="Mention"
          data-cy={`announcement-channel-mention-${channel.id}`}
        >
          @
        </span>
      ) : null}
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
  mentionChannelIds = new Set<string>(),
}: SpacesSidebarProps) => {
  const items = spaces.map((space) => {
    const canManageSpace = isCollabAdminRole(space.currentUserRole);
    return {
      key: space.id,
      label: (
        <SpacePanelHeader
          space={space}
          hasMention={space.channels.some((channel) =>
            mentionChannelIds.has(channel.id),
          )}
          onAddSpaceMembers={canManageSpace ? onAddSpaceMembers : undefined}
          onEditSpace={canManageSpace ? onEditSpace : undefined}
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
              hasMention={mentionChannelIds.has(channel.id)}
              onSelect={() =>
                onSelectChannel({ spaceId: space.id, channelId: channel.id })
              }
              onEditChannel={
                canManageSpace && onEditChannel
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
    };
  });

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

      <div
        data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-div-289"
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-4"
      >
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
        <div
          data-cy="organization-announcement-components-spacessidebar-tsx-spacessidebar-div-320"
          className="text-center"
        >
          <h2
            className="m-0 text-lg font-semibold text-gray-800"
            data-cy="announcement-select-space-empty-title"
          >
            {hasIntegratedChannels
              ? 'Select a Space'
              : 'No channels integrated'}
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
