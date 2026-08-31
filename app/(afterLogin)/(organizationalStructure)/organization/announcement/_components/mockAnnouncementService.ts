export type CollaborationChannelKind = 'channel' | 'announcements' | 'general';

export type SpaceMember = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
};

/** Org directory pool used when adding members to a space. */
export const MOCK_ORG_DIRECTORY: SpaceMember[] = [
  {
    id: 'org-1',
    name: 'Abebe Kebede',
    email: 'abebe@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=12',
  },
  {
    id: 'org-2',
    name: 'Sara Hailu',
    email: 'sara@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=32',
  },
  {
    id: 'org-3',
    name: 'Daniel Mekonnen',
    email: 'daniel@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=45',
  },
  {
    id: 'org-4',
    name: 'Helen Tadesse',
    email: 'helen@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=47',
  },
  {
    id: 'org-5',
    name: 'Yonas Alemu',
    email: 'yonas@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=68',
  },
  {
    id: 'org-6',
    name: 'Liya Getachew',
    email: 'liya@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=5',
  },
  {
    id: 'org-7',
    name: 'Biruk Assefa',
    email: 'biruk@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=15',
  },
  {
    id: 'org-8',
    name: 'Marta Bekele',
    email: 'marta@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=20',
  },
  {
    id: 'org-9',
    name: 'Kidus Solomon',
    email: 'kidus@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=33',
  },
  {
    id: 'org-10',
    name: 'Rahel Desta',
    email: 'rahel@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=44',
  },
  {
    id: 'org-11',
    name: 'Samuel Girma',
    email: 'samuel@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=52',
  },
  {
    id: 'org-12',
    name: 'Netsanet Worku',
    email: 'netsanet@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=60',
  },
  {
    id: 'org-13',
    name: 'Frehiwot Lemma',
    email: 'frehiwot@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=9',
  },
  {
    id: 'org-14',
    name: 'Nahom Tefera',
    email: 'nahom@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=18',
  },
  {
    id: 'org-15',
    name: 'Bethel Amare',
    email: 'bethel@selamnew.com',
    avatarUrl: 'https://i.pravatar.cc/64?img=26',
  },
];

export type CollaborationChannel = {
  id: string;
  name: string;
  kind: CollaborationChannelKind;
  description?: string;
  /** Threads = chat timeline; Posts = announcements / forum. */
  channelType?: 'threads' | 'posts';
  /** Channels created from Announcement are always public. */
  isPrivate?: boolean;
};

export type CollaborationSpace = {
  id: string;
  name: string;
  color: string;
  subtitle: string;
  description?: string;
  memberCount?: number;
  isPrivate?: boolean;
  /** True when the current user has an unread @mention in this space. */
  hasMention?: boolean;
  /** True when there is unread activity without a mention (red dot). */
  hasNotification?: boolean;
  channels: CollaborationChannel[];
  members: SpaceMember[];
};

/** @deprecated Prefer CollaborationChannel for posting targets */
export type CollaborationSpaceKind = 'channel' | 'group';

export type AnnouncementDraft = {
  title?: string;
  body: string;
  spaceId: string;
  channelId: string;
  mentionedUserIds?: string[];
};

export type CreatedAnnouncement = {
  id: string;
  permalink: string;
};

