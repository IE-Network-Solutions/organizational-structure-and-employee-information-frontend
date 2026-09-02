'use client';

import { Button, Empty, Modal } from 'antd';
import { rowsToPixels } from './constants';
import { getWidgetDefinition } from './widgetRegistry';
import type { DashboardPlanView } from './types';

interface AddWidgetModalProps {
  open: boolean;
  plan: DashboardPlanView;
  /** Widgets available to this plan that are not on the dashboard right now. */
  hiddenWidgetIds: string[];
  onAdd: (id: string) => void;
  onClose: () => void;
}

/**
 * Catalog of the widgets a user can bring back. Every entry renders the real,
 * live widget at the size it will take on the dashboard — a 12 column grid, so
 * a full-width widget such as the Calendar spans the whole modal.
 */
export default function AddWidgetModal({
  open,
  plan,
  hiddenWidgetIds,
  onAdd,
  onClose,
}: AddWidgetModalProps) {
  const definitions = hiddenWidgetIds
    .map((id) => getWidgetDefinition(id))
    .filter(Boolean);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200, top: 32 }}
      title={
        <span
          className="text-lg font-bold"
          data-cy="dashboard-add-widget-title"
        >
          Add widgets
        </span>
      }
      data-cy="dashboard-add-widget-modal"
    >
      {definitions.length === 0 ? (
        <Empty
          description="Every widget is already on your dashboard"
          data-cy="dashboard-add-widget-empty"
        />
      ) : (
        <div
          className="grid grid-cols-12 gap-4 pb-2"
          data-cy="dashboard-add-widget-catalog"
        >
          {definitions.map((definition) => {
            if (!definition) return null;
            return (
              <div
                key={definition.id}
                className="flex flex-col gap-2"
                style={{ gridColumn: `span ${definition.defaultW}` }}
                data-cy={`dashboard-add-widget-item-${definition.id}`}
              >
                <div
                  className="flex items-center justify-between gap-2"
                  data-cy={`dashboard-add-widget-item-header-${definition.id}`}
                >
                  <span
                    className="truncate text-sm font-semibold text-gray-800"
                    data-cy={`dashboard-add-widget-item-title-${definition.id}`}
                  >
                    {definition.title}
                  </span>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => onAdd(definition.id)}
                    data-cy={`dashboard-add-widget-item-add-${definition.id}`}
                  >
                    Add
                  </Button>
                </div>
                <div
                  className="overflow-hidden rounded-lg [&>*]:min-h-full pointer-events-none"
                  style={{ height: rowsToPixels(definition.defaultH) }}
                  data-cy={`dashboard-add-widget-item-preview-${definition.id}`}
                >
                  {definition.render(plan)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
