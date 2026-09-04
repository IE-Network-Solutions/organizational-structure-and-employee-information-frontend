'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Button, Input, Spin, Tooltip } from 'antd';
import {
  CloseOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  BsPaperclip,
  BsSendFill,
  BsTypeUnderline,
} from 'react-icons/bs';
import { MdOutlineCampaign } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import {
  collaborationQueryKeys,
  getChannelMembersQueryKey,
  isCollabAdminRole,
  mergeChannelMembers,
  mergeMembersIntoCatalogSpaces,
  resolveCollabUserId,
  useAddCollabChannelMembers,
  useChannelMembers,
  useChannelPosts,
  useCreateCollabMessage,
  useMessageThread,
  useReplyToCollabMessage,
} from '@/store/server/features/collaboration';
import type {
  ChannelPost,
  PostReply,
} from '@/store/uistate/features/organizationStructure/announcementChannels';
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
  useAvailableOrgMembers,
  useCollaborationMemberLookup,
} from './useCollaborationMemberLookup';
import {
  resolveMentionsForPayload,
  spaceMembersToMentionUsers,
  type MentionUser,
} from './mentionUtils';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useQueryClient } from 'react-query';
import { EmojiPickerButton } from './NativeEmojiPicker';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const formatPostTimestamp = (iso: string) => {
  const date = dayjs(iso);
  const time = date.format('h:mm A');
  if (date.isToday()) return `Today · ${time}`;
  if (date.isYesterday()) return `Yesterday · ${time}`;
  return `${date.format('MMM D')} · ${time}`;
};

