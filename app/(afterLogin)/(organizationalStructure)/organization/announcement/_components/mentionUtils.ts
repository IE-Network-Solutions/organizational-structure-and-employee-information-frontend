export type MentionUser = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export const getMentionToken = (name: string) =>
  `@${name.trim().replace(/\s+/g, '')}`;

export const stripMentionHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const resolveMentionsForPayload = (
  content: string,
  explicitUserIds: string[],
  users: MentionUser[],
) => {
  const plain = stripMentionHtml(content);
  const ids = new Set(explicitUserIds.map(String));

  const markerMatches = content.matchAll(/<@([0-9a-fA-F-]{36})>/g);
  for (const match of markerMatches) {
    const value = String(match[1] || '').trim();
    if (value) ids.add(value);
  }

  const escapedMatches = content.matchAll(
    /(?:&lt;|<)@([0-9a-fA-F-]{36})(?:&gt;|>)/g,
  );
  for (const match of escapedMatches) {
    const value = String(match[1] || '').trim();
    if (value) ids.add(value);
  }

  users.forEach((user) => {
    const token = getMentionToken(user.name);
    if (token.length > 1 && plain.includes(token)) {
      ids.add(user.id);
    }
  });

  return Array.from(ids)
    .map((userId) => {
      const user = users.find((item) => item.id === userId);
      if (!user) return { userId };
      return {
        userId: user.id,
        displayName: user.name,
        avatarUrl: user.profileImage,
      };
    })
    .filter((mention) => Boolean(mention.userId));
};

export const spaceMembersToMentionUsers = (
  members: Array<{
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  }>,
  currentUserId?: string,
): MentionUser[] =>
  members
    .filter((member) => {
      if (!member?.id) return false;
      if (currentUserId && String(member.id) === String(currentUserId)) {
        return false;
      }
      return Boolean(member.name);
    })
    .map((member) => ({
      id: String(member.id),
      name: member.name,
      email: member.email || '',
      profileImage: member.avatarUrl,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
