'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { Avatar, Divider, List, Skeleton, Tooltip } from 'antd';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { EmptyImage } from '@/components/emptyIndicator';
import { NotificationType } from '@/store/server/features/notification/interface';
import { AiFillNotification } from 'react-icons/ai';
import { NotificationDetailVisible } from './_component/notificationDetail';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { CgCloseO } from 'react-icons/cg';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const Notifications = () => {
  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const userId = useAuthenticationStore.getState().userId;

  const {
    selectedNotificationId,
    setIsNotificationDetailVisible,
    setSelectedNotificationId,
  } = useNotificationDetailStore();

  const handleShowNotificationDetails = (id: string) => {
    setSelectedNotificationId(id);
    setIsNotificationDetailVisible(true);
  };
  const updateNotification = (id: string) => {
    updateNotificationStatus(id);
  };
  const { data, isLoading } = useGetNotifications(userId);
  const list = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const unReadNotification = list.filter(
    (item: NotificationType) => item.isRead === false,
  );
  const readNotification = list.filter(
    (item: NotificationType) => item.isRead !== false,
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
      <Divider
        orientation="left"
        orientationMargin="20"
        data-cy={`notification-latest-divider-${pageSlug}`}
      >
        <CustomBreadcrumb
          subtitle=""
          title="Latest Notifications"
          data-cy={`notification-latest-breadcrumb-${pageSlug}`}
        />
      </Divider>
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
              return (
                <List.Item
                  key={item?.id}
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
                  onClick={() => {
                    handleShowNotificationDetails(item?.id);
                    updateNotification(item?.id);
                  }}
                  className="cursor-pointer"
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
                          icon={<AiFillNotification />}
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
        <EmptyImage data-cy={`notification-unread-empty-${pageSlug}`} />
      )}
      <Divider
        orientation="left"
        orientationMargin="20"
        data-cy={`notification-previous-divider-${pageSlug}`}
      >
        <CustomBreadcrumb
          subtitle=""
          title="Previous Notifications"
          data-cy={`notification-previous-breadcrumb-${pageSlug}`}
        />
      </Divider>
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
              return (
                <List.Item
                  onClick={() => {
                    handleShowNotificationDetails(item?.id);
                  }}
                  className="cursor-pointer"
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
                          icon={<AiFillNotification />}
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
        <EmptyImage data-cy={`notification-read-empty-${pageSlug}`} />
      )}
      {selectedNotificationId && (
        <NotificationDetailVisible
          id={selectedNotificationId}
          data-cy={`notification-detail-modal-${pageSlug}`}
        />
      )}
    </div>
  );
};

export default Notifications;
