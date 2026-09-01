import create from 'zustand';
import {
  MOCK_ORG_DIRECTORY,
  SEED_CHANNEL_POSTS,
  SEED_COLLABORATION_SPACES,
  type CollaborationChannel,
  type CollaborationChannelKind,
  type CollaborationSpace,
  type SpaceMember,
} from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';

export const SPACE_COLORS = [
  '#EF4444',
  '#14B8A6',
  '#A855F7',
  '#F97316',
  '#3B82F6',
  '#EC4899',
  '#10B981',
];

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

type CreateSpaceInput = {
  name: string;
  description?: string;
  color?: string;
  subtitle?: string;
  memberCount?: number;
  isPrivate?: boolean;
};

type UpdateSpaceInput = {
  name?: string;
  description?: string;
  color?: string;
  isPrivate?: boolean;
};

type CreateChannelInput = {
  spaceId: string;
  name: string;
  description?: string;
  channelType?: 'threads' | 'posts';
  kind?: CollaborationChannelKind;
  enableForAnnouncement?: boolean;
};

type UpdateChannelInput = {
  name?: string;
  description?: string;
};

export type ChannelPost = {
  id: string;
  spaceId: string;
  channelId: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
};

type CreatePostInput = {
  spaceId: string;
  channelId: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
};

interface AnnouncementChannelsStore {
  /** Full Collaboration catalog (mock platform spaces). */
  spaces: CollaborationSpace[];
  /** Channels integrated for the Announcement page (empty until configured). */
  enabledChannelIds: string[];
  /**
   * Spaces pinned to the Announcement sidebar (e.g. created here or
   * integrated) even with zero enabled channels — so Add channel stays available.
   */
  sidebarSpaceIds: string[];
  /** Spaces created from the Announcement page (kept after integration removal). */
  localSpaceIds: string[];
  posts: ChannelPost[];
  /** Members already added to each channel (subset of space members). */
  channelMemberIds: Record<string, string[]>;
  integrationWizardOpen: boolean;
  /** When set, wizard skips to channel step for this space ("Add more"). */
  integrationFocusSpaceId: string | null;
  setEnabledChannelIds: (channelIds: string[]) => void;
  addEnabledChannels: (channelIds: string[]) => void;
  removeEnabledChannel: (channelId: string) => void;
  removeSpaceIntegration: (spaceId: string) => void;
  openIntegrationWizard: (spaceId?: string) => void;
  closeIntegrationWizard: () => void;
  toggleChannelEnabled: (channelId: string) => void;
  createSpace: (input: CreateSpaceInput) => CollaborationSpace;
  updateSpace: (
    spaceId: string,
    input: UpdateSpaceInput,
  ) => CollaborationSpace | null;
  createChannel: (input: CreateChannelInput) => CollaborationChannel | null;
  updateChannel: (
    spaceId: string,
    channelId: string,
    input: UpdateChannelInput,
  ) => CollaborationChannel | null;
  addPost: (input: CreatePostInput) => ChannelPost;
  addChannelMembers: (channelId: string, memberIds: string[]) => void;
  addSpaceMembers: (spaceId: string, memberIds: string[]) => void;
  getChannelMemberIds: (channelId: string) => string[];
  getPostsForChannel: (channelId: string) => ChannelPost[];
  getEnabledSpaces: () => CollaborationSpace[];
  findSpaceById: (spaceId: string) => CollaborationSpace | undefined;
  findChannel: (
    spaceId: string,
    channelId: string,
  ) => CollaborationChannel | undefined;
}

