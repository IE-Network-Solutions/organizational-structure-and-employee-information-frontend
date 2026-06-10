'use client';

import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import {
  JobMessage,
  SendJobMessageFilePayload,
} from '@/store/server/features/recruitment/job-chat/interface';
import {
  getJobChatMessagesQueryKey,
  upsertJobChatCache,
} from '@/store/server/features/recruitment/job-chat/cache';
import { useSendJobChatMessage } from '@/store/server/features/recruitment/job-chat/mutation';
import { normalizeJobChatMessagesResponse } from '@/store/server/features/recruitment/job-chat/normalize';
import {
  getJobChatMessages,
  useGetJobChatMessages,
} from '@/store/server/features/recruitment/job-chat/queries';
import {
  getJobChatSocket,
  JobChatSocket,
} from '@/store/server/features/recruitment/job-chat/socket';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fileUpload } from '@/utils/fileUpload';
import { Avatar, Dropdown, Empty, Input, Spin } from 'antd';
import type { MenuProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  Check,
  FileText,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Send,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useQueryClient } from 'react-query';

interface JobChatProps {
  jobId: string;
  jobTitle?: string;
  isActive?: boolean;
  jobTenantId?: string;
}

dayjs.extend(utc);
dayjs.extend(timezone);

const CHAT_TIMEZONE = 'Africa/Nairobi';

const toChatDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = dayjs.utc(value);
  return parsed.isValid() ? parsed.tz(CHAT_TIMEZONE) : null;
};

const formatChatTime = (value?: string | null) =>
  toChatDate(value)?.format('h:mmA') ?? '';

const formatChatDateTime = (value?: string | null) =>
  toChatDate(value)?.format('DD MMM YYYY, h:mm A') ?? '';

const normalizeUsers = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
};

const getUserName = (user: any) => {
  const employeeInfo = user?.employeeInformation;
  const fullName =
    user?.fullName ||
    employeeInfo?.fullName ||
    [
      user?.firstName || employeeInfo?.firstName,
      user?.lastName || employeeInfo?.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    user?.email;

  return fullName || 'Unknown user';
};

const getUserAvatarText = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 1)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const PARTICIPANT_AVATAR_COLORS = [
  '#F97316',
  '#1E40AF',
  '#059669',
  '#7C3AED',
  '#DB2777',
];

const getParticipantAvatarColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PARTICIPANT_AVATAR_COLORS[
    Math.abs(hash) % PARTICIPANT_AVATAR_COLORS.length
  ];
};

const normalizeMentionAlias = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();

const compactMentionAlias = (value?: string | null) =>
  normalizeMentionAlias(value).replace(/\s+/g, '');

const getUserAliases = (user: any) => {
  const employeeInfo = user?.employeeInformation;
  const firstName = user?.firstName || employeeInfo?.firstName;
  const lastName = user?.lastName || employeeInfo?.lastName;
  const fullName = getUserName(user);
  const emailPrefix =
    typeof user?.email === 'string' ? user.email.split('@')[0] : '';

  return Array.from(
    new Set(
      [
        fullName,
        compactMentionAlias(fullName),
        firstName,
        lastName,
        firstName && lastName ? `${firstName}${lastName}` : '',
        user?.username,
        user?.userName,
        user?.email,
        emailPrefix,
      ]
        .filter(Boolean)
        .map((alias) => normalizeMentionAlias(alias)),
    ),
  ).filter(Boolean);
};

const getMentionToken = (user: any) =>
  `@${compactMentionAlias(getUserName(user))}`;

const getUploadedFileUrl = (response: any) => {
  const candidates = [
    response?.viewImage,
    response?.data?.viewImage,
    response?.data?.data?.viewImage,
    response?.url,
    response?.fileUrl,
    response?.data?.url,
    response?.data?.fileUrl,
    response?.data?.data?.url,
    response?.data?.data?.fileUrl,
    response?.image,
    response?.data?.image,
    response?.data?.data?.image,
  ];

  return (
    candidates.find((value) => typeof value === 'string' && value.trim()) || ''
  );
};

const mergeMessage = (messages: JobMessage[], incoming: JobMessage) => {
  if (messages.some((message) => message.id === incoming.id)) return messages;
  return [...messages, incoming].sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
  );
};

const upsertMessage = (
  messages: JobMessage[],
  incoming: JobMessage,
): JobMessage[] => {
  const index = messages.findIndex((message) => message.id === incoming.id);
  if (index === -1) return mergeMessage(messages, incoming);

  const existing = messages[index];
  const next = [...messages];
  next[index] = {
    ...incoming,
    files: (incoming.files || []).length > 0 ? incoming.files : existing.files,
  };
  return next;
};

const mergeMessageList = (
  existing: JobMessage[],
  incoming: JobMessage[],
): JobMessage[] => {
  const incomingById = new Map(
    incoming.map((message) => [message.id, message]),
  );

  const merged = incoming.map((serverMessage) => {
    const localMessage = existing.find(
      (message) => message.id === serverMessage.id,
    );
    if (localMessage?.files?.length && !(serverMessage.files || []).length) {
      return { ...serverMessage, files: localMessage.files };
    }
    return serverMessage;
  });

  existing.forEach((localMessage) => {
    if (!incomingById.has(localMessage.id)) {
      merged.push(localMessage);
    }
  });

  return merged.sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
  );
};

