import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  CollaborationChannel,
  CollaborationSpace,
} from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/mockAnnouncementService';
import type {
  CollabFile,
  CollabMessageReact,
} from '@/store/server/features/collaboration/interface';

export const SPACE_COLORS = [
  '#EF4444',
  '#14B8A6',
  '#A855F7',
  '#F97316',
  '#3B82F6',
  '#EC4899',
  '#10B981',
];

export type ChannelPost = {
  id: string;
  spaceId: string;
  channelId: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
  attachments?: CollabFile[];
  reactions?: CollabMessageReact[];
};

export type PostReply = {
  id: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
  attachments?: CollabFile[];
  reactions?: CollabMessageReact[];
};

interface AnnouncementChannelsStore {
  /** Channel ids integrated for the Announcement sidebar (persisted per browser). */
  enabledChannelIds: string[];
  /** Spaces pinned to the sidebar even with zero enabled channels. */
  sidebarSpaceIds: string[];
  /** Spaces created from Announcement (kept after integration removal). */
  localSpaceIds: string[];
  integrationWizardOpen: boolean;
  integrationFocusSpaceId: string | null;
  setEnabledChannelIds: (channelIds: string[]) => void;
  addEnabledChannels: (channelIds: string[]) => void;
  addSidebarSpaceIds: (spaceIds: string[]) => void;
  removeEnabledChannel: (channelId: string) => void;
  removeSpaceIntegration: (spaceId: string, spaceChannelIds: string[]) => void;
  openIntegrationWizard: (spaceId?: string) => void;
  closeIntegrationWizard: () => void;
  toggleChannelEnabled: (channelId: string) => void;
  registerLocalSpace: (spaceId: string) => void;
  getEnabledSpaces: (spaces: CollaborationSpace[]) => CollaborationSpace[];
  findSpaceById: (
    spaces: CollaborationSpace[],
    spaceId: string,
  ) => CollaborationSpace | undefined;
  findChannel: (
    spaces: CollaborationSpace[],
    spaceId: string,
    channelId: string,
  ) => CollaborationChannel | undefined;
}

export const useAnnouncementChannelsStore = create<AnnouncementChannelsStore>()(
  persist(
    (set, get) => ({
      enabledChannelIds: [],
      sidebarSpaceIds: [],
      localSpaceIds: [],
      integrationWizardOpen: false,
      integrationFocusSpaceId: null,

      setEnabledChannelIds: (channelIds) =>
        set((state) => {
          const unique = Array.from(new Set(channelIds));
          return { enabledChannelIds: unique };
        }),

      addEnabledChannels: (channelIds) =>
        set((state) => ({
          enabledChannelIds: Array.from(
            new Set([...state.enabledChannelIds, ...channelIds]),
          ),
        })),

      addSidebarSpaceIds: (spaceIds) =>
        set((state) => ({
          sidebarSpaceIds: Array.from(
            new Set([...state.sidebarSpaceIds, ...spaceIds]),
          ),
        })),

      removeEnabledChannel: (channelId) =>
        set((state) => ({
          enabledChannelIds: state.enabledChannelIds.filter(
            (id) => id !== channelId,
          ),
        })),

      removeSpaceIntegration: (spaceId, spaceChannelIds) =>
        set((state) => {
          const channelIds = new Set(spaceChannelIds);
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

      registerLocalSpace: (spaceId) =>
        set((state) => ({
          sidebarSpaceIds: Array.from(
            new Set([...state.sidebarSpaceIds, spaceId]),
          ),
          localSpaceIds: Array.from(new Set([...state.localSpaceIds, spaceId])),
        })),

      getEnabledSpaces: (spaces) => {
        const { enabledChannelIds, sidebarSpaceIds } = get();
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

      findSpaceById: (spaces, spaceId) =>
        spaces.find((space) => space.id === spaceId),

      findChannel: (spaces, spaceId, channelId) =>
        spaces
          .find((space) => space.id === spaceId)
          ?.channels.find((channel) => channel.id === channelId),
    }),
    {
      name: 'announcement-channels-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabledChannelIds: state.enabledChannelIds,
        sidebarSpaceIds: state.sidebarSpaceIds,
        localSpaceIds: state.localSpaceIds,
      }),
    },
  ),
);
