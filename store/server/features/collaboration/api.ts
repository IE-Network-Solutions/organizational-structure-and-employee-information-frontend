import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { COLLAB_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import type { Method, ResponseType } from 'axios';

export { COLLAB_URL };

export const resolveCollabUserId = () => {
  const authState = useAuthenticationStore.getState();
  return String(authState.userId || authState.userData?.id || '').trim();
};

export const getCollabHeaders = async (
  extra: Record<string, string> = {},
): Promise<Record<string, string>> => {
  const token = await getCurrentToken();
  const authState = useAuthenticationStore.getState();
  const tenantId = String(authState.tenantId || '').trim();
  const userId = resolveCollabUserId();

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
    tenantid: tenantId,
    userId,
    ...extra,
  };
};

type CollabRequestParams = {
  url: string;
  method: Method;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  responseType?: ResponseType;
};

export const collabRequest = async <T = unknown>({
  url,
  method,
  data,
  params,
  headers = {},
  responseType,
}: CollabRequestParams): Promise<T> => {
  const resolvedHeaders = await getCollabHeaders(headers);
  return crudRequest({
    url,
    method,
    data,
    params,
    headers: resolvedHeaders,
    skipEncryption: true,
    responseType,
  }) as Promise<T>;
};

export const fetchCollabFileBlob = async (
  fileId: string,
  mode: 'view' | 'download' = 'view',
): Promise<Blob> => {
  const authState = useAuthenticationStore.getState();
  const tenantId = String(authState.tenantId || '').trim();
  const userId = resolveCollabUserId();

  return collabRequest<Blob>({
    url: `${COLLAB_URL}/files/${fileId}/${mode}`,
    method: 'GET',
    params: { tenantId, userId },
    headers: { requestedBy: userId },
    responseType: 'blob',
  });
};

const pickArrayField = (
  source: Record<string, unknown>,
): unknown[] | null => {
  for (const key of [
    'items',
    'members',
    'results',
    'data',
    'rows',
    'records',
    'users',
    'people',
  ]) {
    const value = source[key];
    if (Array.isArray(value)) return value;
  }
  return null;
};

/**
 * Collab list endpoints return several shapes (bare array, `{ items }`,
 * `{ data: [] }`, `{ data: { items|members|results } }`, etc.). Parse them all
 * so channel/space member lists never silently become `[]`.
 */
export const normalizeCollabList = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (!raw || typeof raw !== 'object') return [];

  const body = raw as Record<string, unknown>;
  const fromBody = pickArrayField(body);
  if (fromBody) return fromBody as T[];

  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    const nested = pickArrayField(body.data as Record<string, unknown>);
    if (nested) return nested as T[];
  }

  return [];
};

export const normalizeCollabEntity = <T extends Record<string, unknown>>(
  raw: unknown,
): T | null => {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;

  // Prefer nested entity payloads: { data: { id, ... } }
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    return body.data as T;
  }

  // Some Collab endpoints wrap as { item: {...} } or { space: {...} }
  for (const key of ['item', 'space', 'channel', 'result', 'entity']) {
    const nested = body[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nested as T;
    }
  }

  return body as T;
};

export const createCollabUploadId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};
