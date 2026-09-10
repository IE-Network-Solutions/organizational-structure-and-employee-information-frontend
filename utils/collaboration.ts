/**
 * Configuration + helpers for the Selamnew Collaboration integration, mirroring
 * what CRM, Operations and Core already do.
 *
 * COLLABORATION_EMBED_URL is the collaboration *web app*, embedded here as an
 * <iframe>. On the shared Selamnew origin both apps sit behind the same reverse
 * proxy (Workspace under `/workspace`, collaboration under `/collaboration`) and
 * therefore share the Firebase `token` cookie Core sets at login, so the
 * embedded app boots its own session with no second sign-in. A cross-origin
 * value cannot read that cookie, so SSO bootstrap only works same-origin.
 *
 * Workspace opens the embed from its Announcement nav item, so the panel is
 * scoped to announcement material: the iframe src carries `channels=posts`,
 * which the collaboration app reads (see features/spaces/lib/posts-only-mode.ts
 * there) to list post channels only and hide spaces holding none.
 */

const IS_CORE =
  (process.env.NEXT_PUBLIC_IS_CORE ?? process.env.IS_CORE ?? '')
    .trim()
    .toLowerCase() === 'true';

/**
 * Origin-absolute path (or full URL) the collaboration app is served from.
 * Defaults to `/collaboration` — the reverse-proxy prefix on the shared origin.
 * Workspace's own `basePath` is deliberately NOT applied: the embed URL resolves
 * against the origin root, not against `/workspace`.
 */
export const COLLABORATION_EMBED_URL = (
  process.env.NEXT_PUBLIC_COLLABORATION_EMBED_URL?.trim() || '/collaboration'
).replace(/\/+$/, '');

/**
 * Whether to surface the collaboration panel at all. Defaults on when this app
 * runs in Core mode (shared origin → SSO available). Force with
 * NEXT_PUBLIC_COLLABORATION_ENABLED=true|false.
 */
export const COLLABORATION_ENABLED =
  (process.env.NEXT_PUBLIC_COLLABORATION_ENABLED ?? (IS_CORE ? 'true' : ''))
    .trim()
    .toLowerCase() === 'true';

/**
 * Host hint the embedded app themes itself from. Picks the Workspace palette
 * (primary #1E40AF over a blue-50 sidebar) instead of collaboration's own navy.
 */
export const COLLABORATION_EMBED_HOST = 'workspace';

/**
 * Context handed to the embedded app when the panel is opened from a specific
 * Workspace surface, so it can deep-link and label its header.
 */
export type CollaborationContext = {
  /** Header title shown above the embed, e.g. "Announcement". */
  title?: string;
  /** Short label under the title, e.g. "Company culture". */
  subtitle?: string;
  /** Workspace area the context came from, e.g. "announcement". */
  module?: string;
  /** Stable entity type + id so collaboration can map it to a space. */
  entityType?: string;
  entityId?: string;
  /**
   * Explicit in-app path within the collaboration app to open, e.g.
   * "/spaces?space=123". When set it overrides the default landing route.
   */
  path?: string;
};

/** postMessage channel name used to hand context to the embedded app. */
export const COLLABORATION_MESSAGE_TYPE = 'selamnew:collaboration:context';

/** Custom DOM event any Workspace component can dispatch to open the panel. */
export const COLLABORATION_OPEN_EVENT = 'selamnew:collaboration:open';

/**
 * Build the iframe src. Adds `embed=workspace` as the palette hint and
 * `channels=posts` as the scope hint, plus lightweight context hints on the
 * query string.
 */
export function buildCollaborationSrc(context?: CollaborationContext): string {
  const base = COLLABORATION_EMBED_URL;
  const path = context?.path?.trim();
  const target = path && path.startsWith('/') ? `${base}${path}` : base;

  const params = new URLSearchParams({
    embed: COLLABORATION_EMBED_HOST,
    channels: 'posts',
  });
  if (context?.entityType) params.set('ctxType', context.entityType);
  if (context?.entityId) params.set('ctxId', context.entityId);
  if (context?.module) params.set('ctxModule', context.module);

  const sep = target.includes('?') ? '&' : '?';
  return `${target}${sep}${params.toString()}`;
}

/** The collaboration app's spaces list — where post channels live. */
export const COLLABORATION_SPACES_PATH = '/spaces';

/** Deep link into the collaboration app for a given space id. */
export function collaborationSpacePath(spaceId: string): string {
  return `${COLLABORATION_SPACES_PATH}?space=${spaceId}`;
}

/** Deep link for a specific channel inside a space. */
export function collaborationChannelPath(
  spaceId: string,
  channelId: string,
): string {
  return `${COLLABORATION_SPACES_PATH}?space=${spaceId}&channel=${channelId}`;
}

/**
 * Fire-and-forget opener usable from anywhere (even non-React code).
 * The panel listens for COLLABORATION_OPEN_EVENT.
 */
export function openCollaboration(context?: CollaborationContext): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<CollaborationContext>(COLLABORATION_OPEN_EVENT, {
      detail: context ?? {},
    }),
  );
}
