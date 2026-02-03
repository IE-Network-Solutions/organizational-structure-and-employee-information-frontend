import { NotificationType } from '@/store/server/features/notification/interface';
import { useUpdateNotificationStatus } from '@/store/server/features/notification/mutation';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { Modal } from 'antd';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface NotificationDetailProps {
  id: string;
}

export const NotificationDetailVisible = ({ id }: NotificationDetailProps) => {
  const { mutate: updateNotificationStatus } = useUpdateNotificationStatus();
  const userId = useAuthenticationStore.getState().userId;

  const { data } = useGetNotifications(userId ?? '');
  const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const newData = list.filter((item: NotificationType) => item.id === id);
  const { isNotificationDetailVisible, setIsNotificationDetailVisible } =
    useNotificationDetailStore();
  const handleClose = () => {
    setIsNotificationDetailVisible(false);
    updateNotificationStatus(newData?.[0]?.id);
  };
  const detailSlug = toSlug(newData?.[0]?.id ?? id);
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
        className="text-xl font-bold text-gray-800 mb-4"
        id={`notification-detail-title-${detailSlug}`}
        data-cy={`notification-detail-title-${detailSlug}`}
      >
        Title: {newData?.[0]?.title}
      </h2>
      <p
        className="text-gray-600 mb-6 "
        id={`notification-detail-body-${detailSlug}`}
        data-cy={`notification-detail-body-${detailSlug}`}
      >
        Body: {newData?.[0]?.body}
      </p>
      <div
        className="flex justify-end"
        id={`notification-detail-action-${detailSlug}`}
        data-cy={`notification-detail-action-${detailSlug}`}
      >
        <button
          className="px-4 py-2 rounded-lg border-[1px] border-black"
          onClick={() => handleClose()}
          id={`notification-detail-close-btn-${detailSlug}`}
          data-cy={`notification-detail-close-btn-${detailSlug}`}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
