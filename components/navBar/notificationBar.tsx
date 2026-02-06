import { Avatar, Menu, Dropdown, Badge, Spin, Tooltip } from 'antd';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { NotificationType } from '@/store/server/features/notification/interface';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { AiFillNotification } from 'react-icons/ai';
import { CgCloseO } from 'react-icons/cg';
import Link from 'next/link';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NotificationDetailVisible } from '@/app/(afterLogin)/(employeeInformation)/employees/notification/_component/notificationDetail';

function NotificationBar() {
  const userId = useAuthenticationStore.getState().userId;

  const {
    setIsNotificationDetailVisible,
    selectedNotificationId,
    setSelectedNotificationId,
  } = useNotificationDetailStore();

  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const { data, isLoading } = useGetNotifications(userId ?? '');

  const list = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const unReadNotification = list.filter(
    (item: NotificationType) => item.isRead === false,
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
      <p
        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-p-58"
        className="m-2 border-b border-black"
      >
        Notifications
      </p>

      {isLoading ? (
        <Spin tip="Loading" size="small" />
      ) : unReadNotification?.length > 0 ? (
        <>
          {unReadNotification
            ?.slice(0, 6)
            ?.map((notification: NotificationType) => (
              <div
                data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-67"
                className="flex justify-between gap-4"
                key={notification.id}
              >
                <Menu.Item>
                  <div
                    data-cy={`components-navbar-notificationbar-tsx-notificationbar-div-78-${notification.id}`}
                    className="flex items-center p-2 cursor-pointer"
                    onClick={() => {
                      handleShowNotificationDetails(notification?.id);
                    }}
                  >
                    <Avatar icon={<AiFillNotification />} />
                    <div
                      data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-76"
                      className="ml-2"
                    >
                      <div
                        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-77"
                        className="font-semibold"
                      >
                        {notification?.title}
                      </div>
                      <div
                        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-78"
                        className="text-xs text-gray-500"
                      >
                        {formatDateDifference(notification?.updatedAt)}
                      </div>
                      <div
                        data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-81"
                        className="text-xs text-gray-400"
                      >
                        {notification?.body?.slice(0, 15)}
                        {notification?.body?.length > 15 && '...'}
                      </div>
                    </div>
                  </div>
                </Menu.Item>
                <div
                  data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-88"
                  className="flex items-center"
                >
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
              <div
                data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-104"
                className="text-blue-500"
              >
                View More
              </div>
            </Link>
          </Menu.Item>
        </>
      ) : (
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-navbar-notificationbar-tsx-notificationbar-div-109"
          className="mx-10 my-5 text-center text-gray-500"
        >
          No notifications available
        </div>
      )}
    </Menu>
  );
  return (
    <>
      <Dropdown
        className="border-[#ececee] border-[1px] rounded-md"
        dropdownRender={() => notificationMenu}
        trigger={['click']}
      >
        <Badge
          count={
            unReadNotification?.length > 0 ? unReadNotification?.length : 0
          }
          className="bg-gray-300 p-2 rounded-lg"
        >
          <IoIosNotificationsOutline size={20} />
        </Badge>
      </Dropdown>
      {selectedNotificationId && (
        <NotificationDetailVisible id={selectedNotificationId} />
      )}
    </>
  );
}

export default NotificationBar;