const buildMessageFilesFromPayload = (
  message: JobMessage,
  payloadFiles: SendJobMessageFilePayload[],
): JobMessage['files'] => {
  if ((message.files || []).length > 0) return message.files;

  return payloadFiles.map((file, index) => ({
    id: `${message.id}-file-${index}`,
    messageId: message.id,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    fileName: file.fileName,
    fileSize: file.fileSize,
    tenantId: message.tenantId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  }));
};

const extractJobMessage = (response: unknown): JobMessage | null => {
  if (!response || typeof response !== 'object') return null;

  const candidate = response as Record<string, any>;
  if (candidate.id) return candidate as JobMessage;
  if (candidate.data?.id) return candidate.data as JobMessage;
  if (candidate.item?.id) return candidate.item as JobMessage;
  if (candidate.data?.item?.id) return candidate.data.item as JobMessage;

  return null;
};

const normalizeSentMessage = (
  response: unknown,
  payloadFiles: SendJobMessageFilePayload[] = [],
): JobMessage | null => {
  const raw = extractJobMessage(response);

  if (!raw?.id) return null;

  return {
    ...raw,
    files: buildMessageFilesFromPayload(raw, payloadFiles),
  };
};

const getMessagePreview = (message: JobMessage) => {
  if (message.content?.trim()) {
    const trimmed = message.content.trim();
    return trimmed.length > 140 ? `${trimmed.slice(0, 140)}…` : trimmed;
  }

  if ((message.files || []).length > 0) {
    const fileNames = (message.files || [])
      .map((file) => file.fileName || 'Attachment')
      .join(', ');
    return `Attachment: ${fileNames}`;
  }

  return 'Attachment';
};

const messageMatchesSearch = (message: JobMessage, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  if (
    String(message.content || '')
      .toLowerCase()
      .includes(normalizedQuery)
  ) {
    return true;
  }

  return (message.files || []).some((file) =>
    String(file.fileName || '')
      .toLowerCase()
      .includes(normalizedQuery),
  );
};

interface ChatMessageStatusProps {
  isRead: boolean;
}

