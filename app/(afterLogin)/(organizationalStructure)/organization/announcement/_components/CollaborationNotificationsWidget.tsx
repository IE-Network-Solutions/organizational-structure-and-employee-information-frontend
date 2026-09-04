'use client';

import { useMemo, useState } from 'react';
import { Avatar, Button, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MdOutlineCampaign } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { collaborationColors } from './collaborationColors';
import AnnouncementComposerPanel from './AnnouncementComposerPanel';
import {
  mapCollabNotification,
  useCollaborationNotifications,
} from '@/store/server/features/collaboration';

dayjs.extend(relativeTime);

type WidgetView = 'mentions' | 'compose';

type CollabNotification = ReturnType<typeof mapCollabNotification>;

const kindLabel = (kind: CollabNotification['kind']): string => {
  if (kind === 'mention') return 'mentioned you';
  if (kind === 'reply') return 'replied';
  return 'posted an announcement';
};

const actorInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const CollaborationNotificationsWidget = ({
  expanded = false,
}: {
  expanded?: boolean;
}) => {
  const [view, setView] = useState<WidgetView>('mentions');
  const [composeWide, setComposeWide] = useState(false);
  const { data: rawNotifications = [], isLoading } =
    useCollaborationNotifications();
  const notifications = useMemo(
    () => rawNotifications.map(mapCollabNotification),
    [rawNotifications],
  );
  const unreadCount = notifications.filter((item) => item.unread).length;
  const isCompose = view === 'compose';
  /** Typing expands over Approvals; card may grow down over calendar. */
  const isOverlay = composeWide && isCompose;

  const leaveCompose = () => {
    setComposeWide(false);
    setView('mentions');
  };

  const cardHeightClass = expanded ? 'h-full min-h-[520px]' : 'h-[343px]';

  return (
    <div
      className={`relative w-full ${cardHeightClass}`}
      data-cy="collaboration-notifications-shell"
    >
      <div
        className={`flex flex-col overflow-hidden rounded-lg border border-[#D9D9D9] bg-white p-3 shadow-none transition-[width] duration-200 ease-out max-md:!static max-md:!w-full ${
          isOverlay
            ? 'absolute right-0 top-0 z-30 min-h-full h-auto w-[calc(200%+1rem)] shadow-md max-md:!relative max-md:!h-auto max-md:!w-full max-md:!shadow-none'
            : `relative w-full ${cardHeightClass}`
        }`}
        data-cy="collaboration-notifications-widget"
        data-compose-wide={isOverlay ? 'true' : 'false'}
      >
        <div
          className="mb-3 flex shrink-0 items-center justify-between gap-2"
          data-cy="collaboration-notifications-header"
        >
          <div
            data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-div-72"
            className="flex min-w-0 items-center gap-2"
          >
            <span
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: collaborationColors.surface,
                color: collaborationColors.primary,
              }}
              data-cy="collaboration-notifications-icon"
            >
              <MdOutlineCampaign size={14} />
            </span>
            <span
              className="truncate text-[16px] font-bold text-gray-900"
              data-cy="collaboration-notifications-title"
            >
              {isCompose ? 'Post announcement' : 'Mentions'}
            </span>
            {!isCompose && unreadCount > 0 ? (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: collaborationColors.accent,
                  color: collaborationColors.primary,
                }}
                data-cy="collaboration-notifications-unread-count"
              >
                {unreadCount}
              </span>
            ) : null}
          </div>
          {isCompose ? (
            <Button
              type="text"
              size="small"
              className="!h-7 shrink-0 !px-2 !text-sm !font-medium"
              style={{ color: collaborationColors.primary }}
              onClick={leaveCompose}
              data-cy="announcement-compose-back"
            >
              Back
            </Button>
          ) : (
            <Button
              type="text"
              size="small"
              className="!h-7 shrink-0 !px-2 !text-sm !font-medium"
              style={{ color: collaborationColors.primary }}
              onClick={() => setView('compose')}
              data-cy="announcement-compose-trigger"
            >
              Announce
            </Button>
          )}
        </div>

        <div
          className={
            isOverlay
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
              : 'min-h-0 flex-1 overflow-hidden'
          }
          data-cy="collaboration-notifications-slider"
        >
          <div
            className={`flex min-h-0 w-[200%] transition-transform duration-500 ease-in-out ${
              isOverlay ? 'min-h-full flex-1' : 'h-full'
            }`}
            style={{
              transform: isCompose ? 'translateX(-50%)' : 'translateX(0)',
            }}
            data-cy="collaboration-notifications-track"
          >
            <div
              className={`flex min-h-0 w-1/2 min-w-[50%] flex-col overflow-hidden ${
                isOverlay ? 'min-h-full' : 'h-full'
              }`}
              data-cy="collaboration-notifications-mentions-panel"
              aria-hidden={isCompose}
            >
              <div
                className="min-h-0 flex-1 overflow-y-auto scrollbar-none"
                data-cy="collaboration-notifications-body"
              >
                {isLoading ? (
                  <div className="flex h-full min-h-[190px] items-center justify-center">
                    <Spin size="small" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p
                    className="m-0 flex h-full min-h-[190px] items-center justify-center text-lg font-light text-gray-500"
                    data-cy="collaboration-notifications-empty"
                  >
                    No mentions yet
                  </p>
                ) : (
                  <ul
                    data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-ul-163"
                    className="m-0 list-none space-y-1 p-0"
                  >
                    {notifications.map((item) => (
                      <li
                        data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-li-165"
                        key={item.id}
                      >
                        <button
                          type="button"
                          className="flex w-full items-start gap-2.5 rounded-lg border-0 px-2 py-2 text-left transition"
                          style={{
                            background: item.unread
                              ? collaborationColors.surface
                              : 'transparent',
                          }}
                          data-cy={`collaboration-notification-row-${item.id}`}
                        >
                          <Avatar
                            size={32}
                            src={item.actorAvatarUrl || undefined}
                            icon={
                              !item.actorAvatarUrl ? (
                                <UserOutlined />
                              ) : undefined
                            }
                            style={{
                              backgroundColor: item.actorAvatarUrl
                                ? undefined
                                : collaborationColors.primary,
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {!item.actorAvatarUrl
                              ? actorInitials(item.actorName)
                              : null}
                          </Avatar>
                          <div
                            data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-div-197"
                            className="min-w-0 flex-1"
                          >
                            <p
                              data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-p-198"
                              className="m-0 text-sm leading-snug text-gray-900"
                            >
                              <span
                                data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-span-199"
                                className="font-semibold"
                                style={{
                                  color: collaborationColors.primary,
                                }}
                              >
                                @{item.actorName.replace(/\s+/g, '')}
                              </span>{' '}
                              {kindLabel(item.kind)} in{' '}
                              <span
                                data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-span-208"
                                className="font-medium"
                              >
                                {item.spaceName}
                              </span>
                            </p>
                            <p
                              data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-p-212"
                              className="m-0 mt-0.5 truncate text-xs text-gray-500"
                            >
                              {item.preview}
                            </p>
                            <p
                              data-cy="organization-announcement-components-collaborationnotificationswidget-tsx-collaborationnotificationswidget-p-215"
                              className="m-0 mt-1 text-[11px] text-gray-400"
                            >
                              {dayjs(item.createdAt).fromNow()}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              className={`flex min-h-0 w-1/2 min-w-[50%] flex-col overflow-hidden pl-1 ${
                isOverlay ? 'h-auto min-h-full' : 'h-full'
              }`}
              data-cy="collaboration-notifications-compose-panel"
            >
              {isCompose ? (
                <AnnouncementComposerPanel
                  active
                  growWithContent={isOverlay}
                  onCancel={leaveCompose}
                  onSuccess={leaveCompose}
                  onBodyActivity={setComposeWide}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationNotificationsWidget;
