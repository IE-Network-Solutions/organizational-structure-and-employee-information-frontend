'use client';

import { Modal } from 'antd';
import { NotificationType } from '@/store/server/features/notification/interface';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface NotificationDetailProps {
  id: string;
}

export const NotificationDetailVisible = ({
  id,
}: NotificationDetailProps) => {
  const userId = useAuthenticationStore.getState().userId;
  const { data } = useGetNotifications(userId ?? '');
  const { isNotificationDetailVisible, setIsNotificationDetailVisible } =
    useNotificationDetailStore();

  const list = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const notification = list.find((item: NotificationType) => item.id === id);
  const detailSlug = toSlug(notification?.id ?? id);

  const handleClose = () => {
    setIsNotificationDetailVisible(false);
  };

  return (
    <Modal
      title="Notification Details"
      centered
      open={isNotificationDetailVisible}
      onCancel={handleClose}
      footer={false}
      destroyOnClose
      data-cy={`notification-detail-modal-${detailSlug}`}
    >
      <h2
        className="mb-4 text-xl font-bold text-gray-800"
        id={`notification-detail-title-${detailSlug}`}
        data-cy={`notification-detail-title-${detailSlug}`}
      >
        {notification?.title ?? 'Notification'}
      </h2>
      <p
        className="mb-6 text-gray-600"
        id={`notification-detail-body-${detailSlug}`}
        data-cy={`notification-detail-body-${detailSlug}`}
      >
        {notification?.body ?? 'No details available.'}
      </p>
      <div
        className="flex justify-end"
        id={`notification-detail-action-${detailSlug}`}
        data-cy={`notification-detail-action-${detailSlug}`}
      >
        <button
          type="button"
          className="rounded-lg border border-black px-4 py-2"
          onClick={handleClose}
          id={`notification-detail-close-btn-${detailSlug}`}
          data-cy={`notification-detail-close-btn-${detailSlug}`}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
