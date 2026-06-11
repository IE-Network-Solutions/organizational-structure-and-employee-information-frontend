import type { QueryClient } from 'react-query';
import { fetchKeyResultFromPlanning } from '@/store/server/features/okrplanning/okr/keyresult/queries';
import {
  deleteMilestoneRequest,
  updateKeyResultRequest,
} from '@/store/server/features/okrplanning/okr/objective/mutations';

export const collectMilestoneIds = (milestones: any[]): Set<string> =>
  new Set(
    (milestones || [])
      .map((milestone) => milestone?.id)
      .filter((id) => id != null && String(id).trim() !== '')
      .map((id) => String(id)),
  );

export const getRemovedMilestoneIds = (
  baselineIds: Iterable<string>,
  currentMilestones: any[],
): string[] => {
  const currentIdSet = collectMilestoneIds(currentMilestones);
  return [...baselineIds].filter((id) => !currentIdSet.has(id));
};

export const sanitizeMilestonesForSave = (
  milestones: any[],
  deletedIds: string[] = [],
): any[] => {
  const deletedSet = new Set(deletedIds.map(String));
  return (milestones || []).filter(
    (milestone) => !milestone?.id || !deletedSet.has(String(milestone.id)),
  );
};

/** API-safe milestone shape — avoids sending nested/read-only fields that can confuse the backend. */
export const normalizeMilestonesForApi = (milestones: any[]) =>
  sanitizeMilestonesForSave(milestones).map((milestone) => {
    const payload: Record<string, unknown> = {
      title: String(milestone?.title ?? '').trim(),
      weight: Number(milestone?.weight ?? 0),
    };
    if (milestone?.id != null && String(milestone.id).trim() !== '') {
      payload.id = String(milestone.id);
    }
    return payload;
  });

/** PUT payload for milestone-only updates on an existing key result. */
export const buildKeyResultMilestoneUpdatePayload = (
  keyResult: any,
  milestones: any[],
) => {
  const {
    metricType,
    milestones: omittedMilestones,
    objective,
    keyResults,
    ...rest
  } = keyResult ?? {};
  void omittedMilestones;
  void objective;
  void keyResults;

  return {
    ...rest,
    metricTypeId: rest?.metricTypeId ?? metricType?.id ?? null,
    milestones: normalizeMilestonesForApi(milestones),
  };
};

function patchKeyResultInObjectiveData(
  data: unknown,
  keyResultId: string,
  patch: Record<string, unknown>,
): unknown {
  if (!data || typeof data !== 'object') return data;
  const record = data as { items?: any[] };
  if (!Array.isArray(record.items)) return data;

  return {
    ...record,
    items: record.items.map((objective) => {
      if (!Array.isArray(objective?.keyResults)) return objective;
      return {
        ...objective,
        keyResults: objective.keyResults.map((kr: any) =>
          String(kr?.id) === String(keyResultId) ? { ...kr, ...patch } : kr,
        ),
      };
    }),
  };
}

/** Keep list views in sync with the server after milestone saves (avoids stale data on refresh). */
export const patchKeyResultInObjectiveCaches = (
  queryClient: QueryClient,
  keyResultId: string,
  patch: Record<string, unknown>,
) => {
  const cachePrefixes = [
    'ObjectiveInformation',
    'teamObjectiveInformation',
    'companyObjectiveInformation',
  ] as const;

  for (const prefix of cachePrefixes) {
    queryClient.setQueriesData({ queryKey: [prefix] }, (old) =>
      patchKeyResultInObjectiveData(old, keyResultId, patch),
    );
  }

  queryClient.setQueryData(
    ['keyResultForEdit', String(keyResultId)],
    (old: any) => (old ? { ...old, ...patch } : old),
  );
};

/** Refresh queries in the background without blocking the save UI. */
export const scheduleObjectiveCacheRefresh = (
  queryClient: QueryClient,
  keyResultId?: string,
) => {
  void (async () => {
    try {
      if (keyResultId) {
        await queryClient.invalidateQueries(['keyResultForEdit', keyResultId]);
      }
      await queryClient.invalidateQueries('ObjectiveInformation');
      await queryClient.invalidateQueries('teamObjectiveInformation');
      await queryClient.invalidateQueries('companyObjectiveInformation');
    } catch {
      // Cache refresh is best-effort; save already succeeded.
    }
  })();
};

export type PersistKeyResultMilestonesArgs = {
  keyResult: any;
  milestones: any[];
  removedMilestoneIds: string[];
  queryClient: QueryClient;
};

const hasMilestoneList = (value: unknown): value is { milestones: any[] } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      Array.isArray((value as { milestones?: unknown }).milestones),
  );

/**
 * Delete removed milestones, PUT a normalized payload, patch caches immediately,
 * and refresh queries in the background (does not block the save button).
 */
export const persistKeyResultMilestones = async ({
  keyResult,
  milestones,
  removedMilestoneIds,
  queryClient,
}: PersistKeyResultMilestonesArgs): Promise<any[]> => {
  const sanitized = sanitizeMilestonesForSave(milestones, removedMilestoneIds);

  if (removedMilestoneIds.length > 0) {
    await Promise.all(
      removedMilestoneIds.map((id) =>
        deleteMilestoneRequest(id, { notify: false }),
      ),
    );
  }

  const payload = buildKeyResultMilestoneUpdatePayload(keyResult, sanitized);
  const updateResponse = await updateKeyResultRequest(payload, { notify: true });

  const keyResultId = String(keyResult?.id ?? '');
  const fresh = hasMilestoneList(updateResponse)
    ? updateResponse
    : keyResultId
      ? await fetchKeyResultFromPlanning(keyResultId)
      : null;

  const serverMilestones = hasMilestoneList(fresh)
    ? fresh.milestones.map((milestone: any) => ({ ...milestone }))
    : sanitized.map((milestone) => ({ ...milestone }));

  if (keyResultId) {
    patchKeyResultInObjectiveCaches(queryClient, keyResultId, {
      milestones: serverMilestones,
      ...(fresh && typeof fresh === 'object'
        ? { progress: (fresh as { progress?: number }).progress }
        : {}),
    });
    scheduleObjectiveCacheRefresh(queryClient, keyResultId);
  }

  return serverMilestones;
};
