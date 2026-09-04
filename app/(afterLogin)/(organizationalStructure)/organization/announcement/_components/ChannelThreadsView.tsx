'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Button, Spin, Tooltip } from 'antd';
import {
  PaperClipOutlined,
  SendOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  collaborationQueryKeys,
  getCollabMessageAttachments,
  isCollabAdminRole,
  useAddCollabChannelMembers,
  useChannelConversations,
  useChannelMembers,
  useCreateCollabMessage,
  useReplyToCollabMessage,
  type CollabMessage,
} from '@/store/server/features/collaboration';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useQueryClient } from 'react-query';
import type {
  CollaborationChannel,
  CollaborationSpace,
  SpaceMember,
} from './mockAnnouncementService';
import AddMembersModal from './AddMembersModal';
import ChannelMentionTextArea from './ChannelMentionTextArea';
import MessageAttachments from './MessageAttachments';
import MessageReactions from './MessageReactions';
import { collaborationColors } from './collaborationColors';
import {
  resolveMentionsForPayload,
  spaceMembersToMentionUsers,
  stripMentionHtml,
  type MentionUser,
} from './mentionUtils';
import {
  useAvailableOrgMembers,
  useCollaborationMemberLookup,
} from './useCollaborationMemberLookup';
import { EmojiPickerButton } from './NativeEmojiPicker';

type ChannelThreadsViewProps = {
  space: CollaborationSpace;
  channel: CollaborationChannel;
  onBack?: () => void;
};

const sortMessages = (messages: CollabMessage[] = []) =>
  [...messages].sort(
    (left, right) =>
      new Date(left.createdAt || 0).getTime() -
      new Date(right.createdAt || 0).getTime(),
  );

