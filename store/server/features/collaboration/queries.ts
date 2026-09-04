import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { SpaceMember } from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import type { CollaborationSpace } from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import { useQuery } from 'react-query';
import {
  COLLAB_URL,
  collabRequest,
  normalizeCollabList,
  resolveCollabUserId,
} from './api';
import {
  mapCollabMessageToPost,
  mapCollabMessageToReply,
  mapCollabNotification,
  mapCollabSpace,
} from './mappers';
import type {
  CollabChannel,
  CollabChannelMember,
  CollabMessage,
  CollabMessageReact,
  CollabPerson,
  CollabSpace,
  CollabSpaceMember,
  CollabUserNotification,
} from './interface';

const COLLAB_QUERY_KEY = 'collaboration';

export const getChannelMembersQueryKey = (
  tenantId?: string | null,
  userId?: string | null,
  channelId?: string | null,
) =>
  [COLLAB_QUERY_KEY, 'channel-members', tenantId, userId, channelId] as const;

export const mergeChannelMembers = (
  prev: SpaceMember[] | undefined,
  memberIds: string[],
  memberLookup?: Map<string, SpaceMember>,
): SpaceMember[] => {
  const byId = new Map((prev ?? []).map((member) => [member.id, member]));

  memberIds.forEach((id) => {
    byId.set(id, memberLookup?.get(id) ?? byId.get(id) ?? { id, name: id });
  });

  return Array.from(byId.values());
};

/** Optimistically append members onto a space in the catalog cache. */
export const mergeMembersIntoCatalogSpaces = (
  spaces: CollaborationSpace[] | undefined,
  spaceId: string,
  memberIds: string[],
  memberLookup?: Map<string, SpaceMember>,
): CollaborationSpace[] => {
  if (!spaces) return [];

  return spaces.map((space) => {
    if (space.id !== spaceId) return space;
    const members = mergeChannelMembers(space.members, memberIds, memberLookup);
    return {
      ...space,
      members,
      memberCount: members.length,
      subtitle: `${members.length} member${members.length === 1 ? '' : 's'}`,
    };
  });
};

export const bootstrapCollaborationSession = async () => {
  return collabRequest({
    url: `${COLLAB_URL}/auth/session/bootstrap`,
    method: 'POST',
  });
};

const fetchSpaces = async (): Promise<CollabSpace[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/spaces`,
    method: 'GET',
  });
  return normalizeCollabList<CollabSpace>(raw);
};

const fetchChannelsForSpace = async (
  spaceId: string,
): Promise<CollabChannel[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/channels`,
    method: 'GET',
    params: { spaceId },
  });
  return normalizeCollabList<CollabChannel>(raw);
};

const fetchSpaceMembers = async (
  spaceId: string,
): Promise<CollabSpaceMember[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/space-members`,
    method: 'GET',
    params: { spaceId, limit: 200 },
  });
  return normalizeCollabList<CollabSpaceMember>(raw);
};

export const fetchCollabSpaceRole = async (
  spaceId: string,
): Promise<string | null> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/spaces/${spaceId}/my-role`,
    method: 'GET',
  });
  if (!raw || typeof raw !== 'object') return null;

  const body = raw as Record<string, unknown>;
  const data =
    body.data && typeof body.data === 'object'
      ? (body.data as Record<string, unknown>)
      : null;
  const membership =
    body.membership && typeof body.membership === 'object'
      ? (body.membership as Record<string, unknown>)
      : null;

  const role = body.role ?? data?.role ?? membership?.role;
  return role ? String(role).trim().toLowerCase() : null;
};

export const fetchCollaborationCatalog = async (
  memberLookup?: Map<string, SpaceMember>,
) => {
  const spaces = await fetchSpaces();
  const enriched = await Promise.all(
    spaces.map(async (space) => {
      const [channels, members, currentUserRole] = await Promise.all([
        fetchChannelsForSpace(space.id),
        fetchSpaceMembers(space.id),
        fetchCollabSpaceRole(space.id).catch(() => null),
      ]);
      return mapCollabSpace(
        space,
        channels,
        members,
        memberLookup,
        currentUserRole,
      );
    }),
  );
  return enriched;
};

const fetchChannelPosts = async (
  channelId: string,
  spaceId: string,
  memberLookup?: Map<string, SpaceMember>,
) => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/messages/posts`,
    method: 'GET',
    params: { channelId, limit: 50, orderDirection: 'DESC' },
  });
  const messages = normalizeCollabList<CollabMessage>(raw);
  return messages.map((message) =>
    mapCollabMessageToPost(message, spaceId, memberLookup),
  );
};

const fetchChannelConversations = async (
  channelId: string,
): Promise<CollabMessage[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/messages/conversations`,
    method: 'GET',
    params: { channelId, limit: 50, orderDirection: 'ASC' },
  });

  return normalizeCollabList<CollabMessage>(raw).sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return leftTime - rightTime;
  });
};

