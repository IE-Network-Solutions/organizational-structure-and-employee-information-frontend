'use client';

import classNames from 'classnames';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

export type PlanningTasksViewMode = 'list' | 'grouped';

const VIEW_OPTIONS: { value: PlanningTasksViewMode; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'grouped', label: 'Grouped' },
];

function viewModeLabel(mode: PlanningTasksViewMode): string {
  return VIEW_OPTIONS.find((o) => o.value === mode)?.label ?? 'List';
}

export default function PlanningViewFilter() {
  const { planningTasksViewMode, setPlanningTasksViewMode } =
    PlanningAndReportingStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems: MenuProps['items'] = VIEW_OPTIONS.map((o) => ({
    key: o.value,
    label: o.label,
    onClick: () => {
      setPlanningTasksViewMode(o.value);
      setMenuOpen(false);
    },
  }));

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-cy="planning-view-filter"
    >
      <Dropdown
        menu={{
          items: menuItems,
          selectable: true,
          selectedKeys: [planningTasksViewMode],
        }}
        trigger={['click']}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        placement="bottomLeft"
      >
        <button
          type="button"
          data-cy="planning-view-filter-trigger"
          aria-label="View mode"
          aria-expanded={menuOpen}
          className={classNames(
            'inline-flex h-9 min-w-[128px] max-w-[220px] items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-left text-[13px] font-medium text-[#161A2C] transition-colors hover:border-[#BFDBFE] hover:bg-[#F8FAFC]',
            menuOpen && 'border-[#BFDBFE] ring-2 ring-[#1E40AF]/10',
          )}
        >
          <span
            data-cy="planning-view-filter-label"
            className="min-w-0 truncate"
          >
            {viewModeLabel(planningTasksViewMode)}
          </span>
          <DownOutlined className="shrink-0 text-[10px] text-[#8F94A3]" />
        </button>
      </Dropdown>
    </div>
  );
}
