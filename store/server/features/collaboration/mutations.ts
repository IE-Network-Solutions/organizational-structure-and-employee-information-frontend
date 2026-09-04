import NotificationMessage from '@/components/common/notification/notificationMessage';
import type { SpaceMember } from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useMutation, useQueryClient } from 'react-query';
import {
  COLLAB_URL,
  collabRequest,
  createCollabUploadId,
  getCollabHeaders,
  normalizeCollabEntity,
  normalizeCollabList,
  resolveCollabUserId,
} from './api';
import {
  applyCollabMentionMarkers,
  buildCreateMessagePayload,
  buildReplyMessagePayload,
  isCollabAdminRole,
  sanitizeCollabMentions,
} from './mappers';
import type {
  CollabChannel,
  CollabChannelMember,
  CollabFile,
  CollabMessage,
  CollabMessageReact,
  CollabMappedNotification,
  CollabSpace,
  CreateCollabChannelPayload,
  CreateCollabMessageFilePayload,
  CreateCollabMessagePayload,
  CreateCollabReplyPayload,
  CreateCollabSpacePayload,
  SetCollabMessageReactionPayload,
  UpdateCollabChannelPayload,
  UpdateCollabSpacePayload,
} from './interface';
import { collaborationQueryKeys, fetchCollabSpaceRole } from './queries';

const invalidateCatalog = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries(collaborationQueryKeys.root);
  queryClient.invalidateQueries(collaborationQueryKeys.catalog);
};

const resolveSenderProfile = (payload?: {
  senderDisplayName?: string;
  senderAvatarUrl?: string;
}) => {
  const userId = resolveCollabUserId();
  const { userData } = useAuthenticationStore.getState();
  const displayName =
    payload?.senderDisplayName ||
    [userData?.firstName, userData?.middleName, userData?.lastName]
      .filter(Boolean)
      .join(' ') ||
    userData?.fullName ||
    userData?.email ||
    'You';
  const avatarUrl = payload?.senderAvatarUrl || userData?.profileImage || '';

  return { userId, displayName, avatarUrl };
};

const createSpace = async (payload: CreateCollabSpacePayload) => {
  const userId = resolveCollabUserId();
  if (!userId) {
    throw new Error('Missing Collaboration user id. Please sign in again.');
  }

  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/spaces`,
    method: 'POST',
    data: {
      name: payload.name,
      description: payload.description,
      type: payload.type,
      color: payload.color,
      createdBy: userId,
      // Docs: members added after the creator is added as owner.
      ...(payload.memberIds?.length ? { memberIds: payload.memberIds } : {}),
    },
  });

  const space = normalizeCollabEntity<CollabSpace & Record<string, unknown>>(
    raw,
  );
  const spaceId = String(
    space?.id || (raw as { id?: string })?.id || '',
  ).trim();
  if (!spaceId) {
    throw new Error('Create space did not return a space id');
  }

  return {
    ...(space || {}),
    id: spaceId,
    name: String(space?.name || payload.name || '').trim() || payload.name,
    type: (space?.type as CollabSpace['type']) || payload.type,
    color: String(space?.color || payload.color || '').trim() || payload.color,
    createdBy: String(space?.createdBy || userId),
  } as CollabSpace;
};

const updateSpace = async (
  spaceId: string,
  payload: UpdateCollabSpacePayload,
) => {
  return collabRequest<CollabSpace>({
    url: `${COLLAB_URL}/spaces/${spaceId}`,
    method: 'PATCH',
    data: payload,
  });
};

const createChannel = async (payload: CreateCollabChannelPayload) => {
  const userId = resolveCollabUserId();
  if (!userId) {
    throw new Error('Missing Collaboration user id. Please sign in again.');
  }

  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/channels`,
    method: 'POST',
    data: {
      name: payload.name,
      description: payload.description,
      type: payload.type ?? 'public',
      layout: payload.layout ?? 'posts',
      spaceId: payload.spaceId,
      createdBy: userId,
    },
  });

  const channel = normalizeCollabEntity<
    CollabChannel & Record<string, unknown>
  >(raw);
  const channelId = String(channel?.id || '').trim();
  if (!channel || !channelId) {
    throw new Error('Create channel did not return a channel id');
  }

  return { ...channel, id: channelId } as CollabChannel;
};

