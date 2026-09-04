export type CollabSpaceType = 'public' | 'private';
export type CollabChannelType = 'public' | 'private' | 'dm' | 'group_dm';
export type CollabChannelLayout = 'threads' | 'posts';
export type CollabMembershipRole = 'owner' | 'admin' | 'member' | 'guest';

export type CollabSpace = {
  id: string;
  name: string;
  description?: string | null;
  type: CollabSpaceType | string;
  color?: string | null;
  createdBy?: string;
  isDefault?: boolean;
  currentUserRole?: CollabMembershipRole | string | null;
  channels?: CollabChannel[];
  members?: CollabSpaceMember[];
};

export type CollabChannel = {
  id: string;
  name: string;
  description?: string | null;
  type: CollabChannelType | string;
  layout: CollabChannelLayout | string;
  spaceId?: string | null;
  teamId?: string | null;
  createdBy?: string;
};

export type CollabSpaceMember = {
  id?: string;
  spaceId: string;
  userId: string;
  role: string;
  joinedAt?: string;
};

export type CollabChannelMember = {
  id?: string;
  channelId: string;
  userId: string;
  role: string;
};

export type CollabMessageMention = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  position?: string;
};

export type CollabMessage = {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  caption?: string | null;
  messageType?: string;
  status?: string;
  type?: string;
  mentions?: CollabMessageMention[];
  createdAt?: string;
  updatedAt?: string;
  threadReplies?: CollabMessage[];
  parentMessageId?: string | null;
  messageFiles?: CollabMessageFile[];
  reacts?: CollabMessageReact[];
};

export type CollabMessageReact = {
  id: string;
  reactedBy: string;
  messageId: string;
  content: string;
  status: string;
  createdAt?: string;
};

export type SetCollabMessageReactionPayload = {
  messageId: string;
  content: string;
  currentReaction?: CollabMessageReact | null;
};

export type CollabFile = {
  id: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  size: string;
  fileView?: string | null;
};

export type CollabMessageFile = {
  messageId: string;
  fileId: string;
  channelId: string;
  file?: CollabFile | null;
};

export type CreateCollabMessageFilePayload = {
  messageId: string;
  fileId: string;
  channelId: string;
};

export type CreateCollabMessagePayload = {
  channelId: string;
  content: string;
  mentions?: CollabMessageMention[];
  files?: File[];
  senderDisplayName?: string;
  senderAvatarUrl?: string;
};

export type CreateCollabReplyPayload = {
  parentMessageId: string;
  channelId: string;
  content: string;
  mentions?: CollabMessageMention[];
  files?: File[];
  senderDisplayName?: string;
  senderAvatarUrl?: string;
};

export type CreateCollabSpacePayload = {
  name: string;
  description?: string;
  type: CollabSpaceType;
  color: string;
  memberIds?: string[];
};

export type CreateCollabChannelPayload = {
  spaceId: string;
  name: string;
  description?: string;
  type?: CollabChannelType;
  layout?: CollabChannelLayout;
};

export type UpdateCollabSpacePayload = {
  name?: string;
  description?: string;
  type?: CollabSpaceType;
  color?: string;
};

export type UpdateCollabChannelPayload = {
  name?: string;
  description?: string;
};

export type CollabPerson = {
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  position?: string;
};

/** POST /workspace-members/invite — docs: invite to a space + selected channels. */
export type InviteWorkspaceMemberPayload = {
  userId: string;
  spaceId: string;
  channelIds: string[];
  firebaseId?: string;
  departmentId?: string;
};

export type CollabNotificationPayload = {
  type?: unknown;
  actorId?: string | null;
  data?: Record<string, unknown>;
  groupKey?: string | null;
  createdAt?: string;
};

export type CollabUserNotification = {
  id?: string;
  notificationId?: string;
  userId?: string;
  type?: unknown;
  status?: unknown;
  aggregateUnreadCount?: number;
  readAt?: string | null;
  seenAt?: string | null;
  data?: Record<string, unknown>;
  actorId?: string | null;
  createdAt?: string;
  notification?: CollabNotificationPayload | null;
};

export type CollabMappedNotification = {
  id: string;
  notificationId: string;
  kind: 'mention' | 'reply' | 'announcement';
  actorName: string;
  actorAvatarUrl?: string;
  spaceName: string;
  preview: string;
  createdAt: string;
  unread: boolean;
  channelId?: string;
  spaceId?: string;
  messageId?: string;
  parentMessageId?: string;
};

export type CollabPaginated<T> = {
  items: T[];
  meta?: {
    totalItems?: number;
    itemCount?: number;
    totalPages?: number;
    currentPage?: number;
    page?: number;
    limit?: number;
  };
};
