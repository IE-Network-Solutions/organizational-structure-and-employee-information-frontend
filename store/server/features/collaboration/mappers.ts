import type {
  CollaborationChannel,
  CollaborationChannelKind,
  CollaborationSpace,
  SpaceMember,
} from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import type {
  ChannelPost,
  PostReply,
} from '@/store/uistate/features/organizationStructure/announcementChannels';
import type {
  CollabChannel,
  CollabFile,
  CollabMappedNotification,
  CollabMessage,
  CollabSpace,
  CollabSpaceMember,
  CollabUserNotification,
  CreateCollabMessagePayload,
} from './interface';

export const getCollabMessageAttachments = (
  message?: Pick<CollabMessage, 'messageFiles'> | null,
): CollabFile[] =>
  (message?.messageFiles ?? [])
    .map((messageFile) => {
      if (!messageFile?.file) return null;
      const id = String(messageFile.file.id || messageFile.fileId || '').trim();
      if (!id) return null;
      return { ...messageFile.file, id };
    })
    .filter((file): file is CollabFile => Boolean(file));

const ANNOUNCEMENT_CHANNEL_NAMES = new Set([
  'announcements',
  'announcement',
  'all-hands',
]);

export const inferChannelKind = (
  channel: Pick<CollabChannel, 'name' | 'layout'>,
): CollaborationChannelKind => {
  const normalizedName = String(channel.name || '')
    .trim()
    .toLowerCase();
  if (ANNOUNCEMENT_CHANNEL_NAMES.has(normalizedName)) return 'announcements';
  if (channel.layout === 'posts') return 'announcements';
  if (normalizedName === 'general') return 'general';
  return 'channel';
};

export const mapCollabChannel = (
  channel: CollabChannel,
): CollaborationChannel => ({
  id: String(channel.id || ''),
  name: String(channel.name || 'untitled'),
  kind: inferChannelKind(channel),
  description: channel.description?.trim() || undefined,
  channelType: channel.layout === 'threads' ? 'threads' : 'posts',
  isPrivate: channel.type === 'private',
});

export const mapCollabSpaceMember = (
  member: CollabSpaceMember,
  lookup?: Map<string, SpaceMember>,
): SpaceMember => {
  const userId = String(member.userId || '').trim();
  const fromLookup = userId ? lookup?.get(userId) : undefined;
  if (fromLookup) return { ...fromLookup };

  return {
    id: userId || String(member.id || ''),
    name: userId || 'Unknown user',
  };
};

export const mapCollabSpace = (
  space: CollabSpace,
  channels: CollabChannel[] = space.channels ?? [],
  members: CollabSpaceMember[] = space.members ?? [],
  memberLookup?: Map<string, SpaceMember>,
  currentUserRole: string | null = space.currentUserRole ?? null,
): CollaborationSpace => {
  const mappedMembers = members
    .map((member) => mapCollabSpaceMember(member, memberLookup))
    .filter((member) => Boolean(member.id));

  return {
    id: String(space.id || ''),
    name: String(space.name || 'Untitled space'),
    color: String(space.color || '').trim() || '#3B82F6',
    subtitle: `${mappedMembers.length} member${mappedMembers.length === 1 ? '' : 's'}`,
    description: space.description?.trim() || undefined,
    memberCount: mappedMembers.length,
    isPrivate: space.type === 'private',
    currentUserRole,
    members: mappedMembers,
    channels: channels
      .filter((channel) => Boolean(channel?.id))
      .map(mapCollabChannel),
  };
};

