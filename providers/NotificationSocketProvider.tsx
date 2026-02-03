'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from 'react-query';
import { App, Button, Modal } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NOTIFICATION_WS_URL, NOTIFICATION_WS_PATH, VAPID_PUBLIC_KEY } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { usePushSubscription, requestAndRegisterPushSubscription } from '@/hooks/usePushSubscription';
import { useGetPushSubscriptionStatus } from '@/store/server/features/notification/queries';

const NOTIFICATION_CREATED = 'notification:created';
const NOTIFICATION_READ = 'notification:read';
const PUSH_PROMPT_STORAGE_KEY = 'showPushPromptAfterLogin';

export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const userId = useAuthenticationStore((s) => s.userId);
  const tenantId = useAuthenticationStore((s) => s.tenantId);
  const socketRef = useRef<Socket | null>(null);
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false);
  const [pushPromptLoading, setPushPromptLoading] = useState(false);

  usePushSubscription();

  const { data: subscriptionStatus, isLoading: statusLoading } = useGetPushSubscriptionStatus(
    userId ?? '',
    !!userId,
  );
  const isSubscribed =
    subscriptionStatus?.subscribed === true ||
    subscriptionStatus?.hasSubscription === true;

  const showPushPrompt =
    !!userId &&
    !!VAPID_PUBLIC_KEY &&
    !pushPromptDismissed &&
    !statusLoading &&
    !isSubscribed &&
    typeof window !== 'undefined' &&
    sessionStorage.getItem(PUSH_PROMPT_STORAGE_KEY) === '1';

  const handlePushPromptAllow = async () => {
    if (!userId) return;
    setPushPromptLoading(true);
    try {
      const ok = await requestAndRegisterPushSubscription(userId, tenantId ?? undefined);
      if (ok) {
        sessionStorage.removeItem(PUSH_PROMPT_STORAGE_KEY);
        setPushPromptDismissed(true);
        queryClient.invalidateQueries(['push-subscription-status', userId]);
        notification.success({ message: 'Notifications enabled. You’ll receive important updates.' });
      } else {
        notification.warning({ message: 'Please click “Allow” in your browser to enable notifications.' });
      }
    } catch {
      notification.error({ message: 'We couldn’t enable notifications. Please try again.' });
    } finally {
      setPushPromptLoading(false);
    }
  };

  const handlePushPromptDismiss = () => {
    sessionStorage.removeItem(PUSH_PROMPT_STORAGE_KEY);
    setPushPromptDismissed(true);
  };

  useEffect(() => {
    if (!userId || !NOTIFICATION_WS_URL) return;

    let mounted = true;

    const connect = async () => {
      const token = await getCurrentToken();
      if (!token || !mounted) return;

      const socket = io(NOTIFICATION_WS_URL, {
        path: NOTIFICATION_WS_PATH,
        auth: { userId, token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect_error', () => {
        // Connection failed; WS will retry or user can reload
      });

      socket.on(NOTIFICATION_CREATED, (payload?: { title?: string; body?: string }) => {
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
        notification.info({
          message: payload?.title ?? 'New notification',
          description: payload?.body ?? 'You have a new notification.',
          placement: 'topRight',
          duration: 4,
        });
      });

      socket.on(NOTIFICATION_READ, () => {
        queryClient.invalidateQueries(['notifications', userId]);
        queryClient.invalidateQueries(['notifications-unread-count', userId]);
      });
    };

    connect();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId, queryClient, notification]);

  return (
    <>
      {children}
      <Modal
        open={showPushPrompt}
        title="Enable notifications"
        onCancel={handlePushPromptDismiss}
        footer={[
          <Button key="later" onClick={handlePushPromptDismiss}>
            Maybe later
          </Button>,
          <Button
            key="allow"
            type="primary"
            icon={<BellOutlined />}
            loading={pushPromptLoading}
            onClick={handlePushPromptAllow}
          >
            Allow notifications
          </Button>,
        ]}
      >
        <p className="text-gray-600">
          Get notified about important updates and reminders even when you’re not in the app.
        </p>
      </Modal>
    </>
  );
}
