'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Input, Spin, Tooltip } from 'antd';
import {
  CloseOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  BsEmojiSmile,
  BsPaperclip,
  BsSendFill,
  BsTypeUnderline,
} from 'react-icons/bs';
import { MdOutlineCampaign } from 'react-icons/md';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useAnnouncementChannelsStore,
  type ChannelPost,
} from '@/store/uistate/features/organizationStructure/announcementChannels';
import type {
  CollaborationChannel,
  CollaborationSpace,
} from './mockAnnouncementService';
import AddMembersModal from './AddMembersModal';
import { collaborationColors } from './collaborationColors';

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
  onCancel,
  onSubmit,
}: {
  channelName: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (values: { title: string; body: string }) => void;
}) => {
  const { userData } = useAuthenticationStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const authorName =
    userData?.firstName || userData?.fullName || userData?.email || 'You';
  const avatarUrl = userData?.profileImage;

  const canSend = Boolean(title.trim() || body.trim()) && !submitting;

  return (
    <div
      className="mx-auto w-full max-w-2xl rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
      data-cy="announcement-new-post-card"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
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
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              New post
            </p>
            <p className="m-0 truncate text-sm font-semibold text-gray-900">
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
        <Input.TextArea
          placeholder="Type a message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          autoSize={{ minRows: 3, maxRows: 10 }}
          className="!resize-none !border-0 !px-0 !shadow-none focus:!shadow-none"
          data-cy="announcement-new-post-body"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Tooltip title="Attach">
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
                aria-label="Attach"
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
            <Tooltip title="Emoji">
              <button
                type="button"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
                aria-label="Emoji"
                data-cy="announcement-new-post-emoji"
              >
                <BsEmojiSmile size={16} />
              </button>
            </Tooltip>
          </div>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => onSubmit({ title, body })}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35"
            style={{ color: collaborationColors.primary }}
            aria-label="Send post"
            data-cy="announcement-new-post-send"
          >
            {submitting ? <Spin size="small" /> : <BsSendFill size={18} />}
          </button>
        </div>
      </div>
      <span className="sr-only">{authorName}</span>
    </div>
  );
};

const PostCard = ({ post }: { post: ChannelPost }) => {
  const { userData } = useAuthenticationStore();
  const replyAvatar = userData?.profileImage || post.authorAvatarUrl;

  return (
    <article
      className="rounded-xl border border-[#E8EDF2] bg-white p-4 shadow-none"
      data-cy={`announcement-post-${post.id}`}
    >
      <div className="flex items-start gap-3">
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
        <div className="min-w-0 flex-1">
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

      <div
        className="mt-3 border-t border-[#F0F0F0] pt-2.5"
        data-cy={`announcement-post-reactions-${post.id}`}
      >
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E8EDF2] bg-transparent text-gray-400 transition hover:border-gray-300 hover:text-gray-600"
          aria-label="Add reaction"
          data-cy={`announcement-post-react-${post.id}`}
        >
          <BsEmojiSmile size={14} />
        </button>
      </div>

      <div
        className="mt-2.5 flex items-center gap-2.5 border-t border-[#F0F0F0] pt-3"
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
        <Input
          placeholder="Write a reply..."
          className="!rounded-full !border-[#E8EDF2] !bg-white !px-4 !py-1.5 !text-sm placeholder:!text-gray-400"
          data-cy={`announcement-post-reply-input-${post.id}`}
        />
      </div>
    </article>
  );
};

const ChannelPostsView = ({
  space,
  channel,
  onBack,
}: ChannelPostsViewProps) => {
  const { userData } = useAuthenticationStore();
  const posts = useAnnouncementChannelsStore((state) => state.posts);
  const channelMemberIds = useAnnouncementChannelsStore(
    (state) => state.channelMemberIds,
  );
  const addPost = useAnnouncementChannelsStore((state) => state.addPost);
  const addChannelMembers = useAnnouncementChannelsStore(
    (state) => state.addChannelMembers,
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const channelPosts = useMemo(
    () => posts.filter((post) => post.channelId === channel.id),
    [posts, channel.id],
  );

  const addedMemberIds = channelMemberIds[channel.id] ?? [];

  const availableSpaceMembers = useMemo(
    () =>
      (space.members ?? []).filter(
        (member) => !addedMemberIds.includes(member.id),
      ),
    [space.members, addedMemberIds],
  );

  useEffect(() => {
    setComposerOpen(false);
    setSubmitting(false);
    setAddMemberOpen(false);
  }, [channel.id]);

  const handleAddMembers = (memberIds: string[]) => {
    addChannelMembers(channel.id, memberIds);
    NotificationMessage.success({
      message: 'Members added',
      description: `${memberIds.length} member${
        memberIds.length === 1 ? '' : 's'
      } added to #${channel.name}.`,
    });
  };

  const handleCreatePost = (values: { title: string; body: string }) => {
    const title = values.title.trim();
    const body = values.body.trim();
    if (!title && !body) {
      NotificationMessage.warning({
        message: 'Add a subject or message',
      });
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      addPost({
        spaceId: space.id,
        channelId: channel.id,
        title: title || stripHtml(body).slice(0, 80),
        body: body || title,
        authorName:
          [userData?.firstName, userData?.middleName, userData?.lastName]
            .filter(Boolean)
            .join(' ') ||
          userData?.fullName ||
          userData?.email ||
          'You',
        authorAvatarUrl: userData?.profileImage,
      });
      setSubmitting(false);
      setComposerOpen(false);
      NotificationMessage.success({
        message: 'Post created',
        description: `Your post was published to #${channel.name}.`,
      });
    }, 400);
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
        <div className="flex min-w-0 flex-wrap items-center gap-3">
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
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"
              style={{
                color: collaborationColors.primary,
              }}
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

        <div className="flex items-center gap-2">
          <Button
            type="primary"
            onClick={() => setComposerOpen(true)}
            data-cy="announcement-add-post"
          >
            + Add post
          </Button>
          <Tooltip title="Add member">
            <Button
              type="default"
              icon={<UserAddOutlined />}
              onClick={() => setAddMemberOpen(true)}
              aria-label="Add member"
              data-cy="announcement-add-member"
            />
          </Tooltip>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-6"
        data-cy="announcement-channel-feed"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {composerOpen ? (
            <NewPostCard
              channelName={channel.name}
              submitting={submitting}
              onCancel={() => setComposerOpen(false)}
              onSubmit={handleCreatePost}
            />
          ) : null}

          {channelPosts.length === 0 && !composerOpen ? (
            <div
              className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-transparent px-4"
              data-cy="announcement-posts-empty"
            >
              <p className="m-0 text-center text-sm text-gray-500">
                No posts yet. Create a new post.
              </p>
            </div>
          ) : null}

          {channelPosts.length === 0 && composerOpen ? (
            <div
              className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] px-4"
              data-cy="announcement-posts-empty-behind-composer"
            >
              <p className="m-0 text-center text-sm text-gray-500">
                No posts yet. Create a new post.
              </p>
            </div>
          ) : null}

          {channelPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <AddMembersModal
        open={addMemberOpen}
        title={`Add members to #${channel.name}`}
        description={
          <>
            Choose members from <strong>{space.name}</strong> to add to this
            channel.
          </>
        }
        members={availableSpaceMembers}
        emptyText="All space members are already on this channel."
        onClose={() => setAddMemberOpen(false)}
        onAdd={handleAddMembers}
      />
    </div>
  );
};

export default ChannelPostsView;
