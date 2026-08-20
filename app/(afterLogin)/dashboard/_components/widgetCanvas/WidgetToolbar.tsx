'use client';

import { Button, Popconfirm, Tooltip } from 'antd';
import { Pencil, Plus, RotateCcw } from 'lucide-react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardLayoutStore } from '@/store/uistate/features/dashboard/layout';
import { layoutStorageKey } from './types';
import type { DashboardPlanView } from './types';

interface WidgetToolbarProps {
  plan: DashboardPlanView;
}

const WidgetToolbar = ({ plan }: WidgetToolbarProps) => {
  const userId = useAuthenticationStore((state) => state.userId);
  const storageKey = layoutStorageKey(userId || 'anonymous', plan);
  const isEditing = useDashboardLayoutStore((state) => state.isEditing);
  const setIsEditing = useDashboardLayoutStore((state) => state.setIsEditing);
  const setIsCatalogOpen = useDashboardLayoutStore(
    (state) => state.setIsCatalogOpen,
  );
  const resetLayout = useDashboardLayoutStore((state) => state.resetLayout);

  if (!isEditing) {
    return (
      <Tooltip title="Edit layout">
        <Button
          id="dashboard-widget-edit-button"
          data-cy="dashboard-widget-edit-button"
          type="text"
          aria-label="Edit layout"
          icon={<Pencil size={16} />}
          onClick={() => setIsEditing(true)}
        />
      </Tooltip>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-cy="dashboard-widget-toolbar-edit"
    >
      <Button
        id="dashboard-widget-catalog-button"
        data-cy="dashboard-widget-catalog-button"
        icon={<Plus size={14} />}
        onClick={() => setIsCatalogOpen(true)}
      >
        Add widgets
      </Button>
      <Popconfirm
        title="Reset dashboard layout?"
        description="This restores the default layout for your current plan."
        okText="Reset"
        cancelText="Cancel"
        onConfirm={() => resetLayout(storageKey, plan)}
      >
        <Button
          id="dashboard-widget-reset-button"
          data-cy="dashboard-widget-reset-button"
          icon={<RotateCcw size={14} />}
        >
          Reset
        </Button>
      </Popconfirm>
      <Button
        id="dashboard-widget-done-button"
        data-cy="dashboard-widget-done-button"
        type="primary"
        onClick={() => setIsEditing(false)}
      >
        Done
      </Button>
    </div>
  );
};

export default WidgetToolbar;
