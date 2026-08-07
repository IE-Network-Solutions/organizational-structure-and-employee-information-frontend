import { create } from 'zustand';

/**
 * Absolute OKR key-result currentValue overrides.
 * Delta patches race with stale ObjectiveInformation refetches; absolute
 * sticky values can be re-applied safely after every refetch.
 *
 * Sticky is intentionally kept for the session after an edit — clearing on the
 * first API match raced with a later stale refetch and snapped progress back.
 */
type RecentOkrMetricOverridesState = {
  /** keyResultId → sticky currentValue */
  currentByKrId: Record<string, number>;
  remember: (krId: string, currentValue: number) => void;
  get: (krId: string | number | null | undefined) => number | undefined;
  /** Drop sticky only when explicitly requested (new session / clear). */
  clearKr: (krId: string) => void;
  clear: () => void;
};

export const useRecentOkrMetricOverrides =
  create<RecentOkrMetricOverridesState>()((set, get) => ({
    currentByKrId: {},
    remember: (krId, currentValue) => {
      if (!krId || !Number.isFinite(currentValue)) return;
      set({
        currentByKrId: {
          ...get().currentByKrId,
          [String(krId)]: currentValue,
        },
      });
    },
    get: (krId) => {
      if (krId == null) return undefined;
      return get().currentByKrId[String(krId)];
    },
    clearKr: (krId) => {
      const key = String(krId);
      if (get().currentByKrId[key] === undefined) return;
      const next = { ...get().currentByKrId };
      delete next[key];
      set({ currentByKrId: next });
    },
    clear: () => set({ currentByKrId: {} }),
  }));

export function rememberOkrCurrentValue(
  krId: string,
  currentValue: number,
): void {
  useRecentOkrMetricOverrides.getState().remember(krId, currentValue);
}

export function getStickyOkrCurrentValue(
  krId: string | number | null | undefined,
): number | undefined {
  return useRecentOkrMetricOverrides.getState().get(krId);
}

export function applyStickyOkrCurrentValue<T extends { currentValue?: any }>(
  kr: T,
): T {
  if (!kr || (kr as any).id == null) return kr;
  const sticky = getStickyOkrCurrentValue((kr as any).id);
  if (sticky === undefined) return kr;
  return { ...kr, currentValue: sticky };
}
