'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from 'react-query';
import { App } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { NOTIFICATION_WS_URL, NOTIFICATION_WS_PATH } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { usePushSubscription } from '@/hooks/usePushSubscription';

const NOTIFICATION_CREATED = 'notification:created';
const NOTIFICATION_READ = 'notification:read';

export function NotificationSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const userId = useAuthenticationStore((s) => s.userId);
  const socketRef = useRef<Socket | null>(null);

  usePushSubscription();

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

      socket.on('connect_error', (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Notification WS]', err.message);
        }
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

  return <>{children}</>;
}
