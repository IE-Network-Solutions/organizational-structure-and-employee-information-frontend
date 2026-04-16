'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { Avatar, Divider, List, Skeleton, Tooltip } from 'antd';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { NotificationType } from '@/store/server/features/notification/interface';
import { AiFillNotification } from 'react-icons/ai';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { CgCloseO } from 'react-icons/cg';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getNotificationThemeClasses } from '@/store/server/features/notification/themeUtils';
import { useCanAccessRoute } from '@/utils/routePermissions';

function getNotificationRoute(n: NotificationType): string | null {
  const r = n?.route?.trim();
  return r || null;
}
import EmptyState from '@/components/empty';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function getNotificationPath(item: NotificationType): string | null {
  const route = getNotificationRoute(item);
  return route ? (route.startsWith('/') ? route : `/${route}`) : null;
}

const Notifications = () => {
  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const userId = useAuthenticationStore.getState().userId;
  const router = useRouter();
  const canAccessRoute = useCanAccessRoute();

  const updateNotification = (id: string) => {
    updateNotificationStatus(id);
  };

  const handleNotificationClick = (item: NotificationType) => {
    const path = getNotificationPath(item);
    if (path && !canAccessRoute(path)) return;
    if (!item.isRead) updateNotification(item.id);
    if (path) router.push(path);
  };

  const { data, isLoading } = useGetNotifications(userId, {
    page: 1,
    limit: 100,
  });
  const list = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const unReadNotification = list.filter(
    (item: NotificationType) => item.isRead !== true,
  );
  const readNotification = list.filter(
    (item: NotificationType) => item.isRead === true,
  );

  const formatDateDifference = (updatedAt: string) => {
    const currentDate = new Date();
    const updatedDate = new Date(updatedAt);

    const diffInMs = currentDate.getTime() - updatedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hours ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minutes ago`;
    } else {
      return 'Just now';
    }
  };
  const pageSlug = toSlug(userId ?? 'notification-page');
  const getNotificationSlug = (id?: string | null) =>
    toSlug(id ?? 'notification');

  return (
    <div
      className="h-auto w-full p-4"
      id={`notification-page-${pageSlug}`}
      data-cy={`notification-page-${pageSlug}`}
    >
      <div
        className="flex flex-wrap justify-between items-center"
        id={`notification-header-${pageSlug}`}
        data-cy={`notification-header-${pageSlug}`}
      >
        <CustomBreadcrumb
          title="Notification"
          subtitle=""
          data-cy={`notification-breadcrumb-${pageSlug}`}
        />
      </div>
      <div id={`notification-latest-divider-${pageSlug}`} data-cy={`notification-latest-divider-${pageSlug}`}>
      <Divider orientation="left" orientationMargin="20">
        <CustomBreadcrumb
          subtitle=""
          title="Latest Notifications"
          data-cy={`notification-latest-breadcrumb-${pageSlug}`}
        />
      </Divider>
      </div>
      {isLoading ? (
        <Skeleton active data-cy={`notification-latest-spinner-${pageSlug}`} />
      ) : unReadNotification?.length > 0 ? (
        <div
          className="w-full h-auto"
          id={`notification-unread-wrapper-${pageSlug}`}
          data-cy={`notification-unread-wrapper-${pageSlug}`}
        >
          <List
            className="demo-loadmore-list"
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={unReadNotification}
            id={`notification-unread-list-${pageSlug}`}
            data-cy={`notification-unread-list-${pageSlug}`}
            renderItem={(item: NotificationType) => {
              const itemSlug = getNotificationSlug(item?.id);
              const theme = getNotificationThemeClasses(item);
              const path = getNotificationPath(item);
              const hasAccess = !path || canAccessRoute(path);
              return (
                <List.Item
                  key={item?.id}
                  className={`border-l-4 ${theme.border} ${hasAccess ? `cursor-pointer ${theme.hover}` : 'cursor-not-allowed opacity-80'}`}
                  title={hasAccess ? undefined : "You don't have permission to view this page"}
                  actions={[
                    <Tooltip
                      key={item?.id}
                      title="Mark as read"
                      id={`notification-unread-tooltip-${itemSlug}`}
                      data-cy={`notification-unread-tooltip-${itemSlug}`}
                    >
                      <CgCloseO
                        className="text-3xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateNotification(item?.id);
                        }}
                        id={`notification-unread-close-icon-${itemSlug}`}
                        data-cy={`notification-unread-close-icon-${itemSlug}`}
                      />
                    </Tooltip>,
                  ]}
                  onClick={() => handleNotificationClick(item)}
                  id={`notification-unread-item-${itemSlug}`}
                  data-cy={`notification-unread-item-${itemSlug}`}
                >
                  <Skeleton
                    avatar
                    title={false}
                    loading={isLoading}
                    active
                    data-cy={`notification-unread-skeleton-${itemSlug}`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          className={theme.bg}
                          icon={<AiFillNotification className={theme.icon} />}
                          data-cy={`notification-unread-avatar-${itemSlug}`}
                        />
                      }
                      title={
                        <div
                          className="text-sm"
                          id={`notification-unread-title-${itemSlug}`}
                          data-cy={`notification-unread-title-${itemSlug}`}
                        >
                          {item?.title}
                        </div>
                      }
                      description={
                        <div
                          id={`notification-unread-description-${itemSlug}`}
                          data-cy={`notification-unread-description-${itemSlug}`}
                        >
                          <div
                            id={`notification-unread-date-${itemSlug}`}
                            data-cy={`notification-unread-date-${itemSlug}`}
                          >
                            {formatDateDifference(item?.updatedAt)}
                          </div>
                          <div
                            id={`notification-unread-body-${itemSlug}`}
                            data-cy={`notification-unread-body-${itemSlug}`}
                          >
                            {item?.body?.length > 20
                              ? `${item.body.slice(0, 20)}...`
                              : item?.body}
                          </div>
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              );
            }}
          />
        </div>
      ) : (
        <EmptyState data-cy={`notification-unread-empty-${pageSlug}`} />
      )}
      <div id={`notification-previous-divider-${pageSlug}`} data-cy={`notification-previous-divider-${pageSlug}`}>
      <Divider orientation="left" orientationMargin="20">
        <CustomBreadcrumb
          subtitle=""
          title="Previous Notifications"
          data-cy={`notification-previous-breadcrumb-${pageSlug}`}
        />
      </Divider>
      </div>
      {isLoading ? (
        <Skeleton
          active
          data-cy={`notification-previous-spinner-${pageSlug}`}
        />
      ) : readNotification?.length > 0 ? (
        <div
          className="w-full h-auto"
          id={`notification-read-wrapper-${pageSlug}`}
          data-cy={`notification-read-wrapper-${pageSlug}`}
        >
          <List
            className="demo-loadmore-list"
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={readNotification}
            id={`notification-read-list-${pageSlug}`}
            data-cy={`notification-read-list-${pageSlug}`}
            renderItem={(item: NotificationType) => {
              const itemSlug = getNotificationSlug(item?.id);
              const theme = getNotificationThemeClasses(item);
              const path = getNotificationPath(item);
              const hasAccess = !path || canAccessRoute(path);
              return (
                <List.Item
                  onClick={() => handleNotificationClick(item)}
                  className={`border-l-4 ${theme.border} ${hasAccess ? `cursor-pointer ${theme.hover}` : 'cursor-not-allowed opacity-80'}`}
                  title={hasAccess ? undefined : "You don't have permission to view this page"}
                  id={`notification-read-item-${itemSlug}`}
                  data-cy={`notification-read-item-${itemSlug}`}
                >
                  <Skeleton
                    avatar
                    title={false}
                    loading={isLoading}
                    active
                    data-cy={`notification-read-skeleton-${itemSlug}`}
                  >
                    <List.Item.Meta
                      data-cy={`notification-read-list-item-${itemSlug}`}
                      avatar={
                        <Avatar
                          className={theme.bg}
                          icon={<AiFillNotification className={theme.icon} />}
                          data-cy={`notification-read-avatar-${itemSlug}`}
                        />
                      }
                      title={
                        <div
                          className="text-sm"
                          id={`notification-read-title-${itemSlug}`}
                          data-cy={`notification-read-title-${itemSlug}`}
                        >
                          {item?.title}
                        </div>
                      }
                      description={
                        <div
                          id={`notification-read-description-${itemSlug}`}
                          data-cy={`notification-read-description-${itemSlug}`}
                        >
                          <div
                            id={`notification-read-date-${itemSlug}`}
                            data-cy={`notification-read-date-${itemSlug}`}
                          >
                            {formatDateDifference(item?.updatedAt)}
                          </div>
                          <div
                            id={`notification-read-body-${itemSlug}`}
                            data-cy={`notification-read-body-${itemSlug}`}
                          >
                            {item?.body?.length > 20
                              ? `${item.body.slice(0, 20)}...`
                              : item?.body}
                          </div>
                        </div>
                      }
                    />
                  </Skeleton>
                </List.Item>
              );
            }}
          />
        </div>
      ) : (
        <EmptyState data-cy={`notification-read-empty-${pageSlug}`} />
      )}
    </div>
  );
};

export default Notifications;
