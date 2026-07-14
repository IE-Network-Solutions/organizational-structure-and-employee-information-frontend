import { useMemo } from 'react';
import { useQueries } from 'react-query';
import {
  fetchKeyResultFromPlanning,
  getKeyResultByUser,
} from '@/store/server/features/okrplanning/okr/keyresult/queries';
import {
  collectPlanKeyResultIds,
  collectPlanOwnerUserIds,
  normalizeUserKeyResultItems,
} from './mergeKRPanelGroups';
import type { PlanSummary } from '../types';

function hasMetricMetadata(kr: any): boolean {
  if (!kr) return false;
  if (typeof kr.metricType === 'string' && kr.metricType.trim()) return true;
  if (
    kr.metricType &&
    typeof kr.metricType === 'object' &&
    String(kr.metricType.name ?? '').trim()
  ) {
    return true;
  }
  if (String(kr.key_type ?? '').trim()) return true;
  if (String(kr.metricTypeName ?? '').trim()) return true;
  return false;
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

    const incomingHasMetric = hasMetricMetadata(kr);
    const existingHasMetric = hasMetricMetadata(existing);
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
      merged.metricTypeName =
        existing.metricTypeName ?? merged.metricTypeName;
    }

    target.set(id, merged);
  }
}

/**
 * Panel OKR source of truth:
 * 1. Per-owner user KR lists (fiscal year only — no session filter; session hides own KRs on plans)
 * 2. Per-KR GET by id for every KR linked on visible plans (fills gaps for own / cross-session KRs)
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
    })),
  );

  const krDetailQueries = useQueries(
    planKeyResultIds.map((krId) => ({
      queryKey: ['keyResultForPanel', krId, fiscalYearId],
      queryFn: () => fetchKeyResultFromPlanning(krId),
      enabled: Boolean(krId),
      staleTime: 60_000,
      keepPreviousData: true,
      retry: 1,
    })),
  );

  const ownerQueryData = ownerQueries.map((q) => q.data);
  const krDetailQueryData = krDetailQueries.map((q) => q.data);

  const items = useMemo(() => {
    const byId = new Map<string, any>();

    for (const data of ownerQueryData) {
      mergeKeyResultRecords(byId, normalizeUserKeyResultItems(data));
    }

    for (const kr of krDetailQueryData) {
      if (kr && typeof kr === 'object' && kr.id != null && kr.deletedAt == null) {
        // Fill gaps only — never overwrite richer owner-list metric metadata.
        mergeKeyResultRecords(byId, [kr]);
      }
    }

    return [...byId.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on fetched payloads, not query object identity
  }, [ownerQueryData, krDetailQueryData]);

  const isLoading =
    ownerQueries.some((q) => q.isLoading) ||
    (planKeyResultIds.length > 0 && krDetailQueries.some((q) => q.isLoading));
  const isFetching =
    ownerQueries.some((q) => q.isFetching) ||
    krDetailQueries.some((q) => q.isFetching);

  return { items, isLoading, isFetching, ownerUserIds, planKeyResultIds };
}
