import type { Message } from '@/components/copilot/CopilotMessages';
import {
  createCopilotShareOnBackend,
  type CopilotSharePayloadV1,
} from '@/utils/copilotApiService';

export const COPILOT_SHARE_QUERY = 'copilotShare';
/** Server-stored share id (short link via GET /copilot/share/{id}). */
export const COPILOT_SHARE_REF_QUERY = 'copilotShareRef';
export const COPILOT_SAVED_CHATS_KEY = 'selamnew-copilot-saved-chats';
/** Legacy auto-history key — no longer read; cleared on Copilot open. */
export const COPILOT_LEGACY_HISTORY_KEY = 'selamnew-copilot-chat-history';

/** Stay under common URL limits (~8k). */
export const MAX_SHARE_URL_CHARS = 7500;
export const MAX_SAVED_CHATS = 100;

export interface SavedChatSession {
  id: string;
  title: string;
  messages: Message[];
  savedAt: string;
}

export interface SharePayloadV1 {
  v: 1;
  title?: string;
  messages: Array<Record<string, unknown>>;
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function serializeMessagesForStorage(
  messages: Message[],
): SharePayloadV1 {
  return {
    v: 1,
    messages: messages.map((m) => ({
      ...m,
      timestamp:
        m.timestamp instanceof Date
          ? m.timestamp.toISOString()
          : String(m.timestamp),
    })),
  };
}

export function reviveMessagesFromPayload(payload: SharePayloadV1): Message[] {
  return (payload.messages || []).map((m) => {
    const ts = m.timestamp;
    return {
      ...m,
      timestamp:
        typeof ts === 'string'
          ? new Date(ts)
          : ts instanceof Date
            ? ts
            : new Date(),
    } as Message;
  });
}

export function encodeSharePayload(messages: Message[]): string {
  const body = serializeMessagesForStorage(messages);
  const firstUser = messages.find((m) => m.sender === 'user');
  if (firstUser?.text && typeof firstUser.text === 'string') {
    body.title = firstUser.text.slice(0, 80);
  }
  return utf8ToBase64Url(JSON.stringify(body));
}

export function decodeSharePayload(encoded: string): Message[] | null {
  try {
    const trimmed = encoded.trim();
    if (!trimmed) return null;
    const json = base64UrlToUtf8(trimmed);
    const parsed = JSON.parse(json) as SharePayloadV1;
    if (parsed.v !== 1 || !Array.isArray(parsed.messages)) return null;
    return reviveMessagesFromPayload(parsed);
  } catch {
    return null;
  }
}

export function buildCopilotShareUrl(messages: Message[]): {
  url: string;
  error?: 'empty' | 'too_large';
} {
  if (typeof window === 'undefined') {
    return { url: '', error: 'empty' };
  }
  if (!messages.length) return { url: '', error: 'empty' };
  const encoded = encodeSharePayload(messages);
  const path = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);
  params.delete(COPILOT_SHARE_QUERY);
  params.delete(COPILOT_SHARE_REF_QUERY);
  params.set(COPILOT_SHARE_QUERY, encoded);
  const url = `${window.location.origin}${path}?${params.toString()}`;
  if (url.length > MAX_SHARE_URL_CHARS) {
    return { url: '', error: 'too_large' };
  }
  return { url };
}

/**
 * Prefer backend short link (?copilotShareRef=); fall back to encoded ?copilotShare= if API fails or payload empty.
 */
export async function resolveCopilotShareUrl(messages: Message[]): Promise<{
  url: string;
  error?: 'empty' | 'too_large';
}> {
  if (typeof window === 'undefined') {
    return { url: '', error: 'empty' };
  }
  if (!messages.length) return { url: '', error: 'empty' };
  const body = serializeMessagesForStorage(messages) as CopilotSharePayloadV1;
  const firstUser = messages.find((m) => m.sender === 'user');
  if (firstUser?.text && typeof firstUser.text === 'string') {
    body.title = firstUser.text.slice(0, 80);
  }
  const shareId = await createCopilotShareOnBackend(body);
  const path = window.location.pathname || '/';
  const params = new URLSearchParams(window.location.search);
  params.delete(COPILOT_SHARE_QUERY);
  params.delete(COPILOT_SHARE_REF_QUERY);
  if (shareId) {
    params.set(COPILOT_SHARE_REF_QUERY, shareId);
    const url = `${window.location.origin}${path}?${params.toString()}`;
    return { url };
  }
  return buildCopilotShareUrl(messages);
}

export function reviveSavedSessions(raw: unknown): SavedChatSession[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry: unknown) => {
    const s = entry as Record<string, unknown>;
    const msgs = Array.isArray(s.messages) ? s.messages : [];
    return {
      id: typeof s.id === 'string' ? s.id : `saved_${Date.now()}`,
      title: typeof s.title === 'string' ? s.title : 'Saved chat',
      savedAt:
        typeof s.savedAt === 'string' ? s.savedAt : new Date().toISOString(),
      messages: msgs.map((m: Record<string, unknown>) => ({
        ...m,
        timestamp:
          typeof m.timestamp === 'string'
            ? new Date(m.timestamp)
            : m.timestamp instanceof Date
              ? m.timestamp
              : new Date(),
      })) as Message[],
    };
  });
}
