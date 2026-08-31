'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetDashboardWidgetLayout } from '@/store/server/features/dashboard/widget-layout/queries';
import {
  useResetDashboardWidgetLayout,
  useSaveDashboardWidgetLayout,
} from '@/store/server/features/dashboard/widget-layout/mutations';
import { isDashboardLayoutForUser } from '@/store/server/features/dashboard/widget-layout/normalize';
import type { DashboardWidgetLayoutRow } from '@/store/server/features/dashboard/widget-layout/interface';
import { GRID_COLUMNS } from './constants';
import { getDefaultLayout } from './defaultLayouts';
import { findFreeSlot } from './gridEngine';
import { getPlanWidgetIds, getWidgetDefinition } from './widgetRegistry';
import type {
  DashboardPlanKey,
  DashboardWidgetLayoutItem,
  DashboardWidgetPlacement,
} from './types';

/** Edits are coalesced for this long before one PUT replaces the layout. */
const SAVE_DEBOUNCE_MS = 800;

function toInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

/** Clamps a stored slot to something this build can actually render. */
function sanitizePlacement(
  widgetId: string,
  slot: Partial<DashboardWidgetLayoutItem>,
  isVisible: boolean,
): DashboardWidgetPlacement | null {
  const definition = getWidgetDefinition(widgetId);
  if (!definition) return null;

  const w = Math.min(
    GRID_COLUMNS,
    Math.max(definition.minW, toInteger(slot.w, definition.defaultW)),
  );
  const h = Math.max(definition.minH, toInteger(slot.h, definition.defaultH));
  const x = Math.min(GRID_COLUMNS - w, Math.max(0, toInteger(slot.x, 0)));
  const y = Math.max(0, toInteger(slot.y, 0));

  return { id: widgetId, x, y, w, h, isVisible };
}

function hiddenPlacement(widgetId: string): DashboardWidgetPlacement | null {
  const definition = getWidgetDefinition(widgetId);
  if (!definition) return null;
  return {
    id: widgetId,
    x: 0,
    y: 0,
    w: definition.defaultW,
    h: definition.defaultH,
    isVisible: false,
  };
}

/**
 * Turns the API rows into placements for every widget this plan offers.
 *
 * No rows at all means the user has never customized this plan, so they get its
 * default layout. Otherwise the stored rows win, and any widget the rows don't
 * mention — one added in a later release — starts out hidden, ready to be
 * picked from the catalog.
 */
function placementsFromRows(
  rows: DashboardWidgetLayoutRow[] | undefined,
  planKey: DashboardPlanKey,
): DashboardWidgetPlacement[] {
  const planWidgetIds = getPlanWidgetIds(planKey);

  if (!rows || rows.length === 0) {
    const defaults = getDefaultLayout(planKey);
    const placed = new Set(defaults.map((item) => item.id));
    return [
      ...defaults.map((item) => ({ ...item, isVisible: true })),
      ...planWidgetIds
        .filter((id) => !placed.has(id))
        .map(hiddenPlacement)
        .filter((item): item is DashboardWidgetPlacement => Boolean(item)),
    ];
  }

  const allowed = new Set(planWidgetIds);
  const seen = new Set<string>();
  const placements: DashboardWidgetPlacement[] = [];

  rows.forEach((row) => {
    if (!allowed.has(row.widgetId) || seen.has(row.widgetId)) return;
    const placement = sanitizePlacement(row.widgetId, row, row.isVisible);
    if (!placement) return;
    seen.add(row.widgetId);
    placements.push(placement);
  });

  planWidgetIds
    .filter((id) => !seen.has(id))
    .forEach((id) => {
      const placement = hiddenPlacement(id);
      if (placement) placements.push(placement);
    });

  return placements;
}

