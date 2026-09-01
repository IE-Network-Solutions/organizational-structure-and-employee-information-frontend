'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Modal,
  Popconfirm,
  Row,
  Typography,
  type MenuProps,
} from 'antd';
import {
  DeleteOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { MdTag } from 'react-icons/md';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import AnnouncementIntegrationWizard from './AnnouncementIntegrationWizard';

const { Title, Paragraph } = Typography;

type AnnouncementSettingsPanelProps = {
  /** When false, hide the header copy (parent already explains context). */
  showIntro?: boolean;
};

const AnnouncementSettingsPanel = ({
  showIntro = true,
}: AnnouncementSettingsPanelProps) => {
  const spaces = useAnnouncementChannelsStore((state) => state.spaces);
  const enabledChannelIds = useAnnouncementChannelsStore(
    (state) => state.enabledChannelIds,
  );
  const integrationWizardOpen = useAnnouncementChannelsStore(
    (state) => state.integrationWizardOpen,
  );
  const integrationFocusSpaceId = useAnnouncementChannelsStore(
    (state) => state.integrationFocusSpaceId,
  );
  const openIntegrationWizard = useAnnouncementChannelsStore(
    (state) => state.openIntegrationWizard,
  );
  const closeIntegrationWizard = useAnnouncementChannelsStore(
    (state) => state.closeIntegrationWizard,
  );
  const removeEnabledChannel = useAnnouncementChannelsStore(
    (state) => state.removeEnabledChannel,
  );
  const removeSpaceIntegration = useAnnouncementChannelsStore(
    (state) => state.removeSpaceIntegration,
  );

  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>(
    {},
  );

  const integratedSpaces = useMemo(
    () =>
      spaces
        .map((space) => ({
          ...space,
          channels: space.channels.filter((channel) =>
            enabledChannelIds.includes(channel.id),
          ),
        }))
        .filter((space) => space.channels.length > 0),
    [spaces, enabledChannelIds],
  );

  const isEmpty = integratedSpaces.length === 0;

  const toggleExpand = (spaceId: string) => {
    setExpandedSpaces((prev) => ({ ...prev, [spaceId]: !prev[spaceId] }));
  };

  const confirmRemoveSpace = (spaceId: string, spaceName: string) => {
    Modal.confirm({
      title: 'Remove this space from Announcement?',
      content: `All integrated channels from “${spaceName}” will be removed.`,
      okText: 'Remove',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => removeSpaceIntegration(spaceId),
    });
  };

  const getSpaceMenuItems = (
    spaceId: string,
    spaceName: string,
  ): MenuProps['items'] => [
    {
      key: 'add-more',
      icon: <PlusOutlined className="!text-primary" />,
      label: (
        <span
          data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-101"
          className="text-primary"
        >
          Add more
        </span>
      ),
      onClick: () => openIntegrationWizard(spaceId),
    },
    {
      key: 'remove',
      danger: true,
      icon: <DeleteOutlined />,
      label: (
        <span data-cy={`org-settings-announcement-remove-space-${spaceId}`}>
          Remove
        </span>
      ),
      onClick: () => confirmRemoveSpace(spaceId, spaceName),
    },
  ];

  return (
    <div className="bg-white h-full pb-4" data-cy="announcement-settings-panel">
      {showIntro ? (
        <div className="mb-3 px-1" data-cy="announcement-settings-header">
          <Title level={4} className="!mb-1 !text-base">
            Announcement channels
          </Title>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            Integrate Collaboration spaces and channels for the Announcement
            page. Only added channels appear in the sidebar.
          </Paragraph>
        </div>
      ) : null}

      <AnnouncementIntegrationWizard
        open={integrationWizardOpen}
        focusSpaceId={integrationFocusSpaceId}
        onClose={closeIntegrationWizard}
      />

      {isEmpty ? (
        <Card
          className="mx-1 border border-dashed border-[#D9D9D9] shadow-none"
          data-cy="org-settings-announcement-empty"
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div
                data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-div-145"
                className="text-center"
              >
                <p
                  data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-p-146"
                  className="m-0 text-sm font-medium text-gray-700"
                >
                  No channels integrated yet
                </p>
                <p
                  data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-p-149"
                  className="mt-1 text-sm text-gray-400"
                >
                  Click + to select a Collaboration space, then choose channels.
                </p>
              </div>
            }
          />
        </Card>
      ) : (
        <Row
          gutter={[16, 0]}
          data-cy="org-settings-announcement-integrated-list"
        >
          {integratedSpaces.map((space) => {
            const isExpanded = !!expandedSpaces[space.id];
            return (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={space.id}>
                <Card
                  className="my-2 h-fit shadow-none"
                  bordered={false}
                  style={{ background: '#F9FAFB' }}
                  bodyStyle={{
                    padding: '12px 14px',
                    background: '#F9FAFB',
                  }}
                  data-cy={`org-settings-announcement-integrated-space-${space.id}`}
                >
                  <div
                    className="mb-1 flex items-center justify-between gap-2"
                    data-cy={`org-settings-announcement-space-row-${space.id}`}
                  >
                    <div
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                      onClick={() => toggleExpand(space.id)}
                      data-cy={`org-settings-announcement-space-header-${space.id}`}
                    >
                      <div
                        data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-div-184"
                        className="flex shrink-0 items-center justify-center self-center"
                      >
                        {isExpanded ? (
                          <IoIosArrowUp size={16} />
                        ) : (
                          <IoIosArrowDown size={16} />
                        )}
                      </div>
                      <span
                        data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-191"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: space.color }}
                        aria-hidden
                      />
                      <div
                        data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-div-196"
                        className="flex min-w-0 flex-col gap-0.5 py-0.5"
                      >
                        <div
                          data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-div-197"
                          className="flex flex-wrap items-center gap-2"
                        >
                          <h3
                            data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-h3-198"
                            className="m-0 cursor-pointer truncate text-base font-semibold text-gray-800"
                          >
                            {space.name}
                          </h3>
                          {space.isPrivate ? (
                            <LockOutlined className="text-xs text-gray-400" />
                          ) : null}
                        </div>
                        <div
                          data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-div-205"
                          className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500"
                        >
                          <span data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-206">
                            {space.subtitle}
                          </span>
                          <span data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-207">
                            {space.channels.length} channel
                            {space.channels.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Dropdown
                      menu={{ items: getSpaceMenuItems(space.id, space.name) }}
                      trigger={['click']}
                      data-cy={`org-settings-announcement-space-menu-${space.id}`}
                    >
                      <MoreOutlined
                        className="cursor-pointer text-lg text-gray-500 hover:text-gray-700"
                        onClick={(event: MouseEvent) => event.stopPropagation()}
                        data-cy={`org-settings-announcement-space-actions-${space.id}`}
                      />
                    </Dropdown>
                  </div>

                  {isExpanded ? (
                    <ul
                      className="m-0 mt-2 list-none space-y-1 border-t border-gray-100 p-0 pt-2"
                      data-cy={`org-settings-announcement-space-channels-${space.id}`}
                    >
                      {space.channels.map((channel) => (
                        <li
                          key={channel.id}
                          className="flex items-center justify-between gap-2 rounded-md px-1 py-1.5"
                          data-cy={`org-settings-announcement-integrated-channel-${channel.id}`}
                        >
                          <span
                            data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-239"
                            className="inline-flex min-w-0 items-center gap-2 text-sm text-gray-800"
                          >
                            <MdTag
                              className="shrink-0 text-gray-400"
                              size={14}
                            />
                            <span
                              data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-244"
                              className="truncate"
                            >
                              #{channel.name}
                            </span>
                            <span
                              data-cy="organization-announcement-components-announcementsettingspanel-tsx-announcementsettingspanel-span-245"
                              className="text-xs capitalize text-gray-400"
                            >
                              {channel.kind}
                            </span>
                          </span>
                          <Popconfirm
                            title="Remove this channel?"
                            onConfirm={() => removeEnabledChannel(channel.id)}
                            okText="Remove"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              size="small"
                              className="!text-gray-400 hover:!text-red-500"
                              icon={<DeleteOutlined />}
                              aria-label={`Remove #${channel.name}`}
                              data-cy={`org-settings-announcement-remove-channel-${channel.id}`}
                            />
                          </Popconfirm>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default AnnouncementSettingsPanel;
