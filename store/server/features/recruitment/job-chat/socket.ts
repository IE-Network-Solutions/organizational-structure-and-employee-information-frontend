import { resolveJobChatTenantId } from './auth';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { io, Socket } from 'socket.io-client';
import {
  JobChatUnreadCounts,
  JobMessage,
  SendJobMessagePayload,
} from './interface';

type JobChatServerEvents = {
  newMessage: (message: JobMessage) => void;
  jobChatMention: (message: JobMessage) => void;
  unreadCountUpdated: (counts: JobChatUnreadCounts) => void;
  messageRead: (payload: {
    jobId: string;
    userId: string;
    readAt: string;
  }) => void;
};

type JobChatClientEvents = {
  joinJob: (payload: { jobId: string }, ack?: (response: any) => void) => void;
  sendMessage: (
    payload: SendJobMessagePayload,
    ack?: (message: JobMessage) => void,
  ) => void;
  markRead: (
    payload: { jobId: string },
    ack?: (counts: JobChatUnreadCounts) => void,
  ) => void;
};

export type JobChatSocket = Socket<JobChatServerEvents, JobChatClientEvents>;

let socket: JobChatSocket | null = null;
let socketAuthKey = '';

const getSocketUrl = () => {
  if (!RECRUITMENT_URL) return '';
  return RECRUITMENT_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
};

export const getJobChatSocket = async (
  tenantIdOverride?: string,
): Promise<JobChatSocket | null> => {
  const token = await getCurrentToken();
  const authState = useAuthenticationStore.getState();
  const tenantId = resolveJobChatTenantId(tenantIdOverride);
  const userId = authState.userData?.id || authState.userId;
  const socketUrl = getSocketUrl();

  if (!token || !tenantId || !userId || !socketUrl) {
    return null;
  }

  const nextAuthKey = `${tenantId}:${userId}:${token}`;
  if (socket && socketAuthKey === nextAuthKey) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socketAuthKey = nextAuthKey;
  socket = io(socketUrl, {
    auth: {
      token: `Bearer ${token}`,
      tenantId,
      userId,
    },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
};

export const disconnectJobChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketAuthKey = '';
  }
};