export function useDashboardLayout(userId: string, planKey: DashboardPlanKey) {
  const { data: response, isFetched } = useGetDashboardWidgetLayout(
    userId,
    planKey,
  );
  const saveMutation = useSaveDashboardWidgetLayout(userId);
  const resetMutation = useResetDashboardWidgetLayout(userId);

  const [placements, setPlacements] = useState<
    DashboardWidgetPlacement[] | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);

  // Which user's layout is currently in `placements`, as reported by the API.
  // Scoping on the server's answer rather than on the auth store means a stale
  // client-side userId cannot leak one user's dashboard into another's session.
  const hydratedScopeRef = useRef<string | null>(null);

  // Mutations are new objects every render; the refs keep the callbacks below
  // stable, which matters because DashboardGrid holds one across a drag.
  const saveMutationRef = useRef(saveMutation);
  saveMutationRef.current = saveMutation;
  const resetMutationRef = useRef(resetMutation);
  resetMutationRef.current = resetMutation;

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The layout waiting to be sent, and whether a PUT is already on the wire.
  const queuedPlacementsRef = useRef<DashboardWidgetPlacement[] | null>(null);
  const isSavingRef = useRef(false);

  const cancelPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    queuedPlacementsRef.current = null;
  }, []);

  useEffect(() => cancelPendingSave, [cancelPendingSave]);

  // Blank the canvas the moment the signed-in user or plan changes, so the
  // previous layout is never on screen while the refetch is in flight.
  useEffect(() => {
    hydratedScopeRef.current = null;
    cancelPendingSave();
    setPlacements(null);
    setIsEditing(false);
  }, [userId, planKey, cancelPendingSave]);

  useEffect(() => {
    if (!isFetched || !response) return;
    if (!isDashboardLayoutForUser(response, userId)) {
      // Shared cache / identity drift served someone else's layout. Do not
      // render it and do not queue a save that would copy it onto this user.
      cancelPendingSave();
      return;
    }
    const responseScope = `${response.userId}:${response.plan}`;
    if (hydratedScopeRef.current === responseScope) return;

    // The layout that came back belongs to a different user or plan than the
    // one held in state — drop whatever the previous scope had queued so it
    // cannot be written under this identity.
    cancelPendingSave();
    hydratedScopeRef.current = responseScope;
    setIsEditing(false);
    setPlacements(placementsFromRows(response.items, planKey));
  }, [isFetched, response, planKey, userId, cancelPendingSave]);

  /**
   * Sends the queued layout, but only ever one request at a time. Debouncing
   * alone is not enough: a slow save would still be in flight when the next one
   * fires, and two overlapping writes for the same scope race each other in the
   * database. Anything queued while a save is on the wire goes out right after.
   */
  const flushSave = useCallback(() => {
    if (isSavingRef.current) return;
    const next = queuedPlacementsRef.current;
    if (!next) return;

    queuedPlacementsRef.current = null;
    isSavingRef.current = true;
    const scopeAtSend = hydratedScopeRef.current;

    saveMutationRef.current.mutate(
      {
        plan: planKey,
        fallbackUserId: userId,
        items: next.map((item) => ({
          widgetId: item.id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          isVisible: item.isVisible,
        })),
      },
      {
        onError: () =>
          NotificationMessage.error({
            message: 'Dashboard layout not saved',
            description:
              'Your changes are still on screen but could not be saved. Please try again.',
          }),
        onSettled: () => {
          isSavingRef.current = false;
          // If the signed-in user changed while this was in flight, anything
          // still queued belongs to the previous session — do not send it.
          if (hydratedScopeRef.current !== scopeAtSend) return;
          flushSaveRef.current();
        },
      },
    );
  }, [planKey, userId]);

  const flushSaveRef = useRef(flushSave);
  flushSaveRef.current = flushSave;

  const scheduleSave = useCallback(
    (next: DashboardWidgetPlacement[]) => {
      cancelPendingSave();
      queuedPlacementsRef.current = next;
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        flushSaveRef.current();
      }, SAVE_DEBOUNCE_MS);
    },
    [cancelPendingSave],
  );

  /** Applies a change to the placements and queues the save that follows it. */
  const commitPlacements = useCallback(
    (
      updater: (
        current: DashboardWidgetPlacement[],
      ) => DashboardWidgetPlacement[],
    ) => {
      setPlacements((current) => {
        if (!current) return current;
        const next = updater(current);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const layout = useMemo<DashboardWidgetLayoutItem[]>(
    () =>
      (placements ?? [])
        .filter((item) => item.isVisible)
        .map(({ id, x, y, w, h }) => ({ id, x, y, w, h })),
    [placements],
  );

  const hiddenWidgetIds = useMemo(
    () =>
      (placements ?? [])
        .filter((item) => !item.isVisible)
        .map((item) => item.id),
    [placements],
  );

  /** Takes the visible-only layout the grid produces and folds it back in. */
  const commitLayout = useCallback(
    (nextLayout: DashboardWidgetLayoutItem[]) => {
      const byId = new Map(nextLayout.map((item) => [item.id, item]));
      commitPlacements((current) =>
        current.map((placement) => {
          const moved = byId.get(placement.id);
          return moved
            ? { ...placement, ...moved, isVisible: true }
            : placement;
        }),
      );
    },
    [commitPlacements],
  );

  const hideWidget = useCallback(
    (id: string) => {
      commitPlacements((current) =>
        current.map((placement) =>
          placement.id === id ? { ...placement, isVisible: false } : placement,
        ),
      );
    },
    [commitPlacements],
  );

  const addWidget = useCallback(
    (id: string) => {
      commitPlacements((current) => {
        const target = current.find((placement) => placement.id === id);
        if (!target || target.isVisible) return current;

        const visible = current.filter((placement) => placement.isVisible);
        const { x, y } = findFreeSlot(visible, target.w, target.h);

        return current.map((placement) =>
          placement.id === id
            ? { ...placement, x, y, isVisible: true }
            : placement,
        );
      });
    },
    [commitPlacements],
  );

  const resetLayout = useCallback(() => {
    cancelPendingSave();
    setPlacements(placementsFromRows(undefined, planKey));
    resetMutationRef.current.mutate(planKey, {
      onError: () =>
        NotificationMessage.error({
          message: 'Dashboard layout not reset',
          description:
            'The default layout is shown but could not be saved. Please try again.',
        }),
    });
  }, [planKey, cancelPendingSave]);

  return {
    layout,
    commitLayout,
    isReady: placements !== null,
    isEditing,
    setIsEditing,
    hiddenWidgetIds,
    hideWidget,
    addWidget,
    resetLayout,
    isSaving: saveMutation.isLoading || resetMutation.isLoading,
  };
}