const ThreadReplyComposer = ({
  conversationId,
  mentionUsers,
  loading,
  onSend,
}: {
  conversationId: string;
  mentionUsers: MentionUser[];
  loading: boolean;
  onSend: (
    body: string,
    mentionedUserIds: string[],
    files: File[],
  ) => Promise<void>;
}) => {
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    const content = body.trim();
    if ((!content && files.length === 0) || loading) return;
    await onSend(
      content || files.map((file) => file.name).join(', '),
      mentionedUserIds,
      files,
    );
    setBody('');
    setFiles([]);
    setMentionedUserIds([]);
  };

  return (
    <div
      className="mt-2"
      data-cy={`announcement-thread-reply-composer-${conversationId}`}
    >
      {files.length > 0 ? (
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          data-cy={`announcement-thread-reply-pending-attachments-${conversationId}`}
        >
          {files.map((file, index) => (
            <span
              key={`${file.name}-${file.lastModified}-${index}`}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
              data-cy={`announcement-thread-reply-pending-attachment-${conversationId}-${index}`}
            >
              {file.name}
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-gray-500"
                onClick={() =>
                  setFiles((current) =>
                    current.filter((_, fileIndex) => fileIndex !== index),
                  )
                }
                aria-label={`Remove ${file.name}`}
                data-cy={`announcement-thread-reply-remove-attachment-${conversationId}-${index}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            setFiles((current) => [...current, ...selected]);
            event.target.value = '';
          }}
          data-cy={`announcement-thread-reply-file-input-${conversationId}`}
        />
        <Tooltip title="Attach files">
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach files to thread reply"
            data-cy={`announcement-thread-reply-attach-${conversationId}`}
          />
        </Tooltip>
        <ChannelMentionTextArea
          singleLine
          value={body}
          onChange={setBody}
          mentionUsers={mentionUsers}
          mentionedUserIds={mentionedUserIds}
          onMentionedUserIdsChange={setMentionedUserIds}
          placeholder="Reply to this thread"
          disabled={loading}
          onPressEnter={() => void submit()}
          dataCy={`announcement-thread-reply-input-${conversationId}`}
        />
        <EmojiPickerButton
          onSelect={(emoji) => setBody((current) => `${current}${emoji}`)}
          disabled={loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-500 disabled:opacity-35"
          dataCy={`announcement-thread-reply-emoji-${conversationId}`}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          disabled={!body.trim() && files.length === 0}
          loading={loading}
          onClick={() => void submit()}
          aria-label="Send thread reply"
          data-cy={`announcement-thread-reply-send-${conversationId}`}
        />
      </div>
    </div>
  );
};

const MessageIdentity = ({
  message,
  memberLookup,
  dataCyPrefix,
  alignRight = false,
}: {
  message: CollabMessage;
  memberLookup: Map<string, SpaceMember>;
  dataCyPrefix: string;
  alignRight?: boolean;
}) => {
  const author = memberLookup.get(message.senderId);
  return (
    <div
      className={`flex items-center gap-2 ${
        alignRight ? 'flex-row-reverse text-right' : ''
      }`}
      data-cy={`${dataCyPrefix}-identity`}
    >
      <Avatar
        size={28}
        src={author?.avatarUrl || undefined}
        icon={!author?.avatarUrl ? <UserOutlined /> : undefined}
        style={{
          backgroundColor: author?.avatarUrl
            ? undefined
            : collaborationColors.primary,
        }}
        data-cy={`${dataCyPrefix}-avatar`}
      />
      <div className="min-w-0" data-cy={`${dataCyPrefix}-meta`}>
        <p
          className="m-0 truncate text-sm font-semibold text-gray-900"
          data-cy={`${dataCyPrefix}-author`}
        >
          {author?.name || 'Unknown user'}
        </p>
        <p
          className="m-0 text-xs text-gray-400"
          data-cy={`${dataCyPrefix}-time`}
        >
          {message.createdAt
            ? dayjs(message.createdAt).format('MMM D, h:mm A')
            : ''}
        </p>
      </div>
    </div>
  );
};

const ThreadConversation = ({
  message,
  memberLookup,
  mentionUsers,
  replyLoading,
  currentUserId,
  onReply,
}: {
  message: CollabMessage;
  memberLookup: Map<string, SpaceMember>;
  mentionUsers: MentionUser[];
  replyLoading: boolean;
  currentUserId?: string;
  onReply: (
    messageId: string,
    body: string,
    mentionedUserIds: string[],
    files: File[],
  ) => Promise<void>;
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const replies = sortMessages(message.threadReplies);
  const isOwnMessage =
    Boolean(currentUserId) &&
    String(message.senderId) === String(currentUserId);

  return (
    <article
      className={`w-full max-w-[85%] rounded-2xl border px-4 py-3 sm:max-w-[75%] ${
        isOwnMessage
          ? 'ml-auto rounded-br-md border-[#BFDBFE] bg-[#E7F1FF]'
          : 'mr-auto rounded-bl-md border-[#E5E7EB] bg-white'
      }`}
      data-cy={`announcement-thread-conversation-${message.id}`}
      data-message-owner={isOwnMessage ? 'current-user' : 'other-user'}
    >
      <MessageIdentity
        message={message}
        memberLookup={memberLookup}
        dataCyPrefix={`announcement-thread-message-${message.id}`}
        alignRight={isOwnMessage}
      />
      <p
        className="mb-2 mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800"
        data-cy={`announcement-thread-message-body-${message.id}`}
      >
        {stripMentionHtml(message.content)}
      </p>
      <MessageAttachments
        attachments={getCollabMessageAttachments(message)}
        dataCyPrefix={`announcement-thread-message-${message.id}`}
      />
      <MessageReactions
        messageId={message.id}
        initialReactions={message.reacts}
        dataCyPrefix={`announcement-thread-message-${message.id}`}
      />

      {replies.length > 0 ? (
        <div
          className="ml-4 border-l-2 border-[#E8EDF2] pl-4"
          data-cy={`announcement-thread-replies-${message.id}`}
        >
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="border-b border-[#F0F2F5] py-3 last:border-b-0"
              data-cy={`announcement-thread-reply-${reply.id}`}
            >
              <MessageIdentity
                message={reply}
                memberLookup={memberLookup}
                dataCyPrefix={`announcement-thread-reply-${reply.id}`}
              />
              <p
                className="mb-0 mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700"
                data-cy={`announcement-thread-reply-body-${reply.id}`}
              >
                {stripMentionHtml(reply.content)}
              </p>
              <MessageAttachments
                attachments={getCollabMessageAttachments(reply)}
                compact
                dataCyPrefix={`announcement-thread-reply-${reply.id}`}
              />
              <MessageReactions
                messageId={reply.id}
                initialReactions={reply.reacts}
                dataCyPrefix={`announcement-thread-reply-${reply.id}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="mt-2 border-0 bg-transparent p-0 text-xs font-medium text-blue-600"
        onClick={() => setReplyOpen((current) => !current)}
        data-cy={`announcement-thread-toggle-reply-${message.id}`}
      >
        {replyOpen
          ? 'Close reply'
          : replies.length > 0
            ? `Reply · ${replies.length}`
            : 'Reply'}
      </button>

      {replyOpen ? (
        <ThreadReplyComposer
          conversationId={message.id}
          mentionUsers={mentionUsers}
          loading={replyLoading}
          onSend={(body, mentionedUserIds, files) =>
            onReply(message.id, body, mentionedUserIds, files)
          }
        />
      ) : null}
    </article>
  );
};

const ChannelThreadsView = ({
  space,
  channel,
  onBack,
}: ChannelThreadsViewProps) => {
  const queryClient = useQueryClient();
  const memberLookup = useCollaborationMemberLookup();
  const { userId: currentUserId } = useAuthenticationStore();
  const { data: conversations = [], isLoading } = useChannelConversations(
    channel.id,
  );
  const { data: channelMembers = [], isLoading: membersLoading } =
    useChannelMembers(channel.id, memberLookup);
  const createMessage = useCreateCollabMessage();
  const replyMutation = useReplyToCollabMessage();
  const addMembersMutation = useAddCollabChannelMembers();

  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canManageMembers = isCollabAdminRole(space.currentUserRole);

  const rosterMembers = useMemo(() => {
    const byId = new Map<string, SpaceMember>();
    if (!channel.isPrivate) {
      space.members.forEach((member) => byId.set(member.id, member));
    }
    channelMembers.forEach((member) => byId.set(member.id, member));
    return Array.from(byId.values());
  }, [channel.isPrivate, channelMembers, space.members]);

  const mentionUsers = useMemo(
    () => spaceMembersToMentionUsers(rosterMembers, currentUserId),
    [currentUserId, rosterMembers],
  );
  const existingMemberIds = useMemo(
    () => new Set(rosterMembers.map((member) => member.id)),
    [rosterMembers],
  );
  const { members: availableOrgMembers, isLoading: orgMembersLoading } =
    useAvailableOrgMembers(existingMemberIds);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [conversations.length]);

  const sendMessage = async () => {
    const content = body.trim();
    if ((!content && files.length === 0) || createMessage.isLoading) return;

    try {
      await createMessage.mutateAsync({
        channelId: channel.id,
        content: content || files.map((file) => file.name).join(', '),
        files,
        mentions: resolveMentionsForPayload(
          content,
          mentionedUserIds,
          mentionUsers,
        ),
      });
      setBody('');
      setFiles([]);
      setMentionedUserIds([]);
    } catch {
      /* mutation toast */
    }
  };

  const sendReply = async (
    messageId: string,
    replyBody: string,
    replyMentionIds: string[],
    replyFiles: File[],
  ) => {
    await replyMutation.mutateAsync({
      parentMessageId: messageId,
      channelId: channel.id,
      content: replyBody,
      files: replyFiles,
      mentions: resolveMentionsForPayload(
        replyBody,
        replyMentionIds,
        mentionUsers,
      ),
    });
  };

  const addMembers = async (memberIds: string[]) => {
    try {
      await addMembersMutation.mutateAsync({
        channelId: channel.id,
        spaceId: space.id,
        isPrivateChannel: Boolean(channel.isPrivate),
        memberIds,
        existingSpaceMemberIds: space.members.map((member) => member.id),
        memberLookup,
      });
      void queryClient.invalidateQueries(collaborationQueryKeys.catalog);
      void queryClient.invalidateQueries(
        collaborationQueryKeys.channelMembers,
      );
      NotificationMessage.success({
        message: channel.isPrivate ? 'Members invited' : 'Members added',
        description: `${memberIds.length} member${
          memberIds.length === 1 ? '' : 's'
        } added successfully.`,
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Could not add members',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col bg-white"
      data-cy="announcement-thread-channel"
    >
      <header
        className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5"
        data-cy="announcement-thread-header"
      >
        <div
          className="flex min-w-0 items-center gap-2"
          data-cy="announcement-thread-header-identity"
        >
          {onBack ? (
            <button
              type="button"
              className="rounded-md border-0 bg-transparent px-2 py-1 text-sm text-gray-500 md:hidden"
              onClick={onBack}
              data-cy="announcement-thread-back"
            >
              Spaces
            </button>
          ) : null}
          <span
            className="truncate text-base font-semibold text-gray-900"
            data-cy="announcement-thread-channel-name"
          >
            #{channel.name}
          </span>
          <span
            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            data-cy="announcement-thread-layout-label"
          >
            Thread
          </span>
        </div>
        {canManageMembers ? (
          <Tooltip
            title={
              channel.isPrivate
                ? 'Invite member to private thread'
                : 'Add member to space'
            }
          >
            <Button
              icon={<UserAddOutlined />}
              onClick={() => setAddMemberOpen(true)}
              aria-label="Add thread member"
              data-cy="announcement-thread-add-member"
            />
          </Tooltip>
        ) : null}
      </header>

      <div
        ref={feedRef}
        className="min-h-0 flex-1 overflow-y-auto bg-[#F7F8FA] px-4 py-5"
        data-cy="announcement-thread-feed"
      >
        <div
          className="mx-auto flex w-full max-w-3xl flex-col gap-3"
          data-cy="announcement-thread-conversations"
        >
          {isLoading ? (
            <div
              className="flex min-h-[240px] items-center justify-center"
              data-cy="announcement-thread-loading"
            >
              <Spin data-cy="announcement-thread-loading-spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <div
              className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white"
              data-cy="announcement-thread-empty"
            >
              <p
                className="m-0 text-sm text-gray-500"
                data-cy="announcement-thread-empty-text"
              >
                No messages yet. Start the conversation below.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ThreadConversation
                key={conversation.id}
                message={conversation}
                memberLookup={memberLookup}
                mentionUsers={mentionUsers}
                replyLoading={replyMutation.isLoading}
                currentUserId={currentUserId}
                onReply={sendReply}
              />
            ))
          )}
        </div>
      </div>

      <div
        className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-3"
        data-cy="announcement-thread-composer-section"
      >
        <div
          className="mx-auto w-full max-w-3xl"
          data-cy="announcement-thread-composer"
        >
          {files.length > 0 ? (
            <div
              className="mb-2 flex flex-wrap gap-1.5"
              data-cy="announcement-thread-attachments"
            >
              {files.map((file, index) => (
                <span
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  data-cy={`announcement-thread-attachment-${index}`}
                >
                  {file.name}
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-gray-500"
                    onClick={() =>
                      setFiles((current) =>
                        current.filter(
                          (currentFile, fileIndex) =>
                            Boolean(currentFile) && fileIndex !== index,
                        ),
                      )
                    }
                    aria-label={`Remove ${file.name}`}
                    data-cy={`announcement-thread-remove-attachment-${index}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div
            className="flex items-end gap-2 rounded-xl border border-[#DDE2E8] bg-white p-2"
            data-cy="announcement-thread-composer-row"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                setFiles((current) => [
                  ...current,
                  ...Array.from(event.target.files ?? []),
                ]);
                event.target.value = '';
              }}
              data-cy="announcement-thread-file-input"
            />
            <Tooltip title="Attach files">
              <Button
                type="text"
                icon={<PaperClipOutlined />}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files"
                data-cy="announcement-thread-attach"
              />
            </Tooltip>
            <ChannelMentionTextArea
              value={body}
              onChange={setBody}
              mentionUsers={mentionUsers}
              mentionUsersLoading={membersLoading}
              mentionedUserIds={mentionedUserIds}
              onMentionedUserIdsChange={setMentionedUserIds}
              placeholder={`Message #${channel.name}`}
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={createMessage.isLoading}
              dataCy="announcement-thread-message-input"
            />
            <EmojiPickerButton
              onSelect={(emoji) => setBody((current) => `${current}${emoji}`)}
              disabled={createMessage.isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-500 disabled:opacity-35"
              dataCy="announcement-thread-message-emoji"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              disabled={!body.trim() && files.length === 0}
              loading={createMessage.isLoading}
              onClick={() => void sendMessage()}
              aria-label="Send message"
              data-cy="announcement-thread-send"
            />
          </div>
        </div>
      </div>

      <AddMembersModal
        open={addMemberOpen}
        title={
          channel.isPrivate
            ? `Invite members to #${channel.name}`
            : `Add members to ${space.name}`
        }
        description={
          <span data-cy="announcement-thread-add-members-description">
            {channel.isPrivate
              ? 'Private threads are visible only to invited channel members.'
              : 'Public threads automatically inherit the space roster.'}
          </span>
        }
        members={availableOrgMembers}
        loading={orgMembersLoading}
        emptyText={
          channel.isPrivate
            ? 'Everyone is already invited to this thread.'
            : 'Everyone is already a member of this space.'
        }
        onClose={() => setAddMemberOpen(false)}
        onAdd={(memberIds) => void addMembers(memberIds)}
      />
    </div>
  );
};

export default ChannelThreadsView;
