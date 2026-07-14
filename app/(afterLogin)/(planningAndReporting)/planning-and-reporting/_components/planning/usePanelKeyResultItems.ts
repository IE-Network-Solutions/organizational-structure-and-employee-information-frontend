import { useMemo } from 'react';
import { useQueries } from 'react-query';
import {
  fetchKeyResultFromPlanning,
  getKeyResultByUser,
} from '@/store/server/features/okrplanning/okr/keyresult/queries';
import { hasKrMetricMetadata } from '@/utils/okrKeyResultProgressDisplay';
import {
  collectPlanKeyResultIds,
  collectPlanOwnerUserIds,
  normalizeUserKeyResultItems,
} from './mergeKRPanelGroups';
import type { PlanSummary } from '../types';

/** Normalize key-result API payloads that may wrap the KR object. */
function unwrapKeyResultPayload(response: unknown): any | null {
  if (!response || typeof response !== 'object') return null;
  const row = response as Record<string, any>;
  if (row.id != null && row.deletedAt == null) return row;
  if (row.data && typeof row.data === 'object' && row.data.id != null) {
    return row.data.deletedAt == null ? row.data : null;
  }
  if (row.item && typeof row.item === 'object' && row.item.id != null) {
    return row.item.deletedAt == null ? row.item : null;
  }
  if (
    row.keyResult &&
    typeof row.keyResult === 'object' &&
    row.keyResult.id != null
  ) {
    return row.keyResult.deletedAt == null ? row.keyResult : null;
  }
  if (Array.isArray(row.items) && row.items[0]?.id != null) {
    return row.items[0].deletedAt == null ? row.items[0] : null;
  }
  return null;
}

/** Merge KR records without letting a thin payload wipe metric metadata. */
function mergeKeyResultRecords(target: Map<string, any>, list: any[]) {
  for (const kr of list) {
    if (kr?.id == null || kr.deletedAt != null) continue;
    const id = String(kr.id);
    const existing = target.get(id);
    if (!existing) {
      target.set(id, kr);
      continue;
    }

    const incomingHasMetric = hasKrMetricMetadata(kr);
    const existingHasMetric = hasKrMetricMetadata(existing);
    const merged = {
      ...existing,
      ...kr,
      metricType: incomingHasMetric
        ? (kr.metricType ?? existing.metricType)
        : (existing.metricType ?? kr.metricType),
      key_type: incomingHasMetric
        ? (kr.key_type ?? existing.key_type)
        : (existing.key_type ?? kr.key_type),
      metricTypeName: incomingHasMetric
        ? (kr.metricTypeName ?? existing.metricTypeName)
        : (existing.metricTypeName ?? kr.metricTypeName),
      previousMetricTypeName:
        kr.previousMetricTypeName ?? existing.previousMetricTypeName,
      metricTypeId:
        kr.metricTypeId ??
        existing.metricTypeId ??
        (typeof kr.metricType === 'object' ? kr.metricType?.id : undefined) ??
        (typeof existing.metricType === 'object'
          ? existing.metricType?.id
          : undefined),
      milestones:
        Array.isArray(kr.milestones) && kr.milestones.length > 0
          ? kr.milestones
          : (existing.milestones ?? kr.milestones),
      Milestones:
        Array.isArray(kr.Milestones) && kr.Milestones.length > 0
          ? kr.Milestones
          : (existing.Milestones ?? kr.Milestones),
    };

    // Prefer whichever side already had metric metadata when both disagree.
    if (!incomingHasMetric && existingHasMetric) {
      merged.metricType = existing.metricType;
      merged.key_type = existing.key_type ?? merged.key_type;
      merged.metricTypeName = existing.metricTypeName ?? merged.metricTypeName;
      merged.previousMetricTypeName =
        existing.previousMetricTypeName ?? merged.previousMetricTypeName;
    }

    target.set(id, merged);
  }
}

/**
 * Panel OKR source of truth:
 * 1. Per-owner user KR lists (fiscal year only — no session filter; session hides own KRs on plans)
 * 2. Per-KR GET by id for plan KRs still missing metric metadata after owner lists settle
 */
export function usePanelKeyResultItems(
  plans: PlanSummary[],
  fiscalYearId?: string,
  loggedInUserId?: string,
) {
  const ownerUserIds = useMemo(
    () => collectPlanOwnerUserIds(plans, loggedInUserId),
    [plans, loggedInUserId],
  );

  const planKeyResultIds = useMemo(
    () => collectPlanKeyResultIds(plans),
    [plans],
  );

  const ownerQueries = useQueries(
    ownerUserIds.map((ownerId) => ({
      queryKey: [
        'ObjectiveInformation',
        ownerId,
        fiscalYearId,
        'panel-no-session',
      ],
      queryFn: () => getKeyResultByUser(ownerId, fiscalYearId, undefined),
      enabled: Boolean(ownerId),
      staleTime: 0,
      refetchOnMount: 'always' as const,
      keepPreviousData: true,
      retry: 1,
    })),
  );

  const ownerQueryData = ownerQueries.map((q) => q.data);
  const ownerQueryUpdatedAt = ownerQueries
    .map((q) => q.dataUpdatedAt ?? 0)
    .join('|');
  // Use isLoading only — isFetching would wipe detail queries during background refetch.
  const ownersSettled =
    ownerUserIds.length === 0 || ownerQueries.every((q) => !q.isLoading);

  const ownerItemsById = useMemo(() => {
    const byId = new Map<string, any>();
    for (const data of ownerQueryData) {
      mergeKeyResultRecords(byId, normalizeUserKeyResultItems(data));
    }
    return byId;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on fetched payloads
  }, [ownerQueryUpdatedAt]);

  const missingMetricKrIds = useMemo(() => {
    if (!ownersSettled) return [] as string[];
    return planKeyResultIds.filter((id) => {
      const row = ownerItemsById.get(id);
      return !hasKrMetricMetadata(row);
    });
  }, [ownersSettled, planKeyResultIds, ownerItemsById]);

  const krDetailQueries = useQueries(
    missingMetricKrIds.map((krId) => ({
      queryKey: ['keyResultForPanel', krId, fiscalYearId],
      queryFn: async () => {
        const raw = await fetchKeyResultFromPlanning(krId);
        return unwrapKeyResultPayload(raw);
      },
      enabled: Boolean(krId) && ownersSettled,
      staleTime: 60_000,
      keepPreviousData: true,
      retry: 1,
    })),
  );

  const krDetailQueryData = krDetailQueries.map((q) => q.data);
  const krDetailUpdatedAt = krDetailQueries
    .map((q) => q.dataUpdatedAt ?? 0)
    .join('|');

  const items = useMemo(() => {
    const byId = new Map<string, any>(ownerItemsById);

    for (const data of krDetailQueryData) {
      const kr = unwrapKeyResultPayload(data) ?? data;
      if (
        kr &&
        typeof kr === 'object' &&
        kr.id != null &&
        kr.deletedAt == null
      ) {
        // Fill gaps only — never overwrite richer owner-list metric metadata.
        mergeKeyResultRecords(byId, [kr]);
      }
    }

    return [...byId.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on fetched payloads
  }, [ownerItemsById, krDetailUpdatedAt]);

  const isLoading =
    ownerQueries.some((q) => q.isLoading) ||
    (missingMetricKrIds.length > 0 && krDetailQueries.some((q) => q.isLoading));
  const isFetching =
    ownerQueries.some((q) => q.isFetching) ||
    krDetailQueries.some((q) => q.isFetching);

  return { items, isLoading, isFetching, ownerUserIds, planKeyResultIds };
}