export const isCollabAdminRole = (role?: string | null) => {
  const normalizedRole = String(role || '')
    .trim()
    .toLowerCase();
  return normalizedRole === 'owner' || normalizedRole === 'admin';
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractPostTitle = (content: string): { title: string; body: string } => {
  const headingMatch = content.match(/^<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  if (headingMatch) {
    const title = stripHtml(headingMatch[1]);
    const body = content.slice(headingMatch[0].length).trim();
    return {
      title,
      body: body || title,
    };
  }

  const plain = stripHtml(content);
  if (!plain) return { title: '', body: content };
  if (plain.length <= 80) return { title: plain, body: content };
  return {
    title: `${plain.slice(0, 77)}...`,
    body: content,
  };
};

export const mapCollabMessageToPost = (
  message: CollabMessage,
  spaceId: string,
  authorLookup?: Map<string, SpaceMember>,
): ChannelPost => {
  const author = authorLookup?.get(message.senderId);
  const { title, body } = extractPostTitle(message.content);

  return {
    id: message.id,
    spaceId,
    channelId: message.channelId,
    title,
    body,
    authorName: author?.name || 'Unknown user',
    authorAvatarUrl: author?.avatarUrl,
    createdAt: message.createdAt || new Date().toISOString(),
    attachments: getCollabMessageAttachments(message),
    reactions: message.reacts,
  };
};

export const mapCollabMessageToReply = (
  message: CollabMessage,
  authorLookup?: Map<string, SpaceMember>,
): PostReply => {
  const author = authorLookup?.get(message.senderId);

  return {
    id: message.id,
    body: message.content,
    authorName: author?.name || 'Unknown user',
    authorAvatarUrl: author?.avatarUrl,
    createdAt: message.createdAt || new Date().toISOString(),
    attachments: getCollabMessageAttachments(message),
    reactions: message.reacts,
  };
};

export const buildCreateMessagePayload = (
  input: CreateCollabMessagePayload & {
    senderId: string;
    title?: string;
    messageType?: string;
  },
) => {
  const title = input.title?.trim();
  const content = title
    ? `<h2>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>${input.content}`
    : input.content;

  return {
    channelId: input.channelId,
    senderId: input.senderId,
    content,
    messageType: input.messageType || 'text',
    status: 'created',
    type: 'public',
    messages: [] as unknown[],
    mentions: input.mentions ?? [],
    senderDisplayName: input.senderDisplayName,
    senderAvatarUrl: input.senderAvatarUrl,
  };
};

export const buildReplyMessagePayload = (input: {
  channelId: string;
  senderId: string;
  content: string;
  mentions?: CollabMessage['mentions'];
  messageType?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
}) => ({
  channelId: input.channelId,
  senderId: input.senderId,
  content: input.content,
  messageType: input.messageType || 'text',
  status: 'created',
  type: 'public',
  message: [] as unknown[],
  mentions: input.mentions ?? [],
  senderDisplayName: input.senderDisplayName,
  senderAvatarUrl: input.senderAvatarUrl,
});

/** Embed <@userId> markers Collab uses when resolving mention notifications. */
export const applyCollabMentionMarkers = (
  content: string,
  mentions: Array<{ userId: string; displayName?: string }> = [],
) => {
  let next = content || '';
  mentions.forEach((mention) => {
    const userId = String(mention.userId || '').trim();
    if (!userId) return;
    const marker = `<@${userId}>`;
    if (next.includes(marker)) return;

    const token = mention.displayName
      ? `@${mention.displayName.trim().replace(/\s+/g, '')}`
      : '';
    if (token && next.includes(token)) {
      next = next.replace(token, `${marker}${token}`);
      return;
    }
    next = `${next}${marker}`;
  });
  return next;
};

export const sanitizeCollabMentions = (
  mentions: Array<{
    userId: string;
    displayName?: string;
    avatarUrl?: string;
    position?: string;
  }> = [],
) =>
  mentions
    .map((mention) => {
      const userId = String(mention.userId || '').trim();
      if (!userId) return null;
      const payload: {
        userId: string;
        displayName?: string;
        avatarUrl?: string;
        position?: string;
      } = { userId };
      if (mention.displayName?.trim()) {
        payload.displayName = mention.displayName.trim();
      }
      if (mention.avatarUrl?.trim()) {
        payload.avatarUrl = mention.avatarUrl.trim();
      }
      if (mention.position?.trim()) {
        payload.position = mention.position.trim();
      }
      return payload;
    })
    .filter((mention): mention is NonNullable<typeof mention> =>
      Boolean(mention),
    );

export const mapCollabNotification = (
  item: CollabUserNotification,
): CollabMappedNotification => {
  const nestedNotification = item.notification ?? undefined;
  const data = nestedNotification?.data ?? item.data ?? {};
  const asRecord = (value: unknown) =>
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : undefined;
  const nestedString = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value).trim();
    }
    const record = asRecord(value);
    if (!record) return '';
    return String(
      record.type ??
        record.name ??
        record.value ??
        record.code ??
        record.status ??
        '',
    ).trim();
  };
  const nestedId = (value: unknown) => {
    const record = asRecord(value);
    return record ? String(record.id ?? record.channelId ?? '').trim() : '';
  };

  const type = nestedString(
    nestedNotification?.type ?? item.type ?? data.type,
  ).toLowerCase();
  const kind: 'mention' | 'reply' | 'announcement' = type.includes('mention')
    ? 'mention'
    : type.includes('reply')
      ? 'reply'
      : 'announcement';

  const actorAvatarUrl = String(
    data.actorAvatarUrl ?? data.senderAvatarUrl ?? data.avatarUrl ?? '',
  ).trim();
  const notificationId = String(item.id || item.notificationId || '').trim();
  const status = nestedString(item.status).toLowerCase();
  const channelId = String(
    data.channelId ?? nestedId(data.channel) ?? '',
  ).trim();
  const spaceId = String(data.spaceId ?? nestedId(data.space) ?? '').trim();
  const messageId = String(
    data.messageId ?? nestedId(data.messageData) ?? '',
  ).trim();
  const parentMessageId = String(data.parentMessageId ?? '').trim();

  return {
    id:
      notificationId ||
      `notif-${item.createdAt ?? nestedNotification?.createdAt ?? Date.now()}`,
    notificationId,
    kind,
    actorName: String(data.actorName ?? data.senderName ?? 'Someone'),
    actorAvatarUrl: actorAvatarUrl || undefined,
    spaceName: String(data.spaceName ?? data.channelName ?? 'Collaboration'),
    preview: String(data.preview ?? data.content ?? data.message ?? ''),
    createdAt: String(
      item.createdAt ?? nestedNotification?.createdAt ?? new Date().toISOString(),
    ),
    unread: !item.readAt && status !== 'read',
    channelId: channelId || undefined,
    spaceId: spaceId || undefined,
    messageId: messageId || undefined,
    parentMessageId: parentMessageId || undefined,
  };
};