const ChatMessageStatus = ({ isRead }: ChatMessageStatusProps) => {
  const colorClass = isRead ? 'text-[#52C41A]' : 'text-[rgba(0,0,0,0.35)]';

  if (!isRead) {
    return (
      <span
        className={`inline-flex items-center ${colorClass}`}
        title="Sent"
        aria-label="Sent"
        data-cy="talent-acquisition-job-chat-message-status-sent"
      >
        <Check size={12} strokeWidth={2.25} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-end -space-x-1 ${colorClass}`}
      title="Read"
      aria-label="Read"
      data-cy="talent-acquisition-job-chat-message-status-read"
    >
      <Check size={12} strokeWidth={2.25} aria-hidden />
      <Check
        size={12}
        strokeWidth={2.25}
        className="translate-y-px"
        aria-hidden
      />
    </span>
  );
};

interface ReplyQuoteBlockProps {
  message: JobMessage;
  senderName: string;
  variant: 'composer' | 'inline';
  onClose?: () => void;
}

const ReplyQuoteBlock = ({
  message,
  senderName,
  variant,
  onClose,
}: ReplyQuoteBlockProps) => (
  <div
    className={`rounded-[8px] border border-solid border-[#E5E7EB] bg-[#FAFAFA] ${
      variant === 'composer' ? 'p-3' : 'px-2 py-1.5'
    }`}
    data-cy="talent-acquisition-job-chat-reply-quote"
  >
    <div
      className="flex items-start gap-2"
      data-cy="talent-acquisition-job-chat-reply-quote-body"
    >
      <div
        className="w-1 shrink-0 self-stretch rounded-full bg-[#1E40AF]"
        data-cy="talent-acquisition-job-chat-reply-quote-accent"
      />
      <div
        className="min-w-0 flex-1"
        data-cy="talent-acquisition-job-chat-reply-quote-content"
      >
        {variant === 'composer' ? (
          <div
            className="mb-1 flex items-center justify-between gap-2"
            data-cy="talent-acquisition-job-chat-reply-quote-header"
          >
            <span
              className="text-[12px] font-semibold text-[#1E40AF]"
              data-cy="talent-acquisition-job-chat-reply-quote-sender"
            >
              Replying to {senderName}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="border-0 bg-transparent p-0 text-[rgba(0,0,0,0.45)] hover:text-black"
                data-cy="talent-acquisition-job-chat-clear-reply"
                aria-label="Cancel reply"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <span
            className="mb-0.5 block text-[11px] font-semibold text-[rgba(0,0,0,0.65)]"
            data-cy="talent-acquisition-job-chat-reply-quote-inline-sender"
          >
            {senderName}
          </span>
        )}
        <p
          className="m-0 line-clamp-3 whitespace-pre-wrap text-[13px] leading-5 text-[rgba(0,0,0,0.55)]"
          data-cy="talent-acquisition-job-chat-reply-quote-preview"
        >
          {getMessagePreview(message)}
        </p>
        {variant === 'composer' && (
          <span
            className="mt-1 block text-[11px] text-[rgba(0,0,0,0.35)]"
            data-cy="talent-acquisition-job-chat-reply-quote-time"
          >
            {formatChatDateTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  </div>
);

const JobChat = ({
  jobId,
  jobTitle,
  isActive = true,
  jobTenantId,
}: JobChatProps) => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthenticationStore(
    (state) => state.userData?.id || state.userId,
  );
  const currentUserData = useAuthenticationStore((state) => state.userData);
  const authTenantId = useAuthenticationStore((state) => state.tenantId);
  const userDataTenantId = useAuthenticationStore((state) =>
    String(state.userData?.tenantId || ''),
  );
  // Prefer the job's tenant (backend validates job.tenantId), then auth store.
  const resolvedTenantId = (
    jobTenantId ||
    authTenantId ||
    userDataTenantId ||
    ''
  ).trim();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchTermRef = useRef('');
  const canFetchMessages = !!jobId && !!resolvedTenantId && isActive;
  const messagesQueryKey = useMemo(
    () =>
      getJobChatMessagesQueryKey(jobId, 1, 50, searchTerm, resolvedTenantId),
    [jobId, resolvedTenantId, searchTerm],
  );
  const { data, isLoading, isError, isFetching } = useGetJobChatMessages(
    jobId,
    1,
    50,
    searchTerm,
    {
      tenantId: resolvedTenantId,
      enabled: canFetchMessages,
      refetchInterval: canFetchMessages ? 5000 : false,
    },
  );
  const apiMessages = useMemo(
    () => normalizeJobChatMessagesResponse(data).items,
    [data],
  );
  const showInitialLoading =
    (isLoading || isFetching) && apiMessages.length === 0 && !isError;
  const { data: usersData } = useGetAllUsersData();

  useEffect(() => {
    if (!canFetchMessages) return;

    queryClient
      .fetchQuery(
        messagesQueryKey,
        () => getJobChatMessages(jobId, 1, 50, searchTerm, resolvedTenantId),
        { staleTime: 0 },
      )
      .catch(() => {});
  }, [
    canFetchMessages,
    jobId,
    messagesQueryKey,
    queryClient,
    resolvedTenantId,
    searchTerm,
  ]);

  const { mutate: sendMessageFallback, isLoading: isFallbackSending } =
    useSendJobChatMessage();
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [content, setContent] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<JobMessage | null>(null);
  const [files, setFiles] = useState<SendJobMessageFilePayload[]>([]);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [socket, setSocket] = useState<JobChatSocket | null>(null);
  const isJoinedToRoomRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<TextAreaRef | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [openMenuMessageId, setOpenMenuMessageId] = useState<string | null>(
    null,
  );

  const users = useMemo(() => normalizeUsers(usersData), [usersData]);
  const userById = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((user) => {
      if (user?.id) map.set(user.id, user);
    });
    return map;
  }, [users]);

  const currentSenderName = useMemo(() => {
    const directoryName = getUserName(
      currentUserId ? userById.get(currentUserId) : undefined,
    );
    const authName = getUserName(currentUserData);
    const name = directoryName !== 'Unknown user' ? directoryName : authName;

    return name !== 'Unknown user' ? name : undefined;
  }, [currentUserData, currentUserId, userById]);

  const participants = useMemo(() => {
    const participantIds = new Set<string>();
    if (currentUserId) participantIds.add(currentUserId);
    messages.forEach((message) => {
      if (message.senderId) participantIds.add(message.senderId);
    });
    apiMessages.forEach((message) => {
      if (message.senderId) participantIds.add(message.senderId);
    });

    return Array.from(participantIds)
      .map((userId) => userById.get(userId))
      .filter(Boolean);
  }, [apiMessages, currentUserId, messages, userById]);

  const participantIdSet = useMemo(
    () => new Set(participants.map((user: any) => user.id)),
    [participants],
  );

  const mentionableUsers = useMemo(
    () => users.filter((user) => user?.id && user.id !== currentUserId),
    [currentUserId, users],
  );

  const filteredMentionUsers = useMemo(() => {
    if (mentionQuery === null) return [];

    const query = mentionQuery.trim().toLowerCase();

    return mentionableUsers
      .filter((user) => {
        const name = getUserName(user).toLowerCase();
        const email = String(user?.email || '').toLowerCase();
        return (
          query.length === 0 ||
          name.includes(query) ||
          email.includes(query) ||
          compactMentionAlias(name).includes(query.replace(/\s+/g, ''))
        );
      })
      .sort((a, b) => {
        const aIsParticipant = participantIdSet.has(a.id) ? 0 : 1;
        const bIsParticipant = participantIdSet.has(b.id) ? 0 : 1;
        if (aIsParticipant !== bIsParticipant)
          return aIsParticipant - bIsParticipant;
        return getUserName(a).localeCompare(getUserName(b));
      });
  }, [mentionQuery, mentionableUsers, participantIdSet]);

  const getComposerTextArea = () =>
    textareaRef.current?.resizableTextArea?.textArea ?? null;

  const updateMentionState = (value: string, cursorPosition: number) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([A-Za-z0-9._-]*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionStartIndex(cursorPosition - mentionMatch[0].length);
      setSelectedMentionIndex(0);
      return;
    }

    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);
  };

  const insertMention = (user: any) => {
    if (mentionStartIndex < 0) return;

    const mentionToken = getMentionToken(user);
    const cursorPosition =
      getComposerTextArea()?.selectionStart ?? content.length;
    const before = content.slice(0, mentionStartIndex);
    const after = content.slice(cursorPosition);
    const nextContent = `${before}${mentionToken} ${after}`;

    setContent(nextContent);
    setMentionedUserIds((current) =>
      Array.from(new Set([...current, user.id])),
    );
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);

    requestAnimationFrame(() => {
      const nextCursor = before.length + mentionToken.length + 1;
      const textArea = getComposerTextArea();
      textArea?.focus();
      textArea?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const nextValue = event.target.value;
    setContent(nextValue);
    updateMentionState(
      nextValue,
      event.target.selectionStart ?? nextValue.length,
    );
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (mentionQuery !== null && filteredMentionUsers.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedMentionIndex((current) =>
          Math.min(current + 1, filteredMentionUsers.length - 1),
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedMentionIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        insertMention(filteredMentionUsers[selectedMentionIndex]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setMentionQuery(null);
        setMentionStartIndex(-1);
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        insertMention(filteredMentionUsers[selectedMentionIndex]);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const mentionAliasByUserId = useMemo(() => {
    const map = new Map<string, string[]>();
    users.forEach((user) => {
      if (user?.id) map.set(user.id, getUserAliases(user));
    });
    return map;
  }, [users]);

  const getMentionIdsFromContent = (value: string) => {
    const aliases = Array.from(value.matchAll(/@([A-Za-z0-9._-]+)/g)).map(
      (match) => normalizeMentionAlias(match[1]),
    );

    if (aliases.length === 0) return [];

    return users
      .filter((user) => {
        if (!user?.id || user.id === currentUserId) return false;
        const userAliases = mentionAliasByUserId.get(user.id) || [];
        return aliases.some((alias) => userAliases.includes(alias));
      })
      .map((user) => user.id);
  };

  const renderMessageContent = (
    value: string,
    mentions: JobMessage['mentions'],
  ) => {
    const aliases = new Set<string>();
    (mentions || []).forEach((mention) => {
      const userAliases =
        mentionAliasByUserId.get(mention.mentionedUserId) || [];
      userAliases.forEach((alias) => aliases.add(alias));
    });

    return value.split(/(@[A-Za-z0-9._-]+)/g).map((part, index) => {
      const isMention =
        part.startsWith('@') && aliases.has(normalizeMentionAlias(part));

      if (!isMention) {
        return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      }

      return (
        <span
          key={`${part}-${index}`}
          className="rounded-[4px] bg-[#BAE0FF] px-1 font-semibold text-[#1E40AF]"
          data-cy="talent-acquisition-job-chat-mention-highlight"
        >
          {part}
        </span>
      );
    });
  };

  const visibleMessages = useMemo(() => {
    const activeSearch = searchTerm.trim();
    if (!activeSearch) return messages;
    return messages.filter((message) =>
      messageMatchesSearch(message, activeSearch),
    );
  }, [messages, searchTerm]);

  const applyReadReceiptToMessages = useCallback(
    (currentMessages: JobMessage[], readerUserId: string, readAt: string) =>
      currentMessages.map((message) => {
        if (
          message.senderId !== currentUserId ||
          readerUserId === currentUserId ||
          dayjs(message.createdAt).isAfter(dayjs(readAt))
        ) {
          return message;
        }

        return {
          ...message,
          readByUserIds: Array.from(
            new Set([...(message.readByUserIds || []), readerUserId]),
          ),
        };
      }),
    [currentUserId],
  );

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    const activeSearch = searchTerm.trim();
    const incomingItems = apiMessages;

    if (incomingItems.length === 0) {
      if (
        activeSearch ||
        (canFetchMessages && !isLoading && !isFetching && !isError)
      ) {
        setMessages([]);
      }
      return;
    }

    if (activeSearch) {
      setMessages(incomingItems);
      return;
    }

    setMessages((current) => {
      if (current.length === 0) return incomingItems;
      return mergeMessageList(current, incomingItems);
    });
  }, [
    apiMessages,
    canFetchMessages,
    data,
    isError,
    isFetching,
    isLoading,
    jobId,
    searchTerm,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);

  useEffect(() => {
    if (!replyTo) return;

    requestAnimationFrame(() => {
      getComposerTextArea()?.focus();
    });
  }, [replyTo]);

  useEffect(() => {
    if (!jobId || !isActive) return;

    let mounted = true;
    let activeSocket: JobChatSocket | null = null;
    let handleConnect: (() => void) | undefined;
    let handleNewMessage: ((message: JobMessage) => void) | undefined;
    let handleUnreadCount: (() => void) | undefined;
    let handleMention: ((message: JobMessage) => void) | undefined;
    let handleMessageRead:
      | ((payload: { jobId: string; userId: string; readAt: string }) => void)
      | undefined;

    const setJoinedState = (joined: boolean) => {
      isJoinedToRoomRef.current = joined;
    };

    getJobChatSocket(resolvedTenantId).then((nextSocket) => {
      if (!mounted) return;

      if (!nextSocket) {
        setJoinedState(false);
        return;
      }

      activeSocket = nextSocket;
      setSocket(nextSocket);

      const join = () => {
        setJoinedState(false);
        nextSocket.emit('joinJob', { jobId }, (joinResponse: unknown) => {
          const joined =
            !!joinResponse &&
            !(joinResponse instanceof Error) &&
            Boolean(
              (joinResponse as { jobId?: string; room?: string }).jobId ||
              (joinResponse as { jobId?: string; room?: string }).room,
            );

          setJoinedState(joined);

          if (!joined) {
            NotificationMessage.warning({
              message: 'Chat connection issue',
              description:
                'Could not join the live chat room. Messages may not reach others until this is resolved.',
            });
          }
        });
        nextSocket.emit('markRead', { jobId });
      };

      handleConnect = () => join();

      handleNewMessage = (message: JobMessage) => {
        if (message.jobId !== jobId) return;
        if (
          searchTermRef.current.trim() &&
          !messageMatchesSearch(message, searchTermRef.current)
        ) {
          nextSocket.emit('markRead', { jobId });
          return;
        }

        setMessages((current) => upsertMessage(current, message));
        upsertJobChatCache(
          queryClient,
          getJobChatMessagesQueryKey(
            jobId,
            1,
            50,
            searchTermRef.current,
            resolvedTenantId,
          ),
          (current) => {
            const exists = current.items.some((item) => item.id === message.id);
            const nextItems = exists
              ? current.items.map((item) =>
                  item.id === message.id
                    ? upsertMessage([item], message)[0]
                    : item,
                )
              : mergeMessage(current.items, message);

            return {
              ...current,
              items: nextItems,
              total: exists
                ? current.total
                : Math.max(current.total, nextItems.length),
            };
          },
        );
        nextSocket.emit('markRead', { jobId });
      };

      handleUnreadCount = () => {
        queryClient.invalidateQueries(['job-chat-unread-counts']);
      };

      handleMention = (message: JobMessage) => {
        NotificationMessage.warning({
          message: 'New mention',
          description:
            message.jobId === jobId
              ? 'You were mentioned in this job chat.'
              : 'You were mentioned in another job chat.',
        });
      };

      handleMessageRead = (payload: {
        jobId: string;
        userId: string;
        readAt: string;
      }) => {
        if (payload.jobId !== jobId) return;

        setMessages((current) =>
          applyReadReceiptToMessages(current, payload.userId, payload.readAt),
        );
        upsertJobChatCache(
          queryClient,
          getJobChatMessagesQueryKey(
            jobId,
            1,
            50,
            searchTermRef.current,
            resolvedTenantId,
          ),
          (current) => ({
            ...current,
            items: applyReadReceiptToMessages(
              current.items,
              payload.userId,
              payload.readAt,
            ),
          }),
        );
      };

      if (handleConnect) nextSocket.on('connect', handleConnect);
      if (handleNewMessage) nextSocket.on('newMessage', handleNewMessage);
      if (handleUnreadCount)
        nextSocket.on('unreadCountUpdated', handleUnreadCount);
      if (handleMention) nextSocket.on('jobChatMention', handleMention);
      if (handleMessageRead) nextSocket.on('messageRead', handleMessageRead);

      if (nextSocket.connected) join();
    });

    return () => {
      mounted = false;
      setJoinedState(false);
      if (activeSocket) {
        if (handleConnect) activeSocket.off('connect', handleConnect);
        if (handleNewMessage) activeSocket.off('newMessage', handleNewMessage);
        if (handleUnreadCount)
          activeSocket.off('unreadCountUpdated', handleUnreadCount);
        if (handleMention) activeSocket.off('jobChatMention', handleMention);
        if (handleMessageRead)
          activeSocket.off('messageRead', handleMessageRead);
      }
    };
  }, [
    applyReadReceiptToMessages,
    currentUserId,
    isActive,
    jobId,
    queryClient,
    resolvedTenantId,
  ]);

  const clearComposer = () => {
    setContent('');
    setMentionedUserIds([]);
    setReplyTo(null);
    setFiles([]);
    setUploadFiles([]);
    setMentionQuery(null);
    setMentionStartIndex(-1);
    setSelectedMentionIndex(0);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    const outboundFiles = files;
    if (!trimmed && outboundFiles.length === 0) return;

    const finalMentionedUserIds = Array.from(
      new Set([...mentionedUserIds, ...getMentionIdsFromContent(trimmed)]),
    ).filter((userId) => userId && userId !== currentUserId);

    const messagePayload = {
      jobId,
      content: trimmed || undefined,
      senderName: currentSenderName,
      parentMessageId: replyTo?.id,
      mentionedUserIds: finalMentionedUserIds,
      files: outboundFiles.length > 0 ? outboundFiles : undefined,
    };

    const canSendViaSocket = !!socket?.connected && isJoinedToRoomRef.current;

    const applySentMessage = (response: unknown) => {
      const sentMessage = normalizeSentMessage(response, outboundFiles);
      if (!sentMessage) {
        NotificationMessage.error({
          message: 'Message failed',
          description:
            'Could not confirm the message was sent. Please try again.',
        });
        return;
      }

      setMessages((current) => upsertMessage(current, sentMessage));
      upsertJobChatCache(queryClient, messagesQueryKey, (current) => {
        const exists = current.items.some((item) => item.id === sentMessage.id);
        const nextItems = exists
          ? current.items.map((item) =>
              item.id === sentMessage.id
                ? upsertMessage([item], sentMessage)[0]
                : item,
            )
          : mergeMessage(current.items, sentMessage);

        return {
          ...current,
          items: nextItems,
          total: exists
            ? current.total
            : Math.max(current.total, nextItems.length),
        };
      });
      queryClient.invalidateQueries(['job-chat-messages', jobId]);
      clearComposer();
    };

    const sendWithRestFallback = () => {
      sendMessageFallback(
        { ...messagePayload, tenantId: resolvedTenantId },
        {
          onSuccess: (response: unknown) => {
            applySentMessage(response);
          },
        },
      );
    };

    if (canSendViaSocket && socket) {
      (socket.timeout(15000) as any).emit(
        'sendMessage',
        messagePayload,
        (ackError: Error | null, ackMessage?: JobMessage) => {
          if (ackError) {
            sendWithRestFallback();
            return;
          }

          if (ackMessage?.id) {
            applySentMessage(ackMessage);
            return;
          }

          sendWithRestFallback();
        },
      );
      return;
    }

    sendWithRestFallback();
  };

  const uploadAttachedFile = async (file: File) => {
    setIsUploading(true);

    try {
      const response = await fileUpload(file);
      const fileUrl = getUploadedFileUrl(response);
      if (!fileUrl) throw new Error('Upload response did not include file URL');

      const nextFile: SendJobMessageFilePayload = {
        fileUrl,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
      };

      setFiles([nextFile]);
      setUploadFiles([
        {
          uid: `${file.name}-${Date.now()}`,
          name: file.name,
          status: 'done',
          url: fileUrl,
          size: file.size,
          type: file.type,
        },
      ]);
    } catch (error) {
      NotificationMessage.error({
        message: 'Upload failed',
        description: 'Unable to attach file. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const isUnder500MB = file.size / 1024 / 1024 <= 500;
    if (!isUnder500MB) {
      NotificationMessage.warning({
        message: `${file.name} is larger than 500MB.`,
      });
      return;
    }

    await uploadAttachedFile(file);
  };

  const handleRemoveFile = (file: UploadFile) => {
    const fileIndex = uploadFiles.findIndex(
      (uploadFile) => uploadFile.uid === file.uid,
    );

    setUploadFiles((current) =>
      current.filter((item) => item.uid !== file.uid),
    );
    setFiles((current) =>
      fileIndex >= 0
        ? current.filter((item, itemIndex) => itemIndex !== fileIndex)
        : current.filter((item) => item.fileName !== file.name),
    );
  };

  const getParentMessage = (parentMessageId?: string | null) =>
    parentMessageId
      ? messages.find((message) => message.id === parentMessageId)
      : undefined;

  const getSenderDisplayName = (senderId: string) => {
    if (senderId === currentUserId) return 'You';
    return getUserName(userById.get(senderId));
  };

  const handleStartReply = (message: JobMessage) => {
    setOpenMenuMessageId(null);
    setReplyTo(message);
  };

  const getMessageActionMenuItems = (
    message: JobMessage,
  ): MenuProps['items'] => [
    {
      key: 'reply',
      label: (
        <span
          className="flex items-center gap-2 text-[13px]"
          data-cy="talent-acquisition-job-chat-reply-menu-label"
        >
          <Reply size={14} />
          Reply
        </span>
      ),
      onClick: () => handleStartReply(message),
    },
  ];

  const chatTitle = jobTitle ? `${jobTitle} Chat` : 'Job Chat';

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[8px] border border-solid border-[#E5E7EB] bg-white font-['Calibri']"
      data-cy="talent-acquisition-job-chat"
    >
      <div
        className="shrink-0 border-0 border-b border-solid border-[#E5E7EB] px-4 pb-3 pt-4"
        data-cy="talent-acquisition-job-chat-header"
      >
        <div
          className="flex items-start justify-between gap-3"
          data-cy="talent-acquisition-job-chat-header-row"
        >
          <div
            className="min-w-0 flex-1"
            data-cy="talent-acquisition-job-chat-header-info"
          >
            <h3
              className="m-0 truncate text-[16px] font-bold leading-tight text-black"
              data-cy="talent-acquisition-job-chat-title"
            >
              {chatTitle}
            </h3>
            <div
              className="mt-2 flex items-center gap-2"
              data-cy="talent-acquisition-job-chat-participants"
            >
              <span
                className="shrink-0 text-[13px] text-[rgba(0,0,0,0.45)]"
                data-cy="talent-acquisition-job-chat-participants-label"
              >
                Participants:
              </span>
              <div
                className="flex items-center -space-x-1.5"
                data-cy="talent-acquisition-job-chat-participants-avatars"
              >
                {participants.slice(0, 5).map((user: any) => {
                  const name = getUserName(user);
                  const profileImage =
                    user?.profileImage ||
                    user?.employeeInformation?.profileImage ||
                    user?.avatar;

                  return (
                    <Avatar
                      key={user.id}
                      size={24}
                      src={profileImage || undefined}
                      className="!border-2 !border-white"
                      style={{
                        backgroundColor: profileImage
                          ? undefined
                          : getParticipantAvatarColor(user.id),
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {!profileImage ? getUserAvatarText(name) : null}
                    </Avatar>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch((current) => !current)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-solid bg-white ${
              showSearch
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-[#D9D9D9] text-[rgba(0,0,0,0.65)] hover:border-[#1E40AF] hover:text-[#1E40AF]'
            }`}
            data-cy="talent-acquisition-job-chat-search-toggle"
            aria-label="Search messages"
          >
            <Search size={16} />
          </button>
        </div>

        {showSearch && (
          <div
            className="mt-3"
            data-cy="talent-acquisition-job-chat-search-wrapper"
          >
            <Input
              data-cy="talent-acquisition-job-chat-search-input"
              allowClear
              autoFocus
              prefix={<Search size={15} className="text-[rgba(0,0,0,0.45)]" />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search messages"
              className="!h-9 !rounded-[8px] !border-[#D9D9D9]"
            />
          </div>
        )}
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4"
        data-cy="talent-acquisition-job-chat-message-list"
      >
        {showInitialLoading ? (
          <div
            className="flex h-full items-center justify-center"
            data-cy="talent-acquisition-job-chat-loading"
          >
            <Spin />
          </div>
        ) : isError ? (
          <div
            className="flex h-full items-center justify-center"
            data-cy="talent-acquisition-job-chat-error"
          >
            <Empty description="Unable to load chat messages" />
          </div>
        ) : visibleMessages.length === 0 ? (
          <div
            className="flex h-full items-center justify-center"
            data-cy="talent-acquisition-job-chat-empty-wrapper"
          >
            <Empty
              description={
                searchTerm.trim() ? 'No messages found' : 'No messages yet'
              }
              data-cy="talent-acquisition-job-chat-empty"
            />
          </div>
        ) : (
          <div
            className="space-y-4"
            data-cy="talent-acquisition-job-chat-messages"
          >
            {visibleMessages.map((message) => {
              const isMine = message.senderId === currentUserId;
              const parent = getParentMessage(message.parentMessageId);
              const readByOtherUserIds = (message.readByUserIds || []).filter(
                (userId) => userId && userId !== currentUserId,
              );
              const isRead = readByOtherUserIds.length > 0;
              const formattedTime = formatChatTime(message.createdAt);
              const isReplyTarget = replyTo?.id === message.id;
              const isMenuOpen = openMenuMessageId === message.id;
              const messageMenuButtonClass = `mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border-0 bg-transparent text-[rgba(0,0,0,0.45)] transition-opacity hover:bg-[#F5F5F5] hover:text-[#1E40AF] ${
                isMenuOpen
                  ? 'opacity-100'
                  : 'opacity-0 group-hover/message:opacity-100'
              }`;

              return (
                <div
                  key={message.id}
                  data-cy="talent-acquisition-job-chat-message"
                  className={`group/message flex w-full items-start gap-1 ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {isMine && (
                    <Dropdown
                      menu={{ items: getMessageActionMenuItems(message) }}
                      trigger={['click']}
                      placement="bottomLeft"
                      open={isMenuOpen}
                      onOpenChange={(open) =>
                        setOpenMenuMessageId(open ? message.id : null)
                      }
                    >
                      <button
                        type="button"
                        className={messageMenuButtonClass}
                        data-cy="talent-acquisition-job-chat-message-menu"
                        aria-label="Message actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </Dropdown>
                  )}

                  <div
                    className={`max-w-[88%] rounded-[8px] px-3 py-2.5 text-[14px] leading-5 text-black ${
                      isMine ? 'bg-[#E3F2FD]' : 'bg-[#F5F5F5]'
                    } ${isReplyTarget ? 'ring-2 ring-[#1E40AF]/25' : ''}`}
                    data-cy="talent-acquisition-job-chat-message-bubble"
                  >
                    {parent && (
                      <div
                        className="mb-2"
                        data-cy="talent-acquisition-job-chat-message-parent"
                      >
                        <ReplyQuoteBlock
                          message={parent}
                          senderName={getSenderDisplayName(parent.senderId)}
                          variant="inline"
                        />
                      </div>
                    )}
                    {message.content && (
                      <div
                        className="whitespace-pre-wrap break-words"
                        data-cy="talent-acquisition-job-chat-message-content"
                      >
                        {renderMessageContent(
                          message.content,
                          message.mentions,
                        )}
                      </div>
                    )}
                    {(message.files || []).length > 0 && (
                      <div
                        className="mt-2 space-y-1"
                        data-cy="talent-acquisition-job-chat-message-files"
                      >
                        {(message.files || []).map((file) => {
                          const isImage = String(
                            file.fileType || '',
                          ).startsWith('image/');

                          if (isImage) {
                            return (
                              <a
                                key={file.id || file.fileUrl}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block overflow-hidden rounded-[8px] border border-solid border-[#91CAFF]"
                                data-cy="talent-acquisition-job-chat-message-image-link"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={file.fileUrl}
                                  alt={file.fileName || 'Shared image'}
                                  className="max-h-72 w-full object-cover"
                                  data-cy="talent-acquisition-job-chat-message-image"
                                />
                              </a>
                            );
                          }

                          return (
                            <a
                              key={file.id || file.fileUrl}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-[6px] bg-white/70 px-2 py-1 text-[13px] text-[#1E40AF] underline"
                              data-cy="talent-acquisition-job-chat-message-file-link"
                            >
                              <FileText size={14} />
                              <span
                                className="truncate"
                                data-cy="talent-acquisition-job-chat-message-file-name"
                              >
                                {file.fileName || 'Attachment'}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <div
                      className="mt-1.5 flex items-center justify-end gap-1 text-[11px] leading-none text-[rgba(0,0,0,0.45)]"
                      data-cy="talent-acquisition-job-chat-message-meta"
                    >
                      <span data-cy="talent-acquisition-job-chat-message-time">
                        {formattedTime}
                      </span>
                      {isMine && <ChatMessageStatus isRead={isRead} />}
                    </div>
                  </div>

                  {!isMine && (
                    <Dropdown
                      menu={{ items: getMessageActionMenuItems(message) }}
                      trigger={['click']}
                      placement="bottomRight"
                      open={isMenuOpen}
                      onOpenChange={(open) =>
                        setOpenMenuMessageId(open ? message.id : null)
                      }
                    >
                      <button
                        type="button"
                        className={messageMenuButtonClass}
                        data-cy="talent-acquisition-job-chat-message-menu"
                        aria-label="Message actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </Dropdown>
                  )}
                </div>
              );
            })}
            <div
              ref={messagesEndRef}
              data-cy="talent-acquisition-job-chat-messages-end"
            />
          </div>
        )}
      </div>

      <div
        className="shrink-0 border-0 border-t border-solid border-[#E5E7EB] bg-white px-4 pb-4 pt-3"
        data-cy="talent-acquisition-job-chat-composer"
      >
        <div
          className={`rounded-[8px] ${
            replyTo
              ? 'border border-solid border-[#91CAFF] bg-[#F8FBFF] p-3'
              : ''
          }`}
          data-cy="talent-acquisition-job-chat-composer-inner"
        >
          {replyTo && (
            <div
              className="mb-3"
              data-cy="talent-acquisition-job-chat-composer-reply"
            >
              <ReplyQuoteBlock
                message={replyTo}
                senderName={getSenderDisplayName(replyTo.senderId)}
                variant="composer"
                onClose={() => setReplyTo(null)}
              />
            </div>
          )}

          {uploadFiles.length > 0 && (
            <div
              className="mb-2 space-y-1"
              data-cy="talent-acquisition-job-chat-upload-list"
            >
              {uploadFiles.map((file) => (
                <div
                  key={file.uid}
                  className="flex items-center gap-2 rounded-[8px] bg-[#F5F5F5] px-3 py-2 text-[13px] text-[rgba(0,0,0,0.75)]"
                  data-cy="talent-acquisition-job-chat-upload-item"
                >
                  <FileText size={14} className="shrink-0 text-[#1E40AF]" />
                  <span
                    className="min-w-0 flex-1 truncate"
                    data-cy="talent-acquisition-job-chat-upload-name"
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="border-0 bg-transparent p-0 text-[rgba(0,0,0,0.45)] hover:text-[#FF4D4F]"
                    aria-label={`Remove ${file.name}`}
                    data-cy="talent-acquisition-job-chat-upload-remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className="relative"
            data-cy="talent-acquisition-job-chat-composer-input-wrapper"
          >
            {mentionQuery !== null && filteredMentionUsers.length > 0 && (
              <div
                className="absolute bottom-full left-0 right-0 z-20 mb-2 max-h-60 overflow-y-auto rounded-[8px] border border-solid border-[#D9D9D9] bg-white py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                data-cy="talent-acquisition-job-chat-mention-dropdown"
              >
                {filteredMentionUsers.map((user: any, index) => {
                  const name = getUserName(user);
                  const isParticipant = participantIdSet.has(user.id);
                  const profileImage =
                    user?.profileImage ||
                    user?.employeeInformation?.profileImage ||
                    user?.avatar;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => insertMention(user)}
                      className={`flex w-full items-center gap-2 border-0 px-3 py-2 text-left ${
                        index === selectedMentionIndex
                          ? 'bg-[#E6F4FF]'
                          : isParticipant
                            ? 'bg-[#F0F7FF] hover:bg-[#E6F4FF]'
                            : 'bg-white hover:bg-[#F5F5F5]'
                      }`}
                      data-cy="talent-acquisition-job-chat-mention-option"
                    >
                      <Avatar
                        size={28}
                        src={profileImage || undefined}
                        style={{
                          backgroundColor: profileImage
                            ? undefined
                            : getParticipantAvatarColor(user.id),
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {!profileImage ? getUserAvatarText(name) : null}
                      </Avatar>
                      <div
                        className="min-w-0 flex-1"
                        data-cy="talent-acquisition-job-chat-mention-user-info"
                      >
                        <div
                          className={`truncate text-[14px] ${
                            isParticipant
                              ? 'font-semibold text-[#1E40AF]'
                              : 'font-normal text-black'
                          }`}
                          data-cy="talent-acquisition-job-chat-mention-user-name"
                        >
                          {name}
                        </div>
                        {user?.email && (
                          <div
                            className="truncate text-[12px] text-[rgba(0,0,0,0.45)]"
                            data-cy="talent-acquisition-job-chat-mention-user-email"
                          >
                            {user.email}
                          </div>
                        )}
                      </div>
                      {isParticipant && (
                        <span
                          className="shrink-0 rounded-[4px] bg-[#BAE0FF] px-2 py-0.5 text-[11px] font-semibold text-[#1E40AF]"
                          data-cy="talent-acquisition-job-chat-mention-participant-badge"
                        >
                          Participant
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <Input.TextArea
              ref={textareaRef}
              data-cy="talent-acquisition-job-chat-message-input"
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleComposerKeyDown}
              onClick={(event) =>
                updateMentionState(
                  content,
                  event.currentTarget.selectionStart ?? content.length,
                )
              }
              onSelect={(event) =>
                updateMentionState(
                  content,
                  event.currentTarget.selectionStart ?? content.length,
                )
              }
              onKeyUp={(event) =>
                updateMentionState(
                  content,
                  event.currentTarget.selectionStart ?? content.length,
                )
              }
              placeholder={
                replyTo
                  ? `Reply to ${getSenderDisplayName(replyTo.senderId)}...`
                  : 'Type a message... use @ to mention someone to chat'
              }
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="!min-h-10 !resize-none !rounded-[8px] !border-[#D9D9D9] !py-2.5 !pl-10 !pr-12 !text-[14px] placeholder:!text-[rgba(0,0,0,0.35)]"
            />
            <div
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2"
              data-cy="talent-acquisition-job-chat-file-input"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                data-cy="talent-acquisition-job-chat-file-input-hidden"
              />
              <button
                type="button"
                onClick={handleAttachClick}
                disabled={isUploading}
                className="flex h-7 w-7 items-center justify-center rounded-[4px] border-0 bg-transparent text-[rgba(0,0,0,0.45)] hover:text-[#1E40AF] disabled:opacity-50"
                data-cy="talent-acquisition-job-chat-attach-button"
                aria-label="Attach file"
              >
                {isUploading ? <Spin size="small" /> : <Paperclip size={16} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={
                isFallbackSending ||
                isUploading ||
                (!content.trim() && files.length === 0)
              }
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[4px] border-0 bg-transparent text-black hover:text-[#1E40AF] disabled:opacity-40"
              data-cy="talent-acquisition-job-chat-send-button"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <p
            className="mb-0 mt-2 text-[12px] text-[rgba(0,0,0,0.45)]"
            data-cy="talent-acquisition-job-chat-composer-hint"
          >
            {replyTo
              ? 'Your reply will be threaded under the selected message.'
              : 'Type @ to mention someone to invite them to chat:'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobChat;
