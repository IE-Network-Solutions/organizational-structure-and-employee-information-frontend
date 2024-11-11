'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { Avatar, Divider, List, Skeleton, Spin, Tooltip } from 'antd';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { EmptyImage } from '@/components/emptyIndicator';
import { NotificationType } from '@/store/server/features/notification/interface';
import { AiFillNotification } from 'react-icons/ai';
import { NotificationDetailVisible } from './_component/notificationDetail';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { CgCloseO } from 'react-icons/cg';

const Notifications = () => {
  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();

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
  const { data, isLoading } = useGetNotifications();
  const unReadNotification = data?.filter(
    (item: NotificationType) => item.status == 'ACTIVE',
  );
  const readNotification = data?.filter(
    (item: NotificationType) => item.status == 'INACTIVE',
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
  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb title="Notification" subtitle="" />
      </div>
      <Divider orientation="left" orientationMargin="20">
        <CustomBreadcrumb subtitle="" title="Latest Notifications" />
      </Divider>
      {isLoading ? (
        <Spin tip="Loading" size="large" />
      ) : unReadNotification?.length > 0 ? (
        <div className="w-full h-auto">
          <List
            className="demo-loadmore-list"
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={unReadNotification}
            renderItem={(item: NotificationType) => (
              <List.Item
                key={item?.id}
                actions={[
                  <Tooltip key={item?.id} title="Mark as read">
                    <CgCloseO
                      className="text-3xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNotification(item?.id);
                      }}
                    />
                  </Tooltip>,
                ]}
                onClick={() => {
                  handleShowNotificationDetails(item?.id);
                  updateNotification(item?.id);
                }}
                className="cursor-pointer"
              >
                <Skeleton avatar title={false} loading={isLoading} active>
                  <List.Item.Meta
                    avatar={<Avatar icon={<AiFillNotification />} />}
                    title={<div className="text-sm">{item?.title}</div>}
                    description={
                      <div>
                        <div>{formatDateDifference(item?.updatedAt)}</div>
                        <div>
                          {item?.body?.length > 20
                            ? `${item.body.slice(0, 20)}...`
                            : item?.body}
                        </div>
                      </div>
                    }
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <EmptyImage />
      )}
      <Divider orientation="left" orientationMargin="20">
        <CustomBreadcrumb subtitle="" title="Previous Notifications" />
      </Divider>
      {isLoading ? (
        <Spin tip="Loading" size="large" />
      ) : readNotification?.length > 0 ? (
        <div className="w-full h-auto">
          <List
            className="demo-loadmore-list"
            loading={isLoading}
            itemLayout="horizontal"
            dataSource={readNotification}
            renderItem={(item: NotificationType) => (
              <List.Item
                onClick={() => {
                  handleShowNotificationDetails(item?.id);
                }}
                className="cursor-pointer"
              >
                <Skeleton avatar title={false} loading={isLoading} active>
                  <List.Item.Meta
                    avatar={<Avatar icon={<AiFillNotification />} />}
                    title={<div className="text-sm">{item?.title}</div>}
                    description={
                      <div>
                        <div>{formatDateDifference(item?.updatedAt)}</div>
                        <div>
                          {item?.body?.length > 20
                            ? `${item.body.slice(0, 20)}...`
                            : item?.body}
                        </div>
                      </div>
                    }
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <EmptyImage />
      )}
      {selectedNotificationId && (
        <NotificationDetailVisible id={selectedNotificationId} />
      )}
    </div>
  );
};

export default Notifications;
