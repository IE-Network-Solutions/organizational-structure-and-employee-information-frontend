'use client';
/* eslint-disable local-rules/data-cy-required */

import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import {
  JobMessage,
  SendJobMessageFilePayload,
} from '@/store/server/features/recruitment/job-chat/interface';
import {
  useMarkJobChatRead,
  useSendJobChatMessage,
} from '@/store/server/features/recruitment/job-chat/mutation';
import { useGetJobChatMessages } from '@/store/server/features/recruitment/job-chat/queries';
import {
  getJobChatSocket,
  JobChatSocket,
} from '@/store/server/features/recruitment/job-chat/socket';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fileUpload } from '@/utils/fileUpload';
import { Button, Empty, Input, Select, Spin, Tooltip, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { FileText, Paperclip, Reply, Send, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

interface JobChatProps {
  jobId: string;
  jobTitle?: string;
  isActive?: boolean;
}

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
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const normalizeMentionAlias = (value?: string | null) =>
  String(value || '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();

const compactMentionAlias = (value?: string | null) =>
  normalizeMentionAlias(value).replace(/\s+/g, '');

const getMentionToken = (user: any) =>
  `@${compactMentionAlias(getUserName(user))}`;

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

const getUploadedFileUrl = (response: any) =>
  response?.image ||
  response?.viewImage ||
  response?.url ||
  response?.fileUrl ||
  response?.data?.url ||
  response?.data?.fileUrl ||
  '';

const mergeMessage = (messages: JobMessage[], incoming: JobMessage) => {
  if (messages.some((message) => message.id === incoming.id)) return messages;
  return [...messages, incoming].sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
  );
};

const JobChat = ({ jobId, jobTitle, isActive = true }: JobChatProps) => {
  const queryClient = useQueryClient();
  const currentUserId = useAuthenticationStore((state) => state.userId);
  const { data, isLoading } = useGetJobChatMessages(jobId, 1, 50);
  const { data: usersData } = useGetAllUsersData();
  const { mutate: markRead } = useMarkJobChatRead();
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
  const [isSocketReady, setIsSocketReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const users = useMemo(() => normalizeUsers(usersData), [usersData]);
  const userById = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((user) => {
      if (user?.id) map.set(user.id, user);
    });
    return map;
  }, [users]);

  const mentionOptions = useMemo(
    () =>
      users
        .filter((user) => user?.id && user.id !== currentUserId)
        .map((user) => ({
          value: user.id,
          label: getUserName(user),
        })),
    [currentUserId, users],
  );

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

  const appendMentionTokens = (nextMentionedUserIds: string[]) => {
    const tokens = nextMentionedUserIds
      .map((userId) => userById.get(userId))
      .filter(Boolean)
      .map(getMentionToken);

    if (tokens.length === 0) return;

    setContent((current) => {
      const existingAliases = new Set(
        Array.from(current.matchAll(/@([A-Za-z0-9._-]+)/g)).map((match) =>
          normalizeMentionAlias(match[1]),
        ),
      );
      const missingTokens = tokens.filter(
        (token) => !existingAliases.has(normalizeMentionAlias(token)),
      );

      if (missingTokens.length === 0) return current;
      return [current.trim(), ...missingTokens].filter(Boolean).join(' ');
    });
  };

  const renderMessageContent = (
    value: string,
    mentions: JobMessage['mentions'],
    isMine: boolean,
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
          className={`rounded-[4px] px-1 font-semibold ${
            isMine ? 'bg-white/20 text-white' : 'bg-[#E6F4FF] text-[#1E40AF]'
          }`}
        >
          {part}
        </span>
      );
    });
  };

  useEffect(() => {
    setMessages(data?.items || []);
  }, [data?.items]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!jobId || !isActive) return;

    let mounted = true;
    let activeSocket: JobChatSocket | null = null;

    getJobChatSocket().then((nextSocket) => {
      if (!mounted || !nextSocket) return;

      activeSocket = nextSocket;
      setSocket(nextSocket);
      setIsSocketReady(nextSocket.connected);

      const join = () => {
        setIsSocketReady(true);
        nextSocket.emit('joinJob', { jobId });
        nextSocket.emit('markRead', { jobId });
        markRead(jobId);
      };

      const handleDisconnect = () => setIsSocketReady(false);
      const handleNewMessage = (message: JobMessage) => {
        if (message.jobId !== jobId) return;
        setMessages((current) => mergeMessage(current, message));
        queryClient.setQueryData(
          ['job-chat-messages', jobId, 1, 50],
          (old: any) => {
            if (!old?.items) return old;
            if (old.items.some((item: JobMessage) => item.id === message.id))
              return old;
            return {
              ...old,
              items: mergeMessage(old.items, message),
              total: Number(old.total || old.items.length) + 1,
            };
          },
        );
        nextSocket.emit('markRead', { jobId });
      };
      const handleUnreadCount = () => {
        queryClient.invalidateQueries(['job-chat-unread-counts']);
      };
      const handleMention = (message: JobMessage) => {
        NotificationMessage.warning({
          message: 'New mention',
          description:
            message.jobId === jobId
              ? 'You were mentioned in this job chat.'
              : 'You were mentioned in another job chat.',
        });
      };

      nextSocket.on('connect', join);
      nextSocket.on('disconnect', handleDisconnect);
      nextSocket.on('newMessage', handleNewMessage);
      nextSocket.on('unreadCountUpdated', handleUnreadCount);
      nextSocket.on('jobChatMention', handleMention);

      if (nextSocket.connected) join();
    });

    return () => {
      mounted = false;
      if (activeSocket) {
        activeSocket.off('connect');
        activeSocket.off('disconnect');
        activeSocket.off('newMessage');
        activeSocket.off('unreadCountUpdated');
        activeSocket.off('jobChatMention');
      }
    };
  }, [isActive, jobId, markRead, queryClient]);

  useEffect(() => {
    if (isActive && jobId) {
      markRead(jobId);
    }
  }, [isActive, jobId, markRead]);

  const clearComposer = () => {
    setContent('');
    setMentionedUserIds([]);
    setReplyTo(null);
    setFiles([]);
    setUploadFiles([]);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && files.length === 0) return;

    const finalMentionedUserIds = Array.from(
      new Set([...mentionedUserIds, ...getMentionIdsFromContent(trimmed)]),
    ).filter((userId) => userId && userId !== currentUserId);

    const payload = {
      jobId,
      content: trimmed || undefined,
      parentMessageId: replyTo?.id,
      mentionedUserIds: finalMentionedUserIds,
      files,
    };

    if (socket?.connected) {
      socket.emit('sendMessage', payload, () => {
        clearComposer();
      });
      return;
    }

    sendMessageFallback(payload, {
      onSuccess: (message: JobMessage) => {
        setMessages((current) => mergeMessage(current, message));
        clearComposer();
      },
    });
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await fileUpload(file);
      const fileUrl = getUploadedFileUrl(response);
      if (!fileUrl) throw new Error('Upload response did not include file URL');

      setFiles((current) => [
        ...current,
        {
          fileUrl,
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
        },
      ]);
      setUploadFiles((current) => [
        ...current,
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

    return false;
  };

  const handleRemoveFile = (file: UploadFile) => {
    setUploadFiles((current) =>
      current.filter((item) => item.uid !== file.uid),
    );
    setFiles((current) =>
      current.filter((item) => item.fileName !== file.name),
    );
  };

  const getSenderName = (senderId: string) =>
    senderId === currentUserId ? 'You' : getUserName(userById.get(senderId));

  const getParentMessage = (parentMessageId?: string | null) =>
    parentMessageId
      ? messages.find((message) => message.id === parentMessageId)
      : undefined;

  return (
    <div
      className="mt-7 overflow-hidden rounded-[8px] border border-solid border-[#E5E7EB] bg-white"
      data-cy="talent-acquisition-job-chat"
    >
      <div className="flex items-center justify-between border-0 border-b border-solid border-[#E5E7EB] px-4 py-3">
        <div>
          <h3
            className="m-0 text-[16px] font-bold text-black"
            data-cy="talent-acquisition-job-chat-title"
          >
            Job Chat
          </h3>
          <p className="m-0 text-[13px] text-[rgba(0,0,0,0.45)]">
            {jobTitle || 'Job'} discussion
          </p>
        </div>
        <span
          data-cy="talent-acquisition-job-chat-connection-status"
          className={`rounded-[999px] px-2.5 py-1 text-[12px] ${
            isSocketReady
              ? 'bg-[#F6FFED] text-[#389E0D]'
              : 'bg-[#FFF7E6] text-[#D46B08]'
          }`}
        >
          {isSocketReady ? 'Live' : 'Reconnecting'}
        </span>
      </div>

      <div
        className="h-[440px] overflow-y-auto bg-[#FAFAFA] px-4 py-4"
        data-cy="talent-acquisition-job-chat-message-list"
      >
        {isLoading ? (
          <div
            className="flex h-full items-center justify-center"
            data-cy="talent-acquisition-job-chat-loading"
          >
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty
              description="No messages yet"
              data-cy="talent-acquisition-job-chat-empty"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              const senderName = getSenderName(message.senderId);
              const parent = getParentMessage(message.parentMessageId);

              return (
                <div
                  key={message.id}
                  data-cy="talent-acquisition-job-chat-message"
                  className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F4FF] text-[12px] font-bold text-[#1E40AF]">
                      {getUserAvatarText(senderName)}
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[12px] text-[rgba(0,0,0,0.45)]">
                      <span>{senderName}</span>
                      <span>
                        {dayjs(message.createdAt).format('DD MMM YYYY hh:mm A')}
                      </span>
                    </div>
                    <div
                      className={`rounded-[8px] border border-solid px-3 py-2 text-[14px] leading-5 ${
                        isMine
                          ? 'border-[#1E40AF] bg-[#1E40AF] text-white'
                          : 'border-[#E5E7EB] bg-white text-black'
                      }`}
                    >
                      {parent && (
                        <div
                          className={`mb-2 rounded-[6px] border-l-2 px-2 py-1 text-[12px] ${
                            isMine
                              ? 'border-white/70 bg-white/10 text-white/80'
                              : 'border-[#1E40AF] bg-[#F5F7FA] text-[rgba(0,0,0,0.65)]'
                          }`}
                        >
                          {parent.content || 'Attachment'}
                        </div>
                      )}
                      {message.content && (
                        <div className="whitespace-pre-wrap">
                          {renderMessageContent(
                            message.content,
                            message.mentions,
                            isMine,
                          )}
                        </div>
                      )}
                      {(message.files || []).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(message.files || []).map((file) => (
                            <a
                              key={file.id || file.fileUrl}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 rounded-[6px] px-2 py-1 text-[13px] underline ${
                                isMine
                                  ? 'bg-white/10 text-white'
                                  : 'bg-[#F5F7FA] text-[#1E40AF]'
                              }`}
                            >
                              <FileText size={14} />
                              <span className="truncate">
                                {file.fileName || 'Attachment'}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTo(message)}
                      data-cy="talent-acquisition-job-chat-reply-button"
                      className="mt-1 inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[12px] text-[#1E40AF]"
                    >
                      <Reply size={12} /> Reply
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-0 border-t border-solid border-[#E5E7EB] bg-white p-4">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-[6px] bg-[#F5F7FA] px-3 py-2 text-[13px] text-[rgba(0,0,0,0.65)]">
            <span className="truncate">
              Replying to: {replyTo.content || 'Attachment'}
            </span>
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-[rgba(0,0,0,0.45)]"
              data-cy="talent-acquisition-job-chat-clear-reply"
              onClick={() => setReplyTo(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mb-2">
          <Select
            data-cy="talent-acquisition-job-chat-mention-select"
            mode="multiple"
            allowClear
            showSearch
            value={mentionedUserIds}
            onChange={(nextMentionedUserIds) => {
              setMentionedUserIds(nextMentionedUserIds);
              appendMentionTokens(nextMentionedUserIds);
            }}
            options={mentionOptions}
            optionFilterProp="label"
            placeholder="Mention teammates"
            className="w-full"
            maxTagCount="responsive"
          />
        </div>

        <Upload
          fileList={uploadFiles}
          beforeUpload={handleUpload}
          onRemove={handleRemoveFile}
          multiple
          showUploadList
        >
          <Button
            icon={<Paperclip size={16} />}
            loading={isUploading}
            data-cy="talent-acquisition-job-chat-attach-button"
          >
            Attach file
          </Button>
        </Upload>

        <div className="mt-3 flex items-end gap-2">
          <Input.TextArea
            data-cy="talent-acquisition-job-chat-message-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write a message..."
            autoSize={{ minRows: 2, maxRows: 5 }}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Tooltip title="Send">
            <Button
              type="primary"
              icon={<Send size={16} />}
              onClick={handleSend}
              loading={isFallbackSending}
              disabled={isUploading || (!content.trim() && files.length === 0)}
              className="!h-10 !w-10 !rounded-[6px]"
              data-cy="talent-acquisition-job-chat-send-button"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default JobChat;
