import { Avatar, Menu, Dropdown, Badge, Spin, Tooltip } from 'antd';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { NotificationType } from '@/store/server/features/notification/interface';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { AiFillNotification } from 'react-icons/ai';
import { CgCloseO } from 'react-icons/cg';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getNotificationThemeClasses } from '@/store/server/features/notification/themeUtils';
import { useCanAccessRoute } from '@/utils/routePermissions';

const toSlug = (v: string | number | null | undefined) =>
  String(v ?? 'na').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function getNotificationRoute(n: NotificationType): string | null {
  const r = n?.route?.trim();
  return r || null;
}

function NotificationBar() {
  const userId = useAuthenticationStore.getState().userId;
  const router = useRouter();
  const canAccessRoute = useCanAccessRoute();

  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const { data, isLoading } = useGetNotifications(userId ?? '');

  const list = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const unReadNotification = list.filter(
    (item: NotificationType) => item.isRead !== true,
  );

  const updateNotification = (id: string) => {
    updateNotificationStatus(id);
  };

  const handleNotificationClick = (notification: NotificationType) => {
    const route = getNotificationRoute(notification);
    const path = route ? (route.startsWith('/') ? route : `/${route}`) : null;
    if (path && !canAccessRoute(path)) return;
    updateNotification(notification.id);
    if (path) router.push(path);
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
    <Menu className="font-lexend max-w-[400px] max-h-96 overflow-y-auto" id="notification-bar-menu" data-cy="notification-bar-menu">
      <p className="m-2 border-b border-black" id="notification-bar-title" data-cy="notification-bar-title">Notifications</p>

      {isLoading ? (
        <Spin tip="Loading" size="small" />
      ) : unReadNotification?.length > 0 ? (
        <>
          {unReadNotification
            ?.slice(0, 6)
            ?.map((notification: NotificationType) => {
              const theme = getNotificationThemeClasses(notification);
              const slug = toSlug(notification.id);
              const route = getNotificationRoute(notification);
              const path = route ? (route.startsWith('/') ? route : `/${route}`) : null;
              const hasAccess = !path || canAccessRoute(path);
              return (
              <div
                key={notification.id}
                id={`notification-bar-item-${slug}`}
                data-cy={`notification-bar-item-${slug}`}
                className={`flex justify-between gap-4 border-l-4 ${theme.border} ${hasAccess ? theme.hover : ''}`}
              >
                <Menu.Item>
                  <div
                    data-cy={`components-navbar-notificationbar-tsx-notificationbar-div-78-${notification.id}`}
                    className={`flex items-center p-2 ${hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                    title={hasAccess ? undefined : "You don't have permission to view this page"}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Avatar
                      className={theme.bg}
                      icon={<AiFillNotification className={theme.icon} />}
                    />
                    <div className="ml-2" data-cy={`notification-bar-content-${slug}`}>
                      <div className="font-semibold" data-cy={`notification-bar-title-${slug}`}>{notification?.title}</div>
                      <div className="text-xs text-gray-500" data-cy={`notification-bar-date-${slug}`}>
                        {formatDateDifference(notification?.updatedAt)}
                      </div>
                      <div
                        className="text-xs text-gray-400"
                        data-cy={`notification-bar-body-${slug}`}
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
                      className="text-sm"
                      data-cy={`notification-bar-mark-read-${slug}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNotification(notification.id);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            );
            })}

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
    <div id="notification-bar-dropdown" data-cy="notification-bar-dropdown">
      <Dropdown
        className="border-[#ececee] border-[1px] rounded-md"
        dropdownRender={() => notificationMenu}
        trigger={['click']}
      >
        <Badge
          id="notification-bar-badge"
          data-cy="notification-bar-badge"
          count={
            unReadNotification?.length > 0 ? unReadNotification?.length : 0
          }
          className="bg-gray-300 p-2 rounded-lg"
        >
          <IoIosNotificationsOutline size={20} />
        </Badge>
      </Dropdown>
    </div>
  );
}

export default NotificationBar;