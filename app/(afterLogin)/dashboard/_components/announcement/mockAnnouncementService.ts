export type CollaborationSpaceKind = 'channel' | 'group';

export type CollaborationSpace = {
  id: string;
  name: string;
  kind: CollaborationSpaceKind;
};

export type AnnouncementDraft = {
  title?: string;
  body: string;
  spaceId: string;
  mentionedUserIds?: string[];
};

export type CreatedAnnouncement = {
  id: string;
  permalink: string;
};

const MOCK_SPACES: CollaborationSpace[] = [
  { id: 'space-company', name: 'Company announcements', kind: 'channel' },
  { id: 'space-leadership', name: 'Leadership', kind: 'group' },
  { id: 'space-all-hands', name: 'All hands', kind: 'channel' },
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

export const listCollaborationSpaces = (): CollaborationSpace[] => [
  ...MOCK_SPACES,
];

export const createAnnouncement = (
  draft: AnnouncementDraft,
): Promise<CreatedAnnouncement> =>
  new Promise((resolve, reject) => {
    const title = (draft.title?.trim() || bodyToTitle(draft.body)).trim();
    const body = draft.body.trim();
    const space = MOCK_SPACES.find((item) => item.id === draft.spaceId);

    if (!title || !body || !space) {
      reject(new Error('Body and a valid space are required.'));
      return;
    }

    window.setTimeout(() => {
      const id = `announcement-${Date.now()}`;
      resolve({
        id,
        permalink: `https://collaboration.selamnew.local/spaces/${space.id}/posts/${id}`,
      });
    }, MOCK_DELAY_MS);
  });