const updateChannel = async (
  channelId: string,
  payload: UpdateCollabChannelPayload,
) => {
  return collabRequest<CollabChannel>({
    url: `${COLLAB_URL}/channels/${channelId}`,
    method: 'PATCH',
    data: payload,
  });
};

const markCollabNotificationsRead = async (notificationIds: string[]) => {
  const ids = Array.from(
    new Set(notificationIds.map((id) => String(id).trim()).filter(Boolean)),
  );

  await Promise.all(
    ids.map((id) =>
      collabRequest({
        url: `${COLLAB_URL}/notifications/${id}`,
        method: 'PATCH',
        data: { status: 'read' },
      }),
    ),
  );

  return ids;
};

const uploadCollabFile = async (file: File): Promise<CollabFile> => {
  const userId = resolveCollabUserId();
  const formData = new FormData();
  formData.append('file', file);

  const headers = await getCollabHeaders({
    requestedBy: userId,
    'x-upload-id': createCollabUploadId(),
  });

  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/files/upload`,
    method: 'POST',
    headers,
    data: formData,
  });

  const entity = normalizeCollabEntity<CollabFile & Record<string, unknown>>(
    raw,
  );
  const id = String(entity?.id || '').trim();
  if (!entity || !id) {
    throw new Error('File upload did not return a file id');
  }

  return {
    id,
    uploadedBy: String(entity.uploadedBy || userId),
    fileName: String(entity.fileName || file.name),
    fileUrl: String(entity.fileUrl || ''),
    fileType: String(
      entity.fileType || file.type || 'application/octet-stream',
    ),
    size: String(entity.size || file.size),
    fileView: entity.fileView ? String(entity.fileView) : undefined,
  };
};

const attachCollabMessageFile = async (
  payload: CreateCollabMessageFilePayload,
) => {
  return collabRequest({
    url: `${COLLAB_URL}/message-files`,
    method: 'POST',
    data: {
      messageId: payload.messageId,
      fileId: payload.fileId,
      channelId: payload.channelId,
    },
  });
};

const inferMessageTypeFromFiles = (files: CollabFile[]) => {
  if (files.length === 0) return 'text';
  return files.every((file) =>
    String(file.fileType || '')
      .toLowerCase()
      .startsWith('image/'),
  )
    ? 'image'
    : 'file';
};

const createMessage = async (
  payload: CreateCollabMessagePayload & { title?: string },
) => {
  const { userId, displayName, avatarUrl } = resolveSenderProfile(payload);
  const files = payload.files ?? [];

  const headers = await getCollabHeaders({
    'x-sender-display-name': displayName,
    'x-sender-avatar-url': avatarUrl,
  });

  const uploadedFiles =
    files.length > 0
      ? await Promise.all(files.map((file) => uploadCollabFile(file)))
      : [];

  const mentions = sanitizeCollabMentions(payload.mentions);
  const content = applyCollabMentionMarkers(payload.content, mentions);

  const created = await collabRequest<CollabMessage>({
    url: `${COLLAB_URL}/messages`,
    method: 'POST',
    headers,
    data: buildCreateMessagePayload({
      ...payload,
      content,
      mentions,
      senderId: userId,
      senderDisplayName: displayName,
      senderAvatarUrl: avatarUrl,
      messageType: inferMessageTypeFromFiles(uploadedFiles),
    }),
  });

  const message = normalizeCollabEntity<
    CollabMessage & Record<string, unknown>
  >(created) as CollabMessage | null;
  const messageId = String(message?.id || (created as CollabMessage)?.id || '');

  if (messageId && uploadedFiles.length > 0) {
    await Promise.all(
      uploadedFiles.map((file) =>
        attachCollabMessageFile({
          messageId,
          fileId: file.id,
          channelId: payload.channelId,
        }),
      ),
    );
  }

  return (message ?? created) as CollabMessage;
};

const replyToMessage = async (payload: CreateCollabReplyPayload) => {
  const { userId, displayName, avatarUrl } = resolveSenderProfile(payload);
  const files = payload.files ?? [];

  const headers = await getCollabHeaders({
    'x-sender-display-name': displayName,
    'x-sender-avatar-url': avatarUrl,
  });

  const uploadedFiles =
    files.length > 0
      ? await Promise.all(files.map((file) => uploadCollabFile(file)))
      : [];

  const mentions = sanitizeCollabMentions(payload.mentions);
  const content = applyCollabMentionMarkers(payload.content, mentions);

  const created = await collabRequest<CollabMessage>({
    url: `${COLLAB_URL}/messages/${payload.parentMessageId}/reply`,
    method: 'PATCH',
    headers,
    data: buildReplyMessagePayload({
      channelId: payload.channelId,
      senderId: userId,
      content,
      mentions,
      messageType: inferMessageTypeFromFiles(uploadedFiles),
      senderDisplayName: displayName,
      senderAvatarUrl: avatarUrl,
    }),
  });

  const message = normalizeCollabEntity<
    CollabMessage & Record<string, unknown>
  >(created) as CollabMessage | null;
  const messageId = String(message?.id || (created as CollabMessage)?.id || '');

  if (messageId && uploadedFiles.length > 0) {
    await Promise.all(
      uploadedFiles.map((file) =>
        attachCollabMessageFile({
          messageId,
          fileId: file.id,
          channelId: payload.channelId,
        }),
      ),
    );
  }

  return (message ?? created) as CollabMessage;
};

type MessageReactionMutationResult = {
  action: 'created' | 'updated' | 'removed';
  reaction: CollabMessageReact;
};

const setMessageReaction = async (
  payload: SetCollabMessageReactionPayload,
): Promise<MessageReactionMutationResult> => {
  const reactedBy = resolveCollabUserId();
  if (!reactedBy) {
    throw new Error('Missing Collaboration user id. Please sign in again.');
  }

  const current = payload.currentReaction;
  if (current?.id && current.content === payload.content) {
    await collabRequest({
      url: `${COLLAB_URL}/message-reacts/${current.id}`,
      method: 'DELETE',
    });
    return { action: 'removed', reaction: current };
  }

  if (current?.id) {
    const raw = await collabRequest<unknown>({
      url: `${COLLAB_URL}/message-reacts/${current.id}`,
      method: 'PATCH',
      data: { content: payload.content, status: 'delivered' },
    });
    const updated = normalizeCollabEntity<
      CollabMessageReact & Record<string, unknown>
    >(raw);
    return {
      action: 'updated',
      reaction: {
        ...current,
        ...(updated ?? {}),
        id: String(updated?.id || current.id),
        content: payload.content,
        status: String(updated?.status || 'delivered'),
      },
    };
  }

  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/message-reacts`,
    method: 'POST',
    data: {
      reactedBy,
      messageId: payload.messageId,
      content: payload.content,
      status: 'delivered',
    },
  });
  const created = normalizeCollabEntity<
    CollabMessageReact & Record<string, unknown>
  >(raw);
  const reactionId = String(created?.id || '').trim();
  if (!created || !reactionId) {
    throw new Error('Create reaction did not return a reaction id');
  }

  return {
    action: 'created',
    reaction: {
      ...created,
      id: reactionId,
      reactedBy: String(created.reactedBy || reactedBy),
      messageId: String(created.messageId || payload.messageId),
      content: String(created.content || payload.content),
      status: String(created.status || 'delivered'),
    },
  };
};