type ChannelPostsViewProps = {
  space: CollaborationSpace;
  channel: CollaborationChannel;
  onBack?: () => void;
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const NewPostCard = ({
  channelName,
  submitting,
  mentionUsers,
  mentionUsersLoading,
  onCancel,
  onSubmit,
}: {
  channelName: string;
  submitting: boolean;
  mentionUsers: MentionUser[];
  mentionUsersLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    title: string;
    body: string;
    files: File[];
    mentions: ReturnType<typeof resolveMentionsForPayload>;
  }) => void;
}) => {
  const { userData } = useAuthenticationStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarUrl = userData?.profileImage;
  const canSend =
    Boolean(title.trim() || body.trim() || files.length > 0) && !submitting;

  return (
    <div
      className="mx-auto w-full max-w-2xl rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
      data-cy="announcement-new-post-card"
    >
      <div
        className="mb-3 flex items-start justify-between gap-3"
        data-cy="announcement-new-post-header"
      >
        <div
          className="flex min-w-0 items-center gap-2.5"
          data-cy="announcement-new-post-author"
        >
          <Avatar
            size={32}
            src={avatarUrl || undefined}
            icon={!avatarUrl ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: avatarUrl
                ? undefined
                : collaborationColors.primary,
            }}
          />
          <div className="min-w-0" data-cy="announcement-new-post-context">
            <p
              className="m-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400"
              data-cy="announcement-new-post-label"
            >
              New post
            </p>
            <p
              className="m-0 truncate text-sm font-semibold text-gray-900"
              data-cy="announcement-new-post-channel"
            >
              Post for #{channelName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border-0 bg-transparent p-1 text-gray-400 hover:text-gray-700"
          aria-label="Close new post"
          data-cy="announcement-new-post-close"
        >
          <CloseOutlined />
        </button>
      </div>

      <Input
        placeholder="Add a subject"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="mb-3 !rounded-lg"
        data-cy="announcement-new-post-subject"
      />

      <div
        className="rounded-xl border border-[#E8EDF2] bg-white px-3 py-2.5"
        data-cy="announcement-new-post-body-wrap"
      >
        <ChannelMentionTextArea
          value={body}
          onChange={setBody}
          mentionUsers={mentionUsers}
          mentionUsersLoading={mentionUsersLoading}
          mentionedUserIds={mentionedUserIds}
          onMentionedUserIdsChange={setMentionedUserIds}
          placeholder="Type a message — use @ to mention channel members"
          autoSize={{ minRows: 3, maxRows: 10 }}
          className="!resize-none !border-0 !px-0 !shadow-none focus:!shadow-none"
          dataCy="announcement-new-post-body"
        />
        {files.length > 0 ? (
          <div
            className="mt-2 flex flex-wrap gap-1.5"
            data-cy="announcement-new-post-attachments"
          >
            {files.map((file, index) => (
              <span
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="inline-flex items-center gap-1 rounded-md border border-[#E8EDF2] bg-[#F8FAFB] px-2 py-0.5 text-xs text-gray-600"
                data-cy={`announcement-new-post-attachment-${index}`}
              >
                {file.name}
                <button
                  type="button"
                  className="border-0 bg-transparent p-0 text-gray-400 hover:text-gray-700"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    setFiles((current) =>
                      current.filter(
                        (currentFile, fileIndex) =>
                          Boolean(currentFile) && fileIndex !== index,
                      ),
                    )
                  }
                  data-cy={`announcement-new-post-remove-attachment-${index}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div
          className="mt-2 flex items-center justify-between gap-2"
          data-cy="announcement-new-post-toolbar"
        >
          <div
            className="flex items-center gap-1"
            data-cy="announcement-new-post-toolbar-actions"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const next = Array.from(event.target.files ?? []);
                if (next.length === 0) return;
                setFiles((current) => [...current, ...next]);
                event.target.value = '';
              }}
              data-cy="announcement-new-post-attach-input"
            />
            <Tooltip title="Attach">
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
                aria-label="Attach"
                onClick={() => fileInputRef.current?.click()}
                data-cy="announcement-new-post-attach"
              >
                <BsPaperclip size={16} />
              </button>
            </Tooltip>
            <Tooltip title="Formatting">
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
                aria-label="Formatting"
                data-cy="announcement-new-post-format"
              >
                <BsTypeUnderline size={16} />
              </button>
            </Tooltip>
            <EmojiPickerButton
              onSelect={(emoji) =>
                setBody((current) => `${current}${emoji}`)
              }
              dataCy="announcement-new-post-emoji"
            />
          </div>
          <button
            type="button"
            disabled={!canSend}
            onClick={() =>
              onSubmit({
                title,
                body,
                files,
                mentions: resolveMentionsForPayload(
                  body,
                  mentionedUserIds,
                  mentionUsers,
                ),
              })
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35"
            style={{ color: collaborationColors.primary }}
            aria-label="Send post"
            data-cy="announcement-new-post-send"
          >
            {submitting ? <Spin size="small" /> : <BsSendFill size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReplyRow = ({ reply }: { reply: PostReply }) => (
  <div
    className="flex items-start gap-2.5 py-2"
    data-cy={`announcement-post-reply-item-${reply.id}`}
  >
    <Avatar
      size={24}
      src={reply.authorAvatarUrl || undefined}
      icon={!reply.authorAvatarUrl ? <UserOutlined /> : undefined}
      style={{
        backgroundColor: reply.authorAvatarUrl
          ? undefined
          : collaborationColors.primary,
        flexShrink: 0,
      }}
    />
    <div
      className="min-w-0 flex-1"
      data-cy={`announcement-reply-content-${reply.id}`}
    >
      <p
        className="m-0 text-xs text-gray-400"
        data-cy={`announcement-reply-meta-${reply.id}`}
      >
        <span
          className="font-medium text-gray-700"
          data-cy={`announcement-reply-author-${reply.id}`}
        >
          {reply.authorName}
        </span>
        {' · '}
        {formatPostTimestamp(reply.createdAt)}
      </p>
      <p
        className="m-0 mt-0.5 whitespace-pre-wrap text-sm text-gray-700"
        data-cy={`announcement-reply-body-${reply.id}`}
      >
        {stripHtml(reply.body)}
      </p>
      <MessageAttachments
        attachments={reply.attachments}
        compact
        dataCyPrefix={`announcement-post-reply-${reply.id}`}
      />
      <MessageReactions
        messageId={reply.id}
        initialReactions={reply.reactions}
        dataCyPrefix={`announcement-post-reply-${reply.id}`}
      />
    </div>
  </div>
);

const PostCard = ({
  post,
  channelId,
  memberLookup,
  mentionUsers,
  mentionUsersLoading,
}: {
  post: ChannelPost;
  channelId: string;
  memberLookup: Map<string, SpaceMember>;
  mentionUsers: MentionUser[];
  mentionUsersLoading?: boolean;
}) => {
  const { userData } = useAuthenticationStore();
  const replyMutation = useReplyToCollabMessage();
  const { data: replies = [], isLoading: repliesLoading } = useMessageThread(
    post.id,
    memberLookup,
  );
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const replyFileInputRef = useRef<HTMLInputElement | null>(null);
  const replyAvatar = userData?.profileImage;
  const canSendReply =
    Boolean(replyText.trim() || replyFiles.length > 0) &&
    !replyMutation.isLoading;

  const handleSubmitReply = async () => {
    const content = replyText.trim();
    if (!content && replyFiles.length === 0) return;

    try {
      await replyMutation.mutateAsync({
        parentMessageId: post.id,
        channelId,
        content: content || replyFiles.map((file) => file.name).join(', '),
        files: replyFiles,
        mentions: resolveMentionsForPayload(
          content,
          mentionedUserIds,
          mentionUsers,
        ),
      });
      setReplyText('');
      setReplyFiles([]);
      setMentionedUserIds([]);
    } catch {
      /* mutation toast */
    }
  };

  return (
    <article
      className="rounded-xl border border-[#E8EDF2] bg-white p-4 shadow-none"
      data-cy={`announcement-post-${post.id}`}
    >
      <div
        className="flex items-start gap-3"
        data-cy={`announcement-post-header-${post.id}`}
      >
        <Avatar
          size={40}
          src={post.authorAvatarUrl || undefined}
          icon={!post.authorAvatarUrl ? <UserOutlined /> : undefined}
          style={{
            backgroundColor: post.authorAvatarUrl
              ? undefined
              : collaborationColors.primary,
            flexShrink: 0,
          }}
        />
        <div
          className="min-w-0 flex-1"
          data-cy={`announcement-post-content-${post.id}`}
        >
          {post.title ? (
            <h3
              className="m-0 text-[15px] font-semibold leading-snug"
              style={{ color: collaborationColors.primary }}
              data-cy={`announcement-post-title-${post.id}`}
            >
              {post.title}
            </h3>
          ) : null}
          <p
            className="m-0 mt-0.5 text-xs text-gray-400"
            data-cy={`announcement-post-meta-${post.id}`}
          >
            {post.authorName} · {formatPostTimestamp(post.createdAt)}
          </p>
        </div>
      </div>

      <p
        className="m-0 mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
        data-cy={`announcement-post-body-${post.id}`}
      >
        {stripHtml(post.body)}
      </p>
      <MessageAttachments
        attachments={post.attachments}
        dataCyPrefix={`announcement-post-${post.id}`}
      />

      <div
        className="mt-3 border-t border-[#F0F0F0] pt-2.5"
        data-cy={`announcement-post-reactions-${post.id}`}
      >
        <MessageReactions
          messageId={post.id}
          initialReactions={post.reactions}
          dataCyPrefix={`announcement-post-${post.id}`}
        />
      </div>

      {repliesLoading ? (
        <div
          className="mt-2.5 flex justify-center border-t border-[#F0F0F0] py-3"
          data-cy={`announcement-post-replies-loading-${post.id}`}
        >
          <Spin size="small" />
        </div>
      ) : replies.length > 0 ? (
        <div
          className="mt-2.5 border-t border-[#F0F0F0] pt-1"
          data-cy={`announcement-post-replies-${post.id}`}
        >
          {replies.map((reply) => (
            <ReplyRow key={reply.id} reply={reply} />
          ))}
        </div>
      ) : null}

      <div
        className="mt-2.5 flex items-start gap-2.5 border-t border-[#F0F0F0] pt-3"
        data-cy={`announcement-post-reply-${post.id}`}
      >
        <Avatar
          size={28}
          src={replyAvatar || undefined}
          icon={!replyAvatar ? <UserOutlined /> : undefined}
          style={{
            backgroundColor: replyAvatar
              ? undefined
              : collaborationColors.primary,
            flexShrink: 0,
          }}
        />
        <div
          className="min-w-0 flex-1"
          data-cy={`announcement-reply-composer-${post.id}`}
        >
          {replyFiles.length > 0 ? (
            <div
              className="mb-2 flex flex-wrap gap-1.5"
              data-cy={`announcement-post-reply-pending-attachments-${post.id}`}
            >
              {replyFiles.map((file, index) => (
                <span
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  data-cy={`announcement-post-reply-pending-attachment-${post.id}-${index}`}
                >
                  {file.name}
                  <button
                    type="button"
                    className="border-0 bg-transparent p-0 text-gray-500"
                    onClick={() =>
                      setReplyFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      )
                    }
                    aria-label={`Remove ${file.name}`}
                    data-cy={`announcement-post-reply-remove-attachment-${post.id}-${index}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <input
              ref={replyFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                setReplyFiles((current) => [...current, ...selected]);
                event.target.value = '';
              }}
              data-cy={`announcement-post-reply-file-input-${post.id}`}
            />
            <ChannelMentionTextArea
              singleLine
              value={replyText}
              onChange={setReplyText}
              mentionUsers={mentionUsers}
              mentionUsersLoading={mentionUsersLoading}
              mentionedUserIds={mentionedUserIds}
              onMentionedUserIdsChange={setMentionedUserIds}
              placeholder="Write a reply... use @ to mention"
              disabled={replyMutation.isLoading}
              onPressEnter={() => void handleSubmitReply()}
              className="!rounded-full !border-[#E8EDF2] !bg-white !px-4 !py-1.5 !text-sm placeholder:!text-gray-400"
              dataCy={`announcement-post-reply-input-${post.id}`}
            />
            <EmojiPickerButton
              onSelect={(emoji) =>
                setReplyText((current) => `${current}${emoji}`)
              }
              disabled={replyMutation.isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-500 disabled:opacity-35"
              dataCy={`announcement-post-reply-emoji-${post.id}`}
            />
            <button
              type="button"
              disabled={replyMutation.isLoading}
              onClick={() => replyFileInputRef.current?.click()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-500 disabled:opacity-35"
              aria-label="Attach files to reply"
              data-cy={`announcement-post-reply-attach-${post.id}`}
            >
              <BsPaperclip size={15} />
            </button>
            <button
              type="button"
              disabled={!canSendReply}
              onClick={() => void handleSubmitReply()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent transition disabled:cursor-not-allowed disabled:opacity-35"
              style={{ color: collaborationColors.primary }}
              aria-label="Send reply"
              data-cy={`announcement-post-reply-send-${post.id}`}
            >
              {replyMutation.isLoading ? (
                <Spin size="small" />
              ) : (
                <BsSendFill size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const ChannelPostsView = ({
  space,
  channel,
  onBack,
}: ChannelPostsViewProps) => {
  const memberLookup = useCollaborationMemberLookup();
  const { userId: currentUserId, tenantId } = useAuthenticationStore();
  const queryClient = useQueryClient();
  const createMessage = useCreateCollabMessage();
  const addChannelMembers = useAddCollabChannelMembers();
  const { data: channelPosts = [], isLoading } = useChannelPosts(
    channel.id,
    space.id,
    memberLookup,
  );
  const { data: channelMembers = [], isLoading: channelMembersLoading } =
    useChannelMembers(channel.id, memberLookup);

  const [composerOpen, setComposerOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const canManageMembers = isCollabAdminRole(space.currentUserRole);

  // Public channels inherit the space roster. Private channels expose only
  // users explicitly returned by GET /channel-members.
  const rosterMembers = useMemo(() => {
    const byId = new Map<string, SpaceMember>();
    if (!channel.isPrivate) {
      (space.members ?? []).forEach((member) => byId.set(member.id, member));
    }
    channelMembers.forEach((member) => byId.set(member.id, member));
    return Array.from(byId.values());
  }, [channel.isPrivate, space.members, channelMembers]);

  const mentionUsers = useMemo(
    () => spaceMembersToMentionUsers(rosterMembers, currentUserId),
    [rosterMembers, currentUserId],
  );

  const existingMemberIds = useMemo(
    () => new Set(rosterMembers.map((member) => member.id)),
    [rosterMembers],
  );

  // Public channels add people to the space. Private channels invite anyone
  // not already in that channel, including existing space members.
  const { members: availableOrgMembers, isLoading: orgMembersLoading } =
    useAvailableOrgMembers(existingMemberIds);

  useEffect(() => {
    setComposerOpen(false);
    setAddMemberOpen(false);
  }, [channel.id]);

  const handleAddMembers = async (memberIds: string[]) => {
    const membersQueryKey = getChannelMembersQueryKey(
      tenantId,
      resolveCollabUserId(),
      channel.id,
    );

    let addedIds: string[] = [];
    try {
      // Public channels: POST /space-members only (members join public channels
      // by default). Private channels also get POST /channel-members/bulk.
      addedIds = await addChannelMembers.mutateAsync({
        channelId: channel.id,
        spaceId: space.id,
        isPrivateChannel: Boolean(channel.isPrivate),
        memberIds,
        existingSpaceMemberIds: (space.members ?? []).map(
          (member) => member.id,
        ),
        memberLookup,
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Could not add members',
        description:
          error instanceof Error
            ? error.message
            : 'Check Collaboration permissions and try again.',
      });
      return;
    }

    const confirmedIds = addedIds.length > 0 ? addedIds : memberIds;

    // Seed mention/count caches immediately from API-confirmed ids.
    queryClient.setQueryData<SpaceMember[]>(membersQueryKey, (prev) =>
      mergeChannelMembers(prev, confirmedIds, memberLookup),
    );
    queryClient.setQueriesData(
      collaborationQueryKeys.catalog,
      (prev: CollaborationSpace[] | undefined) =>
        mergeMembersIntoCatalogSpaces(
          prev,
          space.id,
          confirmedIds,
          memberLookup,
        ),
    );

    void queryClient.invalidateQueries(collaborationQueryKeys.catalog);
    void queryClient
      .refetchQueries(membersQueryKey)
      .then(() =>
        queryClient.setQueryData<SpaceMember[]>(membersQueryKey, (prev) =>
          mergeChannelMembers(prev, confirmedIds, memberLookup),
        ),
      )
      .catch(() => {
        /* keep seeded list */
      });

    NotificationMessage.success({
      message: 'Members added',
      description: `${confirmedIds.length} member${
        confirmedIds.length === 1 ? '' : 's'
      } added to ${space.name}${
        channel.isPrivate ? ` / #${channel.name}` : ''
      }.`,
    });
  };

  const handleCreatePost = async (values: {
    title: string;
    body: string;
    files: File[];
    mentions: ReturnType<typeof resolveMentionsForPayload>;
  }) => {
    const title = values.title.trim();
    const body = values.body.trim();
    if (!title && !body && values.files.length === 0) {
      NotificationMessage.warning({
        message: 'Add a subject, message, or attachment',
      });
      return;
    }

    try {
      await createMessage.mutateAsync({
        channelId: channel.id,
        title: title || stripHtml(body).slice(0, 80) || values.files[0]?.name,
        content:
          body || title || values.files.map((file) => file.name).join(', '),
        mentions: values.mentions,
        files: values.files,
      });
      setComposerOpen(false);
      NotificationMessage.success({
        message: 'Post created',
        description: `Your post was published to #${channel.name}.`,
      });
    } catch {
      /* mutation toast */
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col"
      data-cy="announcement-channel-posts"
    >
      <header
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-2.5"
        style={{ background: collaborationColors.surface }}
        data-cy="announcement-channel-topbar"
      >
        <div
          className="flex min-w-0 flex-wrap items-center gap-3"
          data-cy="announcement-channel-identity"
        >
          {onBack ? (
            <button
              type="button"
              className="rounded-md border-0 bg-transparent px-2 py-1 text-sm text-gray-500 md:hidden"
              onClick={onBack}
              data-cy="announcement-channel-back"
            >
              Spaces
            </button>
          ) : null}
          <div
            className="flex min-w-0 items-center gap-2"
            data-cy="announcement-channel-title"
          >
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"
              style={{ color: collaborationColors.primary }}
              data-cy="announcement-channel-icon"
            >
              <MdOutlineCampaign size={16} />
            </span>
            <span
              className="truncate text-base font-semibold text-gray-900"
              data-cy="announcement-channel-topbar-name"
            >
              {channel.name}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2"
          data-cy="announcement-channel-actions"
        >
          <Button
            type="primary"
            onClick={() => setComposerOpen(true)}
            data-cy="announcement-add-post"
          >
            + Add post
          </Button>
          {canManageMembers ? (
            <Tooltip
              title={
                channel.isPrivate
                  ? 'Invite member to private channel'
                  : 'Add member to space'
              }
            >
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={() => setAddMemberOpen(true)}
                aria-label={
                  channel.isPrivate
                    ? 'Invite member to private channel'
                    : 'Add member to space'
                }
                data-cy="announcement-add-member"
              />
            </Tooltip>
          ) : null}
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6"
        data-cy="announcement-channel-feed"
      >
        <div
          className="mx-auto flex w-full max-w-2xl flex-col gap-4"
          data-cy="announcement-channel-feed-content"
        >
          {composerOpen ? (
            <NewPostCard
              channelName={channel.name}
              submitting={createMessage.isLoading}
              mentionUsers={mentionUsers}
              mentionUsersLoading={channelMembersLoading}
              onCancel={() => setComposerOpen(false)}
              onSubmit={(values) => void handleCreatePost(values)}
            />
          ) : null}

          {isLoading ? (
            <div
              className="flex min-h-[220px] items-center justify-center"
              data-cy="announcement-posts-loading"
            >
              <Spin />
            </div>
          ) : null}

          {!isLoading && channelPosts.length === 0 && !composerOpen ? (
            <div
              className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-transparent px-4"
              data-cy="announcement-posts-empty"
            >
              <p
                className="m-0 text-center text-sm text-gray-500"
                data-cy="announcement-posts-empty-text"
              >
                No posts yet. Create a new post.
              </p>
            </div>
          ) : null}

          {!isLoading && channelPosts.length === 0 && composerOpen ? (
            <div
              className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] px-4"
              data-cy="announcement-posts-empty-behind-composer"
            >
              <p
                className="m-0 text-center text-sm text-gray-500"
                data-cy="announcement-posts-empty-composer-text"
              >
                No posts yet. Create a new post.
              </p>
            </div>
          ) : null}

          {channelPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              channelId={channel.id}
              memberLookup={memberLookup}
              mentionUsers={mentionUsers}
              mentionUsersLoading={channelMembersLoading}
            />
          ))}
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
          channel.isPrivate ? (
            <>
              Only invited members can access{' '}
              <strong data-cy="announcement-private-channel-name">
                #{channel.name}
              </strong>
              . People outside{' '}
              <strong data-cy="announcement-private-channel-space-name">
                {space.name}
              </strong>{' '}
              will be added to the space before receiving the private-channel
              invitation.
            </>
          ) : (
            <>
              Add people to{' '}
              <strong data-cy="announcement-public-channel-space-name">
                {space.name}
              </strong>
              . Public channels like{' '}
              <strong data-cy="announcement-public-channel-name">
                #{channel.name}
              </strong>{' '}
              inherit the space roster automatically.
            </>
          )
        }
        members={availableOrgMembers}
        loading={orgMembersLoading}
        emptyText={
          channel.isPrivate
            ? 'All organization employees are already invited to this channel.'
            : 'All organization employees are already members of this space.'
        }
        onClose={() => setAddMemberOpen(false)}
        onAdd={(memberIds) => void handleAddMembers(memberIds)}
      />
    </div>
  );
};

export default ChannelPostsView;
