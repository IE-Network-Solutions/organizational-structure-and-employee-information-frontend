export type CollabNotificationKind = 'mention' | 'reply' | 'announcement';

export type CollabNotification = {
  id: string;
  kind: CollabNotificationKind;
  actorName: string;
  actorAvatarUrl?: string;
  spaceName: string;
  preview: string;
  createdAt: string;
  unread: boolean;
};

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const MOCK_NOTIFICATIONS: CollabNotification[] = [
  {
    id: 'notif-1',
    kind: 'mention',
    actorName: 'Sara Bekele',
    spaceName: 'Company announcements',
    preview: 'Can you review the Q3 kickoff note before Friday?',
    createdAt: hoursAgo(1),
    unread: true,
  },
  {
    id: 'notif-2',
    kind: 'mention',
    actorName: 'Daniel Hailu',
    spaceName: 'Leadership',
    preview: 'Looping you in on the hiring plan update.',
    createdAt: hoursAgo(3),
    unread: true,
  },
  {
    id: 'notif-3',
    kind: 'reply',
    actorName: 'Marta Tadesse',
    spaceName: 'All hands',
    preview: 'Agreed — let’s lock the agenda by tomorrow.',
    createdAt: hoursAgo(8),
    unread: false,
  },
  {
    id: 'notif-4',
    kind: 'mention',
    actorName: 'Yonas Alemu',
    spaceName: 'Company announcements',
    preview: 'Please confirm the office closure dates.',
    createdAt: hoursAgo(20),
    unread: false,
  },
  {
    id: 'notif-5',
    kind: 'announcement',
    actorName: 'People Ops',
    spaceName: 'Company announcements',
    preview: 'New benefits enrollment window opens next week.',
    createdAt: hoursAgo(30),
    unread: false,
  },
];

/** Mentions first, then other kinds; unread before read within kind order. */
export const listCollaborationNotifications = (): CollabNotification[] => {
  const kindRank: Record<CollabNotificationKind, number> = {
    mention: 0,
    reply: 1,
    announcement: 2,
  };

  return [...MOCK_NOTIFICATIONS].sort((a, b) => {
    const kindDiff = kindRank[a.kind] - kindRank[b.kind];
    if (kindDiff !== 0) return kindDiff;
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
};