const addSpaceMember = async (spaceId: string, memberUserId: string) => {
  return collabRequest({
    url: `${COLLAB_URL}/space-members`,
    method: 'POST',
    data: {
      spaceId,
      userId: memberUserId,
      role: 'member',
    },
  });
};

/**
 * Org employees must be active Collab platform members before
 * POST /space-members succeeds. Sync (not workspace invite) creates/activates
 * membership from the org source — avoids 403 Forbidden on space-members.
 */
const ensureCollabPlatformMember = async (memberUserId: string) => {
  return collabRequest({
    url: `${COLLAB_URL}/user-role/sync`,
    method: 'POST',
    data: {
      userId: memberUserId,
      active: true,
    },
  });
};

const getCollabErrorStatus = (reason: unknown) =>
  (reason as { response?: { status?: number } })?.response?.status ??
  (reason as { status?: number })?.status;

const getCollabErrorMessage = (reason: unknown) => {
  const data = (reason as { response?: { data?: unknown } })?.response?.data;
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const body = data as Record<string, unknown>;
    return String(
      body.message ||
        body.error ||
        (Array.isArray(body.message) ? body.message.join(', ') : '') ||
        '',
    );
  }
  return '';
};

/** The API makes the creator owner; owner and admin can manage membership. */
const assertCurrentUserCanManageSpace = async (spaceId: string) => {
  const role = await fetchCollabSpaceRole(spaceId);
  if (!isCollabAdminRole(role)) {
    throw new Error('Only a space owner or admin can add members.');
  }
};

