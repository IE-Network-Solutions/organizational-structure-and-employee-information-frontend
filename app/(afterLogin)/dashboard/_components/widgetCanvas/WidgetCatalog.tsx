'use client';

import { Button, Modal } from 'antd';
import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardLayoutStore } from '@/store/uistate/features/dashboard/layout';
import { layoutStorageKey } from './types';
import type { DashboardPlanView } from './types';
import { defaultLayoutForPlan, widgetsForPlan } from './layoutHelpers';
import { widgetById } from './registry';
import './styles.css';

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
      width="90vw"
      rootClassName="dashboard-widget-catalog-modal"
      styles={{
        content: { maxWidth: 1280, margin: '0 auto' },
        body: { maxHeight: '80vh', overflowY: 'auto' },
      }}
      data-cy="dashboard-widget-catalog-modal"
    >
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        data-cy="dashboard-widget-catalog-list"
      >
        {rows.map((widget) => {
          const isOnDashboard = onDashboardIds.has(widget.id);
          const definition = widgetById[widget.id];
          const WidgetComponent = definition?.Component;
          const spansFullWidth = widget.minW >= 60;
          return (
            <div
              key={widget.id}
              className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white${
                spansFullWidth ? ' sm:col-span-2' : ''
              }`}
              data-cy={`dashboard-widget-catalog-row-${widget.id}`}
            >
              <div
                className="dashboard-widget-catalog-preview"
                data-cy={`dashboard-widget-catalog-preview-${widget.id}`}
              >
                {WidgetComponent && <WidgetComponent />}
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div
                  className="min-w-0"
                  data-cy={`dashboard-widget-catalog-meta-${widget.id}`}
                >
                  <span
                    className="block text-base font-medium text-gray-800"
                    data-cy={`dashboard-widget-catalog-title-${widget.id}`}
                  >
                    {widget.title}
                  </span>
                  <span
                    className="block text-sm text-gray-500"
                    data-cy={`dashboard-widget-catalog-status-${widget.id}`}
                  >
                    {isOnDashboard ? 'On dashboard' : 'Removed'}
                  </span>
                </div>
                <Button
                  id={`dashboard-widget-catalog-add-${widget.id}`}
                  data-cy={`dashboard-widget-catalog-add-${widget.id}`}
                  type="primary"
                  disabled={isOnDashboard}
                  onClick={() => showWidget(storageKey, widget.id, plan)}
                >
                  {isOnDashboard ? 'Added' : 'Add'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default WidgetCatalog;
