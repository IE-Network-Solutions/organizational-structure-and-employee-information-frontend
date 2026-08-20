'use client';

import { Button, Modal } from 'antd';
import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardLayoutStore } from '@/store/uistate/features/dashboard/layout';
import { layoutStorageKey } from './types';
import type { DashboardPlanView } from './types';
import { defaultLayoutForPlan, widgetsForPlan } from './layoutHelpers';

interface WidgetCatalogProps {
  plan: DashboardPlanView;
}

const WidgetCatalog = ({ plan }: WidgetCatalogProps) => {
  const userId = useAuthenticationStore((state) => state.userId);
  const storageKey = layoutStorageKey(userId || 'anonymous', plan);
  const isCatalogOpen = useDashboardLayoutStore((state) => state.isCatalogOpen);
  const setIsCatalogOpen = useDashboardLayoutStore(
    (state) => state.setIsCatalogOpen,
  );
  const layoutsByKey = useDashboardLayoutStore((state) => state.layoutsByKey);
  const layoutEpoch = useDashboardLayoutStore((state) => state.layoutEpoch);
  const showWidget = useDashboardLayoutStore((state) => state.showWidget);

  const savedLayout = layoutsByKey[storageKey];
  const { onDashboardIds, rows } = useMemo(() => {
    const layoutItems =
      savedLayout && savedLayout.length > 0
        ? savedLayout
        : defaultLayoutForPlan(plan);
    const visibleIds = new Set(
      layoutItems.filter((item) => item.hidden !== true).map((item) => item.i),
    );
    const planWidgets = widgetsForPlan(plan);
    const removedWidgets = planWidgets.filter(
      (widget) => !visibleIds.has(widget.id),
    );
    const addedWidgets = planWidgets.filter((widget) =>
      visibleIds.has(widget.id),
    );
    return {
      onDashboardIds: visibleIds,
      rows: [...removedWidgets, ...addedWidgets],
    };
  }, [savedLayout, plan, layoutEpoch]);

  return (
    <Modal
      title="Widget repository"
      open={isCatalogOpen}
      onCancel={() => setIsCatalogOpen(false)}
      footer={null}
      centered
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      data-cy="dashboard-widget-catalog-modal"
    >
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        data-cy="dashboard-widget-catalog-list"
      >
        {rows.map((widget) => {
          const isOnDashboard = onDashboardIds.has(widget.id);
          return (
            <div
              key={widget.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
              data-cy={`dashboard-widget-catalog-row-${widget.id}`}
            >
              <div
                className="min-w-0"
                data-cy={`dashboard-widget-catalog-meta-${widget.id}`}
              >
                <span
                  className="block text-sm font-medium text-gray-800"
                  data-cy={`dashboard-widget-catalog-title-${widget.id}`}
                >
                  {widget.title}
                </span>
                <span
                  className="block text-xs text-gray-500"
                  data-cy={`dashboard-widget-catalog-status-${widget.id}`}
                >
                  {isOnDashboard ? 'On dashboard' : 'Removed'}
                </span>
              </div>
              <Button
                id={`dashboard-widget-catalog-add-${widget.id}`}
                data-cy={`dashboard-widget-catalog-add-${widget.id}`}
                type="primary"
                size="small"
                disabled={isOnDashboard}
                onClick={() => showWidget(storageKey, widget.id, plan)}
              >
                {isOnDashboard ? 'Added' : 'Add'}
              </Button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default WidgetCatalog;