/** POST /space-members for each user. Syncs platform membership first. */
const addSpaceMembers = async (
  spaceId: string,
  memberUserIds: string[],
  authorizationChecked = false,
) => {
  if (!authorizationChecked) {
    await assertCurrentUserCanManageSpace(spaceId);
  }

  const results = await Promise.allSettled(
    memberUserIds.map(async (memberId) => {
      try {
        await ensureCollabPlatformMember(memberId);
      } catch {
        // Sync may 403 if caller can't manage platform roles; still try
        // space-members in case the user is already active.
      }
      return addSpaceMember(spaceId, memberId);
    }),
  );

  const isAlreadyMemberError = (reason: unknown) => {
    const status = getCollabErrorStatus(reason);
    const message = getCollabErrorMessage(reason).toLowerCase();
    return (
      status === 409 ||
      (status === 400 && /already|exists|duplicate/.test(message))
    );
  };

  const hardFailures = results.filter(
    (result) =>
      result.status === 'rejected' && !isAlreadyMemberError(result.reason),
  );

  if (hardFailures.length > 0) {
    const reason = (hardFailures[0] as PromiseRejectedResult).reason;
    const status = getCollabErrorStatus(reason);
    const apiMessage = getCollabErrorMessage(reason);
    if (status === 403) {
      throw new Error(
        apiMessage ||
          'Only the space admin (usually the creator) can add members. Create the space yourself, or ask the admin to add people.',
      );
    }
    throw new Error(
      apiMessage ||
        `Could not add ${hardFailures.length} of ${memberUserIds.length} selected member${
          hardFailures.length === 1 ? '' : 's'
        }.`,
    );
  }

  return memberUserIds;
};