export const useAnnouncementChannelsStore = create<AnnouncementChannelsStore>(
  (set, get) => ({
    spaces: SEED_COLLABORATION_SPACES.map((space) => ({
      ...space,
      members: space.members.map((member) => ({ ...member })),
      channels: space.channels.map((channel) => ({ ...channel })),
    })),
    enabledChannelIds: [],
    sidebarSpaceIds: [],
    localSpaceIds: [],
    posts: SEED_CHANNEL_POSTS.map((post) => ({ ...post })),
    channelMemberIds: {},
    integrationWizardOpen: false,
    integrationFocusSpaceId: null,

    setEnabledChannelIds: (channelIds) =>
      set((state) => {
        const unique = Array.from(new Set(channelIds));
        const spaceIdsFromChannels = state.spaces
          .filter((space) =>
            space.channels.some((channel) => unique.includes(channel.id)),
          )
          .map((space) => space.id);
        return {
          enabledChannelIds: unique,
          sidebarSpaceIds: Array.from(
            new Set([...state.sidebarSpaceIds, ...spaceIdsFromChannels]),
          ),
        };
      }),

    addEnabledChannels: (channelIds) =>
      set((state) => {
        const nextEnabled = Array.from(
          new Set([...state.enabledChannelIds, ...channelIds]),
        );
        const spaceIdsFromChannels = state.spaces
          .filter((space) =>
            space.channels.some((channel) => channelIds.includes(channel.id)),
          )
          .map((space) => space.id);
        return {
          enabledChannelIds: nextEnabled,
          sidebarSpaceIds: Array.from(
            new Set([...state.sidebarSpaceIds, ...spaceIdsFromChannels]),
          ),
        };
      }),

    removeEnabledChannel: (channelId) =>
      set((state) => ({
        enabledChannelIds: state.enabledChannelIds.filter(
          (id) => id !== channelId,
        ),
      })),

    removeSpaceIntegration: (spaceId) =>
      set((state) => {
        const space = state.spaces.find((item) => item.id === spaceId);
        if (!space) return state;
        const channelIds = new Set(space.channels.map((channel) => channel.id));
        return {
          enabledChannelIds: state.enabledChannelIds.filter(
            (id) => !channelIds.has(id),
          ),
          sidebarSpaceIds: state.localSpaceIds.includes(spaceId)
            ? state.sidebarSpaceIds
            : state.sidebarSpaceIds.filter((id) => id !== spaceId),
        };
      }),

    openIntegrationWizard: (spaceId) =>
      set({
        integrationWizardOpen: true,
        integrationFocusSpaceId: spaceId ?? null,
      }),

    closeIntegrationWizard: () =>
      set({
        integrationWizardOpen: false,
        integrationFocusSpaceId: null,
      }),

    toggleChannelEnabled: (channelId) =>
      set((state) => {
        const enabled = state.enabledChannelIds.includes(channelId);
        return {
          enabledChannelIds: enabled
            ? state.enabledChannelIds.filter((id) => id !== channelId)
            : [...state.enabledChannelIds, channelId],
        };
      }),

    createSpace: (input) => {
      const name = input.name.trim();
      const id = `space-${slugify(name)}-${Date.now()}`;
      const color =
        input.color?.trim() ||
        SPACE_COLORS[get().spaces.length % SPACE_COLORS.length] ||
        '#3B82F6';
      const description = input.description?.trim() || undefined;
      const memberCount = input.memberCount ?? 0;
      const space: CollaborationSpace = {
        id,
        name,
        color,
        description,
        subtitle: input.subtitle?.trim() || `${memberCount} members`,
        memberCount,
        isPrivate: input.isPrivate ?? false,
        members: [],
        // No default/mock channels — user creates them explicitly.
        channels: [],
      };

      set((state) => ({
        spaces: [...state.spaces, space],
        sidebarSpaceIds: Array.from(new Set([...state.sidebarSpaceIds, id])),
        localSpaceIds: Array.from(new Set([...state.localSpaceIds, id])),
      }));

      return space;
    },

    updateSpace: (spaceId, input) => {
      const existing = get().spaces.find((space) => space.id === spaceId);
      if (!existing) return null;

      const name = input.name?.trim();
      const description =
        input.description !== undefined
          ? input.description.trim() || undefined
          : existing.description;
      const color = input.color?.trim() || existing.color;
      const isPrivate =
        input.isPrivate !== undefined ? input.isPrivate : existing.isPrivate;

      const updated: CollaborationSpace = {
        ...existing,
        name: name || existing.name,
        description,
        color,
        isPrivate,
      };

      set((state) => ({
        spaces: state.spaces.map((space) =>
          space.id === spaceId ? updated : space,
        ),
      }));

      return updated;
    },

    createChannel: (input) => {
      const name = input.name
        .trim()
        .replace(/^#/, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      if (!name) return null;

      const space = get().spaces.find((item) => item.id === input.spaceId);
      if (!space) return null;
      if (
        space.channels.some(
          (channel) => channel.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return null;
      }

      const channelType = input.channelType ?? 'posts';
      const kind =
        input.kind ?? (channelType === 'posts' ? 'announcements' : 'channel');
      const description = input.description?.trim() || undefined;

      const channel: CollaborationChannel = {
        id: `ch-${space.id}-${slugify(name)}-${Date.now()}`,
        name,
        kind,
        description,
        channelType,
        isPrivate: false,
      };
      const enable = input.enableForAnnouncement ?? true;

      set((state) => ({
        spaces: state.spaces.map((item) =>
          item.id === space.id
            ? { ...item, channels: [...item.channels, channel] }
            : item,
        ),
        enabledChannelIds: enable
          ? Array.from(new Set([...state.enabledChannelIds, channel.id]))
          : state.enabledChannelIds,
        sidebarSpaceIds: Array.from(
          new Set([...state.sidebarSpaceIds, space.id]),
        ),
      }));

      return channel;
    },

    updateChannel: (spaceId, channelId, input) => {
      const space = get().spaces.find((item) => item.id === spaceId);
      if (!space) return null;
      const existing = space.channels.find(
        (channel) => channel.id === channelId,
      );
      if (!existing) return null;

      const nextName = input.name
        ?.trim()
        .replace(/^#/, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      if (
        nextName &&
        space.channels.some(
          (channel) =>
            channel.id !== channelId &&
            channel.name.toLowerCase() === nextName.toLowerCase(),
        )
      ) {
        return null;
      }

      const updated: CollaborationChannel = {
        ...existing,
        name: nextName || existing.name,
        description:
          input.description !== undefined
            ? input.description.trim() || undefined
            : existing.description,
      };

      set((state) => ({
        spaces: state.spaces.map((item) =>
          item.id !== spaceId
            ? item
            : {
                ...item,
                channels: item.channels.map((channel) =>
                  channel.id === channelId ? updated : channel,
                ),
              },
        ),
      }));

      return updated;
    },

    addPost: (input) => {
      const post: ChannelPost = {
        id: `post-${Date.now()}`,
        spaceId: input.spaceId,
        channelId: input.channelId,
        title: input.title.trim(),
        body: input.body.trim(),
        authorName: input.authorName,
        authorAvatarUrl: input.authorAvatarUrl,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ posts: [post, ...state.posts] }));
      return post;
    },

    addChannelMembers: (channelId, memberIds) =>
      set((state) => ({
        channelMemberIds: {
          ...state.channelMemberIds,
          [channelId]: Array.from(
            new Set([
              ...(state.channelMemberIds[channelId] ?? []),
              ...memberIds,
            ]),
          ),
        },
      })),

    addSpaceMembers: (spaceId, memberIds) =>
      set((state) => {
        const directoryById = new Map(
          MOCK_ORG_DIRECTORY.map((member) => [member.id, member]),
        );
        return {
          spaces: state.spaces.map((space) => {
            if (space.id !== spaceId) return space;
            const existingIds = new Set(
              space.members.map((member) => member.id),
            );
            const additions: SpaceMember[] = [];
            for (const memberId of memberIds) {
              if (existingIds.has(memberId)) continue;
              const member = directoryById.get(memberId);
              if (!member) continue;
              additions.push({ ...member });
              existingIds.add(memberId);
            }
            if (additions.length === 0) return space;
            const members = [...space.members, ...additions];
            return {
              ...space,
              members,
              memberCount: members.length,
              subtitle: `${members.length} members`,
            };
          }),
        };
      }),

    getChannelMemberIds: (channelId) => get().channelMemberIds[channelId] ?? [],

    getPostsForChannel: (channelId) =>
      get().posts.filter((post) => post.channelId === channelId),

    getEnabledSpaces: () => {
      const { spaces, enabledChannelIds, sidebarSpaceIds } = get();
      return spaces
        .map((space) => ({
          ...space,
          channels: space.channels.filter((channel) =>
            enabledChannelIds.includes(channel.id),
          ),
        }))
        .filter(
          (space) =>
            space.channels.length > 0 || sidebarSpaceIds.includes(space.id),
        );
    },

    findSpaceById: (spaceId) =>
      get().spaces.find((space) => space.id === spaceId),

    findChannel: (spaceId, channelId) =>
      get()
        .spaces.find((space) => space.id === spaceId)
        ?.channels.find((channel) => channel.id === channelId),
  }),
);
