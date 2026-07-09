import type { SavedChatSession } from '@/utils/copilotShare';

/** Copilot prompt row from org-emp `GET/POST /copilot-prompts`. */
export interface CopilotPrompt {
  id: string;
  title?: string | null;
  /** Primary prompt text (backend may use `content` or `prompt`). */
  content?: string | null;
  prompt?: string | null;
  isGlobal?: boolean;
  userId?: string | null;
  tenantId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateCopilotPromptPayload {
  title?: string;
  /** Prompt body — sent as both `content` and `prompt` for backend compatibility. */
  content: string;
}

export interface UpdateCopilotPromptPayload {
  title?: string;
  content?: string;
}

/** Resolved label used in UI chips. */
export function getCopilotPromptLabel(item: CopilotPrompt): string {
  const title = String(item?.title ?? '').trim();
  if (title) return title;
  return String(item?.content ?? item?.prompt ?? '').trim();
}

/** Resolved body to send as the chat query. */
export function getCopilotPromptText(item: CopilotPrompt): string {
  const body = String(item?.content ?? item?.prompt ?? '').trim();
  if (body) return body;
  return String(item?.title ?? '').trim();
}

export function normalizeCopilotPromptList(raw: unknown): CopilotPrompt[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as CopilotPrompt[];
  if (typeof raw !== 'object') return [];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as CopilotPrompt[];
  if (Array.isArray(obj.data)) return obj.data as CopilotPrompt[];
  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items as CopilotPrompt[];
  }
  return [];
}

function isNullishId(value: unknown): boolean {
  return value == null || value === '';
}

/** Default/global prompts: no tenant, no user (seeded globals). */
export function isGlobalCopilotPrompt(item: CopilotPrompt): boolean {
  if (item.isGlobal === true) return true;
  return isNullishId(item.userId) && isNullishId(item.tenantId);
}

export function getGlobalCopilotPrompts(
  prompts: CopilotPrompt[] | undefined,
): CopilotPrompt[] {
  return (prompts ?? []).filter(isGlobalCopilotPrompt);
}

/** Personal prompts: scoped to the signed-in user and tenant (from auth). */
export function isPersonalCopilotPrompt(
  item: CopilotPrompt,
  userId?: string | null,
  tenantId?: string | null,
): boolean {
  if (isGlobalCopilotPrompt(item)) return false;
  if (!userId || !tenantId) return false;
  return (
    String(item.userId ?? '') === String(userId) &&
    String(item.tenantId ?? '') === String(tenantId)
  );
}

export function getPersonalCopilotPrompts(
  prompts: CopilotPrompt[] | undefined,
  userId?: string | null,
  tenantId?: string | null,
): CopilotPrompt[] {
  return (prompts ?? []).filter((item) =>
    isPersonalCopilotPrompt(item, userId, tenantId),
  );
}

/** Map personal prompts into the saved-chats rail shape. */
export function mapPersonalCopilotPromptsToSavedSessions(
  prompts: CopilotPrompt[],
): SavedChatSession[] {
  return prompts.map((item) => {
    const title = getCopilotPromptLabel(item);
    const text = getCopilotPromptText(item);
    return {
      id: item.id,
      title: title || text || 'Saved prompt',
      messages: [],
      savedAt:
        item.updatedAt || item.createdAt || new Date().toISOString(),
    };
  });
}

export function mapCopilotPromptsToChips(
  prompts: CopilotPrompt[],
): Array<{ key: string; label: string; text: string }> {
  return prompts
    .map((item) => {
      const label = getCopilotPromptLabel(item);
      const text = getCopilotPromptText(item);
      if (!label && !text) return null;
      return {
        key: item.id || `${label}-${text}`,
        label: label || text,
        text: text || label,
      };
    })
    .filter((c): c is { key: string; label: string; text: string } => c != null);
}