const addChannelMembersBulk = async (
  channelId: string,
  memberUserIds: string[],
) => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/channel-members/bulk`,
    method: 'POST',
    data: {
      channelId,
      members: memberUserIds.map((userId) => ({
        userId,
        role: 'member',
      })),
    },
  });
  return normalizeCollabList<CollabChannelMember & Record<string, unknown>>(
    raw,
  );
};

export const useCreateCollabSpace = () => {
  const queryClient = useQueryClient();
  return useMutation(createSpace, {
    onSuccess: () => {
      // Don't await — a catalog mapper error must not fail space create.
      void queryClient
        .invalidateQueries(collaborationQueryKeys.catalog)
        .catch(() => undefined);
    },
    onError: (error: unknown) => {
      NotificationMessage.error({
        message: 'Could not create space',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });
};

export const useUpdateCollabSpace = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ spaceId, data }: { spaceId: string; data: UpdateCollabSpacePayload }) =>
      updateSpace(spaceId, data),
    {
      onSuccess: () => invalidateCatalog(queryClient),
      onError: () => {
        NotificationMessage.error({
          message: 'Could not update space',
        });
      },
    },
  );
};

export const useCreateCollabChannel = () => {
  const queryClient = useQueryClient();
  return useMutation(createChannel, {
    onSuccess: () => {
      void queryClient
        .invalidateQueries(collaborationQueryKeys.catalog)
        .catch(() => undefined);
    },
    onError: (error: unknown) => {
      NotificationMessage.error({
        message: 'Could not create channel',
        description:
          error instanceof Error
            ? error.message
            : 'The channel name may already exist.',
      });
    },
  });
};

export const useUpdateCollabChannel = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      channelId,
      data,
    }: {
      channelId: string;
      data: UpdateCollabChannelPayload;
    }) => updateChannel(channelId, data),
    {
      onSuccess: () => invalidateCatalog(queryClient),
      onError: () => {
        NotificationMessage.error({
          message: 'Could not update channel',
        });
      },
    },
  );
};

export const useCreateCollabMessage = () => {
  const queryClient = useQueryClient();
  return useMutation(createMessage, {
    onSuccess: (mutationResult, variables) => {
      void mutationResult;
      queryClient.invalidateQueries(collaborationQueryKeys.posts);
      queryClient.invalidateQueries([
        ...collaborationQueryKeys.posts,
        variables.channelId,
      ]);
      queryClient.invalidateQueries([
        ...collaborationQueryKeys.conversations,
        variables.channelId,
      ]);
      queryClient.invalidateQueries(collaborationQueryKeys.notifications);
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Could not post message',
        description: 'Check mentions, attachments, and try again.',
      });
    },
  });
};

export const useReplyToCollabMessage = () => {
  const queryClient = useQueryClient();
  return useMutation(replyToMessage, {
    onSuccess: (mutationResult, variables) => {
      void mutationResult;
      queryClient.invalidateQueries([
        ...collaborationQueryKeys.thread,
        variables.parentMessageId,
      ]);
      queryClient.invalidateQueries(collaborationQueryKeys.thread);
      queryClient.invalidateQueries(collaborationQueryKeys.conversations);
      queryClient.invalidateQueries(collaborationQueryKeys.notifications);
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Could not send reply',
        description: 'Please try again.',
      });
    },
  });
};

export const useSetCollabMessageReaction = () => {
  const queryClient = useQueryClient();
  return useMutation(setMessageReaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(collaborationQueryKeys.reactions);
      queryClient.invalidateQueries(collaborationQueryKeys.posts);
      queryClient.invalidateQueries(collaborationQueryKeys.conversations);
      queryClient.invalidateQueries(collaborationQueryKeys.thread);
    },
    onError: (error: unknown) => {
      NotificationMessage.error({
        message: 'Could not update reaction',
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    },
  });
};

export const useMarkCollabMentionsRead = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ notificationIds }: { notificationIds: string[] }) =>
      markCollabNotificationsRead(notificationIds),
    {
      onSuccess: (notificationIds) => {
        const readIds = new Set(notificationIds);
        queryClient.setQueriesData<CollabMappedNotification[]>(
          collaborationQueryKeys.mentionNotifications,
          (notifications) =>
            notifications?.filter(
              (notification) => !readIds.has(notification.notificationId),
            ),
        );
        void queryClient.invalidateQueries(
          collaborationQueryKeys.mentionNotifications,
        );
        void queryClient.invalidateQueries(
          collaborationQueryKeys.notifications,
        );
      },
    },
  );
};

export const useAddCollabSpaceMembers = () => {
  return useMutation(
    ({ spaceId, memberIds }: { spaceId: string; memberIds: string[] }) =>
      addSpaceMembers(spaceId, memberIds),
    {
      retry: false,
    },
  );
};

/**
 * Add people for channel collaboration:
 * - Add only non-space users through POST /space-members.
 * - Public channels inherit the resulting space roster.
 * - Private channels also invite the selected users through /channel-members/bulk.
 */
export const useAddCollabChannelMembers = () => {
  return useMutation(
    async ({
      channelId,
      spaceId,
      isPrivateChannel,
      memberIds,
      existingSpaceMemberIds = [],
    }: {
      channelId: string;
      spaceId: string;
      isPrivateChannel?: boolean;
      memberIds: string[];
      existingSpaceMemberIds?: string[];
      memberLookup?: Map<string, SpaceMember>;
    }) => {
      await assertCurrentUserCanManageSpace(spaceId);
      const spaceMemberIds = new Set(existingSpaceMemberIds);
      const membersToAddToSpace = memberIds.filter(
        (memberId) => !spaceMemberIds.has(memberId),
      );

      if (membersToAddToSpace.length > 0) {
        await addSpaceMembers(spaceId, membersToAddToSpace, true);
      }

      if (isPrivateChannel) {
        await addChannelMembersBulk(channelId, memberIds);
      }

      return memberIds;
    },
    {
      retry: false,
    },
  );
};
