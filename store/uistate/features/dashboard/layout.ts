import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type {
  DashboardLayoutItem,
  DashboardPlanView,
  DashboardWidgetId,
} from '@/app/(afterLogin)/dashboard/_components/widgetCanvas/types';
import {
  clampLayoutItem,
  defaultLayoutForPlan,
  packLayout,
  resolveLayout,
  widgetMetaById,
} from '@/app/(afterLogin)/dashboard/_components/widgetCanvas/layoutHelpers';

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

interface DashboardLayoutState {
  layoutsByKey: Record<string, DashboardLayoutItem[]>;
  isEditing: boolean;
  isCatalogOpen: boolean;
  hasHydrated: boolean;
  layoutEpoch: number;
  setIsEditing: (isEditing: boolean) => void;
  setIsCatalogOpen: (isCatalogOpen: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setLayout: (storageKey: string, items: DashboardLayoutItem[]) => void;
  resetLayout: (storageKey: string, plan: DashboardPlanView) => void;
  hideWidget: (
    storageKey: string,
    widgetId: DashboardWidgetId,
    plan: DashboardPlanView,
  ) => void;
  showWidget: (
    storageKey: string,
    widgetId: DashboardWidgetId,
    plan: DashboardPlanView,
  ) => void;
}

const nextY = (items: DashboardLayoutItem[]) =>
  items
    .filter((item) => !item.hidden)
    .reduce((max, item) => Math.max(max, item.y + item.h), 0);

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  devtools(
    persist(
      (set) => ({
        layoutsByKey: {},
        isEditing: false,
        isCatalogOpen: false,
        hasHydrated: false,
        layoutEpoch: 0,
        setIsEditing: (isEditing) =>
          set((state) => ({
            isEditing,
            isCatalogOpen: isEditing ? state.isCatalogOpen : false,
          })),
        setIsCatalogOpen: (isCatalogOpen) => set({ isCatalogOpen }),
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        setLayout: (storageKey, items) =>
          set((state) => ({
            layoutsByKey: {
              ...state.layoutsByKey,
              [storageKey]: packLayout(items),
            },
          })),
        resetLayout: (storageKey, plan) =>
          set((state) => ({
            layoutEpoch: state.layoutEpoch + 1,
            layoutsByKey: {
              ...state.layoutsByKey,
              [storageKey]: packLayout(defaultLayoutForPlan(plan)),
            },
          })),
        hideWidget: (storageKey, widgetId, plan) =>
          set((state) => {
            const current =
              state.layoutsByKey[storageKey] &&
              state.layoutsByKey[storageKey].length > 0
                ? state.layoutsByKey[storageKey]
                : defaultLayoutForPlan(plan);
            const hasWidget = current.some((item) => item.i === widgetId);
            const nextItems = hasWidget
              ? current.map((item) =>
                  item.i === widgetId ? { ...item, hidden: true } : item,
                )
              : [
                  ...current,
                  { i: widgetId, x: 0, y: 0, w: 1, h: 1, hidden: true },
                ];
            return {
              layoutEpoch: state.layoutEpoch + 1,
              layoutsByKey: {
                ...state.layoutsByKey,
                [storageKey]: packLayout(nextItems),
              },
            };
          }),
        showWidget: (storageKey, widgetId, plan) =>
          set((state) => {
            const current = resolveLayout(state.layoutsByKey[storageKey], plan);
            const existing = current.find((item) => item.i === widgetId);
            const def = widgetMetaById[widgetId];
            if (!def) return state;
            const y = nextY(current);
            const nextItems = existing
              ? current.map((item) =>
                  item.i === widgetId ? { ...item, hidden: false, y } : item,
                )
              : [
                  ...current,
                  clampLayoutItem({
                    i: widgetId,
                    x: 0,
                    y,
                    w: def.minW,
                    h: def.minH,
                  }),
                ];
            return {
              layoutEpoch: state.layoutEpoch + 1,
              layoutsByKey: {
                ...state.layoutsByKey,
                [storageKey]: packLayout(nextItems),
              },
            };
          }),
      }),
      {
        name: 'selamnew-dashboard-layout',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined' ? localStorage : noopStorage,
        ),
        partialize: (state) => ({
          layoutsByKey: state.layoutsByKey,
        }),
        onRehydrateStorage: () => () => {
          useDashboardLayoutStore.getState().setHasHydrated(true);
        },
      },
    ),
  ),
);

if (typeof window !== 'undefined') {
  useDashboardLayoutStore.persist.onFinishHydration(() => {
    useDashboardLayoutStore.getState().setHasHydrated(true);
  });
  if (useDashboardLayoutStore.persist.hasHydrated()) {
    useDashboardLayoutStore.getState().setHasHydrated(true);
  }
}
