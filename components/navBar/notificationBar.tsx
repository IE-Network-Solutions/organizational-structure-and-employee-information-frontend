import React from 'react';
import { Avatar, Menu, Dropdown, Layout, Badge, Spin, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { NotificationType } from '@/store/server/features/notification/interface';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { AiFillNotification } from 'react-icons/ai';
import { CgCloseO } from 'react-icons/cg';
import Link from 'next/link';

function NotificationBar() {
  const { setIsNotificationDetailVisible, setSelectedNotificationId } =
    useNotificationDetailStore();
  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const { data, isLoading } = useGetNotifications();
  const unReadNotification = data?.filter(
    (item: NotificationType) => item.status == 'ACTIVE',
  );

  const updateNotification = (id: string) => {
    updateNotificationStatus(id);
  };
  const handleShowNotificationDetails = (id: string) => {
    setSelectedNotificationId(id);
    setIsNotificationDetailVisible(true);
  };
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
  const notificationMenu = (
    <Menu className="font-lexend max-w-[400px] max-h-96 overflow-y-auto">
      <p className="m-2 border-b border-black">Notifications</p>

      {isLoading ? (
        <Spin tip="Loading" size="small" />
      ) : unReadNotification?.length > 0 ? (
        <>
          {unReadNotification
            ?.slice(0, 6)
            ?.map((notification: NotificationType) => (
              <div className="flex justify-between gap-4" key={notification.id}>
                <Menu.Item>
                  <div
                    className="flex items-center p-2 cursor-pointer"
                    onClick={() => {
                      handleShowNotificationDetails(notification?.id);
                      updateNotification(notification?.id);
                    }}
                  >
                    <Avatar icon={<AiFillNotification />} />
                    <div className="ml-2">
                      <div className="font-semibold">{notification?.title}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateDifference(notification?.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {notification?.body?.slice(0, 15)}
                        {notification?.body?.length > 15 && '...'}
                      </div>
                    </div>
                  </div>
                </Menu.Item>
                <div className="flex items-center">
                  <Tooltip title="Mark as read">
                    <CgCloseO
                      className="text-sm "
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNotification(notification?.id);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}

          <Menu.Item key="view-more" className="text-center">
            <Link href="/employees/notification">
              <div className="text-blue-500">View More</div>
            </Link>
          </Menu.Item>
        </>
      ) : (
        <div className="mx-10 my-5 text-center text-gray-500">
          No notifications available
        </div>
      )}
    </Menu>
  );
  return (
    <Dropdown
      className="border-[#ececee] border-[1px] rounded-md"
      overlay={notificationMenu}
      trigger={['click']}
    >
      <Badge
        count={unReadNotification?.length > 0 ? unReadNotification?.length : 0}
        className="bg-gray-300 p-2 rounded-lg"
      >
        <IoIosNotificationsOutline size={20} />
      </Badge>
    </Dropdown>
  );
}

export default NotificationBar;
