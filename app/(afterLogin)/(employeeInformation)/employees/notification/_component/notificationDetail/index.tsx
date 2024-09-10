import { NotificationType } from '@/store/server/features/notification/interface';
import { useGetNotifications } from '@/store/server/features/notification/queries';
import { useNotificationDetailStore } from '@/store/uistate/features/notification';
import { Modal } from 'antd';

interface NotificationDetailProps {
  id: string;
}

export const NotificationDetailVisible = ({ id }: NotificationDetailProps) => {
  const { isNotificationDetailVisible, setIsNotificationDetailVisible } =
    useNotificationDetailStore();
  const handleClose = () => {
    setIsNotificationDetailVisible(false);
  };
  const { data } = useGetNotifications();
  const newData = data?.filter((item: NotificationType) => item.id == id);

  return (
    <Modal
      title="Notification Details"
      centered
      open={isNotificationDetailVisible}
      onCancel={handleClose}
      footer={false}
      destroyOnClose
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Title: {newData?.[0]?.title}
      </h2>
      <p className="text-gray-600 mb-6 ">Body: {newData?.[0]?.body}</p>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded-lg border-[1px] border-black"
          onClick={() => handleClose()}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