export const SEED_COLLABORATION_SPACES: CollaborationSpace[] = [
  {
    id: 'space-product',
    name: 'Product Department',
    color: '#EF4444',
    subtitle: '5 members',
    memberCount: 5,
    isPrivate: true,
    hasNotification: true,
    members: [
      {
        id: 'm-product-1',
        name: 'Abebe Kebede',
        email: 'abebe@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=12',
      },
      {
        id: 'm-product-2',
        name: 'Sara Hailu',
        email: 'sara@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=32',
      },
      {
        id: 'm-product-3',
        name: 'Daniel Mekonnen',
        email: 'daniel@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=45',
      },
      {
        id: 'm-product-4',
        name: 'Helen Tadesse',
        email: 'helen@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=47',
      },
      {
        id: 'm-product-5',
        name: 'Yonas Alemu',
        email: 'yonas@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=68',
      },
    ],
    channels: [
      { id: 'ch-product-general', name: 'general', kind: 'general' },
      {
        id: 'ch-product-announcements',
        name: 'announcements',
        kind: 'announcements',
      },
      { id: 'ch-product-roadmap', name: 'roadmap', kind: 'channel' },
    ],
  },
  {
    id: 'space-selamnew',
    name: 'Selamnew',
    color: '#14B8A6',
    subtitle: '7 members',
    memberCount: 7,
    isPrivate: true,
    hasMention: true,
    members: [
      {
        id: 'm-selamnew-1',
        name: 'Liya Getachew',
        email: 'liya@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=5',
      },
      {
        id: 'm-selamnew-2',
        name: 'Biruk Assefa',
        email: 'biruk@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=15',
      },
      {
        id: 'm-selamnew-3',
        name: 'Marta Bekele',
        email: 'marta@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=20',
      },
      {
        id: 'm-selamnew-4',
        name: 'Kidus Solomon',
        email: 'kidus@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=33',
      },
      {
        id: 'm-selamnew-5',
        name: 'Rahel Desta',
        email: 'rahel@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=44',
      },
      {
        id: 'm-selamnew-6',
        name: 'Samuel Girma',
        email: 'samuel@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=52',
      },
      {
        id: 'm-selamnew-7',
        name: 'Netsanet Worku',
        email: 'netsanet@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=60',
      },
    ],
    channels: [
      { id: 'ch-selamnew-general', name: 'general', kind: 'general' },
      {
        id: 'ch-selamnew-announcements',
        name: 'announcements',
        kind: 'announcements',
      },
      { id: 'ch-selamnew-all-hands', name: 'all-hands', kind: 'channel' },
      { id: 'ch-selamnew-leadership', name: 'leadership', kind: 'channel' },
    ],
  },
  {
    id: 'space-culture',
    name: 'Company culture',
    color: '#A855F7',
    subtitle: 'Community',
    isPrivate: false,
    memberCount: 4,
    members: [
      {
        id: 'm-culture-1',
        name: 'Frehiwot Lemma',
        email: 'frehiwot@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=9',
      },
      {
        id: 'm-culture-2',
        name: 'Nahom Tefera',
        email: 'nahom@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=18',
      },
      {
        id: 'm-culture-3',
        name: 'Bethel Amare',
        email: 'bethel@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=26',
      },
      {
        id: 'm-culture-4',
        name: 'Elias Mengistu',
        email: 'elias@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=36',
      },
    ],
    channels: [
      { id: 'ch-culture-general', name: 'general', kind: 'general' },
      {
        id: 'ch-culture-announcements',
        name: 'announcements',
        kind: 'announcements',
      },
      { id: 'ch-culture-events', name: 'events', kind: 'channel' },
    ],
  },
  {
    id: 'space-hr',
    name: 'People & Culture',
    color: '#F97316',
    subtitle: '12 members',
    memberCount: 12,
    isPrivate: true,
    members: [
      {
        id: 'm-hr-1',
        name: 'Tigist Haile',
        email: 'tigist@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=8',
      },
      {
        id: 'm-hr-2',
        name: 'Michael Fikru',
        email: 'michael@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=14',
      },
      {
        id: 'm-hr-3',
        name: 'Selamawit Dessie',
        email: 'selamawit@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=24',
      },
      {
        id: 'm-hr-4',
        name: 'Abel Kassahun',
        email: 'abel@selamnew.com',
        avatarUrl: 'https://i.pravatar.cc/64?img=30',
      },
    ],
    channels: [
      { id: 'ch-hr-general', name: 'general', kind: 'general' },
      { id: 'ch-hr-announcements', name: 'announcements', kind: 'announcements' },
      { id: 'ch-hr-policies', name: 'policies', kind: 'channel' },
    ],
  },
];