const fetchMessageThread = async (
  messageId: string,
  memberLookup?: Map<string, SpaceMember>,
) => {
  const raw = await collabRequest<CollabMessage>({
    url: `${COLLAB_URL}/messages/threads`,
    method: 'GET',
    params: { messageId },
  });
  const replies = raw.threadReplies ?? [];
  return replies.map((message) =>
    mapCollabMessageToReply(message, memberLookup),
  );
};

const fetchMessageReactions = async (
  messageId: string,
): Promise<CollabMessageReact[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/message-reacts`,
    method: 'GET',
    params: { messageId, limit: 100, orderDirection: 'ASC' },
  });
  return normalizeCollabList<CollabMessageReact>(raw);
};

const fetchNotifications = async () => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/notifications`,
    method: 'GET',
    params: { limit: 20, orderDirection: 'DESC' },
  });
  return normalizeCollabList<CollabUserNotification>(raw);
};

const fetchMentionNotifications = async () => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/notifications`,
    method: 'GET',
    params: { types: 'mention', limit: 100, orderDirection: 'DESC' },
  });

  return normalizeCollabList<CollabUserNotification>(raw)
    .map(mapCollabNotification)
    .filter((notification) => notification.kind === 'mention' && notification.unread);
};

const mapPersonRecord = (
  item: Record<string, unknown>,
): CollabPerson | null => {
  const userId = String(
    item.userId || item.id || item.targetUserId || '',
  ).trim();
  if (!userId) return null;

  const displayName = String(
    item.displayName ||
      item.fullName ||
      item.name ||
      [item.firstName, item.middleName, item.lastName]
        .filter(Boolean)
        .join(' ') ||
      item.email ||
      userId,
  ).trim();

  return {
    userId,
    displayName: displayName || userId,
    email: item.email ? String(item.email) : undefined,
    avatarUrl: item.avatarUrl
      ? String(item.avatarUrl)
      : item.profileImage
        ? String(item.profileImage)
        : undefined,
    position: item.position ? String(item.position) : undefined,
  };
};

const fetchCollaborationPeople = async (query?: string) => {
  const q = query?.trim();
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/search/people`,
    method: 'GET',
    params: q ? { q } : undefined,
  });

  const list = normalizeCollabList<Record<string, unknown>>(raw);
  if (list.length > 0) {
    return list
      .map(mapPersonRecord)
      .filter((person): person is CollabPerson => Boolean(person));
  }

  // Fallback: active platform members when search returns a non-list payload.
  if (!Array.isArray(raw) && raw && typeof raw === 'object') {
    const body = raw as Record<string, unknown>;
    const nested = [body.people, body.users, body.results, body.items].find(
      Array.isArray,
    ) as Record<string, unknown>[] | undefined;
    if (nested?.length) {
      return nested
        .map(mapPersonRecord)
        .filter((person): person is CollabPerson => Boolean(person));
    }
  }

  const activeRaw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/user-roles/active`,
    method: 'GET',
  });
  return normalizeCollabList<Record<string, unknown>>(activeRaw)
    .map(mapPersonRecord)
    .filter((person): person is CollabPerson => Boolean(person));
};

const fetchUnreadCounts = async () => {
  return collabRequest<Record<string, number>>({
    url: `${COLLAB_URL}/message-reads/unread-counts`,
    method: 'GET',
  });
};

const resolveChannelMemberUserId = (
  member: CollabChannelMember & Record<string, unknown>,
): string => {
  const nestedUser =
    member.user && typeof member.user === 'object'
      ? (member.user as Record<string, unknown>)
      : null;

  return String(
    member.userId ||
      member.targetUserId ||
      nestedUser?.id ||
      nestedUser?.userId ||
      member.id ||
      '',
  ).trim();
};

const fetchChannelMembers = async (
  channelId: string,
  memberLookup?: Map<string, SpaceMember>,
): Promise<SpaceMember[]> => {
  const raw = await collabRequest<unknown>({
    url: `${COLLAB_URL}/channel-members`,
    method: 'GET',
    params: { channelId, limit: 200 },
  });
  const members = normalizeCollabList<
    CollabChannelMember & Record<string, unknown>
  >(raw);

  return members
    .map((member) => {
      const userId = resolveChannelMemberUserId(member);
      if (!userId) return null;

      const fromLookup = memberLookup?.get(userId);
      if (fromLookup) return { ...fromLookup };

      const nestedUser =
        member.user && typeof member.user === 'object'
          ? (member.user as Record<string, unknown>)
          : null;
      const displayName = String(
        nestedUser?.displayName ||
          nestedUser?.fullName ||
          nestedUser?.name ||
          [nestedUser?.firstName, nestedUser?.middleName, nestedUser?.lastName]
            .filter(Boolean)
            .join(' ') ||
          nestedUser?.email ||
          userId,
      ).trim();

      return {
        id: userId,
        name: displayName || userId,
        email: nestedUser?.email ? String(nestedUser.email) : undefined,
        avatarUrl:
          (nestedUser?.avatarUrl && String(nestedUser.avatarUrl)) ||
          (nestedUser?.profileImage && String(nestedUser.profileImage)) ||
          undefined,
      };
    })
    .filter((member): member is SpaceMember => Boolean(member?.id));
};

export const useCollaborationBootstrap = (enabled = true) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = useAuthenticationStore((state) => state.userId);

  return useQuery(
    [COLLAB_QUERY_KEY, 'bootstrap', tenantId, userId],
    bootstrapCollaborationSession,
    {
      enabled: enabled && Boolean(tenantId && userId),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  );
};

export const useCollaborationCatalog = (
  memberLookup?: Map<string, SpaceMember>,
  enabled = true,
) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = useAuthenticationStore((state) => state.userId);

  return useQuery(
    [COLLAB_QUERY_KEY, 'catalog', tenantId, userId],
    () => fetchCollaborationCatalog(memberLookup),
    {
      enabled: enabled && Boolean(tenantId && userId),
      staleTime: 30 * 1000,
    },
  );
};

export const useChannelPosts = (
  channelId?: string,
  spaceId?: string,
  memberLookup?: Map<string, SpaceMember>,
) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'posts', tenantId, userId, channelId],
    () => fetchChannelPosts(String(channelId), String(spaceId), memberLookup),
    {
      enabled: Boolean(tenantId && userId && channelId && spaceId),
      staleTime: 15 * 1000,
    },
  );
};

export const useChannelConversations = (channelId?: string) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'conversations', tenantId, userId, channelId],
    () => fetchChannelConversations(String(channelId)),
    {
      enabled: Boolean(tenantId && userId && channelId),
      staleTime: 10 * 1000,
    },
  );
};

export const useMessageThread = (
  messageId?: string,
  memberLookup?: Map<string, SpaceMember>,
) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'thread', tenantId, userId, messageId],
    () => fetchMessageThread(String(messageId), memberLookup),
    {
      enabled: Boolean(tenantId && userId && messageId),
      staleTime: 15 * 1000,
    },
  );
};

export const useMessageReactions = (
  messageId?: string,
  initialReactions?: CollabMessageReact[],
) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'reactions', tenantId, userId, messageId],
    () => fetchMessageReactions(String(messageId)),
    {
      enabled: Boolean(tenantId && userId && messageId),
      initialData: initialReactions,
      staleTime: 10 * 1000,
    },
  );
};

export const useChannelMembers = (
  channelId?: string,
  memberLookup?: Map<string, SpaceMember>,
  enabled = true,
) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    getChannelMembersQueryKey(tenantId, userId, channelId),
    () => fetchChannelMembers(String(channelId), memberLookup),
    {
      enabled: enabled && Boolean(tenantId && userId && channelId),
      // Keep fresh so newly invited members appear in @ mentions quickly.
      staleTime: 0,
      refetchOnMount: 'always',
    },
  );
};

export const useCollaborationPeople = (query?: string, enabled = true) => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();
  const normalizedQuery = query?.trim() || '';

  return useQuery(
    [COLLAB_QUERY_KEY, 'people', tenantId, userId, normalizedQuery],
    () => fetchCollaborationPeople(normalizedQuery),
    {
      enabled: enabled && Boolean(tenantId && userId),
      staleTime: 60 * 1000,
    },
  );
};

export const useCollaborationNotifications = () => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'notifications', tenantId, userId],
    fetchNotifications,
    {
      enabled: Boolean(tenantId && userId),
      staleTime: 30 * 1000,
    },
  );
};

export const useCollaborationMentionNotifications = () => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'notifications', 'mentions', tenantId, userId],
    fetchMentionNotifications,
    {
      enabled: Boolean(tenantId && userId),
      staleTime: 10 * 1000,
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
    },
  );
};

export const useCollaborationUnreadCounts = () => {
  const tenantId = useAuthenticationStore((state) => state.tenantId);
  const userId = resolveCollabUserId();

  return useQuery(
    [COLLAB_QUERY_KEY, 'unread-counts', tenantId, userId],
    fetchUnreadCounts,
    {
      enabled: Boolean(tenantId && userId),
      staleTime: 30 * 1000,
    },
  );
};

export const collaborationQueryKeys = {
  root: COLLAB_QUERY_KEY,
  catalog: [COLLAB_QUERY_KEY, 'catalog'] as const,
  posts: [COLLAB_QUERY_KEY, 'posts'] as const,
  conversations: [COLLAB_QUERY_KEY, 'conversations'] as const,
  thread: [COLLAB_QUERY_KEY, 'thread'] as const,
  reactions: [COLLAB_QUERY_KEY, 'reactions'] as const,
  channelMembers: [COLLAB_QUERY_KEY, 'channel-members'] as const,
  notifications: [COLLAB_QUERY_KEY, 'notifications'] as const,
  mentionNotifications: [
    COLLAB_QUERY_KEY,
    'notifications',
    'mentions',
  ] as const,
};