/** @deprecated Settings starts empty; integrations are added via the wizard. */
export const DEFAULT_ENABLED_CHANNEL_IDS: string[] = [];

export type SeedChannelPost = {
  id: string;
  spaceId: string;
  channelId: string;
  title: string;
  body: string;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string;
};

const earlierToday = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const SEED_CHANNEL_POSTS: SeedChannelPost[] = [
  {
    id: 'post-seed-product-1',
    spaceId: 'space-product',
    channelId: 'ch-product-announcements',
    title: 'Test',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    authorName: 'Wongel Wondyifraw',
    authorAvatarUrl: 'https://i.pravatar.cc/64?img=12',
    createdAt: earlierToday(11, 40),
  },
  {
    id: 'post-seed-product-2',
    spaceId: 'space-product',
    channelId: 'ch-product-general',
    title: 'Sprint kickoff notes',
    body: 'Please review the roadmap items for this sprint and leave comments on blockers before Friday standup.',
    authorName: 'Sara Hailu',
    authorAvatarUrl: 'https://i.pravatar.cc/64?img=32',
    createdAt: earlierToday(9, 15),
  },
  {
    id: 'post-seed-selamnew-1',
    spaceId: 'space-selamnew',
    channelId: 'ch-selamnew-announcements',
    title: 'Welcome to Collaboration',
    body: 'This channel is for company-wide announcements. Keep updates concise and tag the right teams when action is needed.',
    authorName: 'Liya Getachew',
    authorAvatarUrl: 'https://i.pravatar.cc/64?img=5',
    createdAt: earlierToday(10, 5),
  },
  {
    id: 'post-seed-culture-1',
    spaceId: 'space-culture',
    channelId: 'ch-culture-announcements',
    title: 'Culture day next week',
    body: 'We are hosting an optional culture day session next Thursday afternoon. Snacks and team activities will be shared soon.',
    authorName: 'Frehiwot Lemma',
    authorAvatarUrl: 'https://i.pravatar.cc/64?img=9',
    createdAt: earlierToday(8, 30),
  },
];

const MOCK_DELAY_MS = 600;

const bodyToTitle = (body: string) => {
  const plain = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  return plain.length > 80 ? `${plain.slice(0, 77)}...` : plain;
};

/** @deprecated Use useAnnouncementChannelsStore().spaces */
export const listCollaborationSpaces = (): CollaborationSpace[] =>
  SEED_COLLABORATION_SPACES.map((space) => ({
    ...space,
    members: [...space.members],
    channels: [...space.channels],
  }));

export const createAnnouncement = (
  draft: AnnouncementDraft,
  lookup?: {
    findSpaceById: (spaceId: string) => CollaborationSpace | undefined;
    findChannel: (
      spaceId: string,
      channelId: string,
    ) => CollaborationChannel | undefined;
  },
): Promise<CreatedAnnouncement> =>
  new Promise((resolve, reject) => {
    const title = (draft.title?.trim() || bodyToTitle(draft.body)).trim();
    const body = draft.body.trim();

    const findSpace =
      lookup?.findSpaceById ??
      ((spaceId: string) =>
        SEED_COLLABORATION_SPACES.find((space) => space.id === spaceId));
    const findChannelFn =
      lookup?.findChannel ??
      ((spaceId: string, channelId: string) =>
        findSpace(spaceId)?.channels.find((channel) => channel.id === channelId));

    const space = findSpace(draft.spaceId);
    const channel = findChannelFn(draft.spaceId, draft.channelId);

    if (!title || !body || !space || !channel) {
      reject(new Error('Body and a valid channel are required.'));
      return;
    }

    window.setTimeout(() => {
      const id = `announcement-${Date.now()}`;
      resolve({
        id,
        permalink: `https://collaboration.selamnew.local/spaces/${space.id}/channels/${channel.id}/posts/${id}`,
      });
    }, MOCK_DELAY_MS);
  });
