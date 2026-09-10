'use client';

import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, DatePicker, Dropdown, Popover } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { todayIso } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  defaultHistoryRange,
  formatHistoryRangeLabel,
  isPlanHistoryFilter,
  PLAN_FILTER_HISTORY,
  PLAN_FILTER_OPTIONS,
  planFilterLabel,
  planFilterValueToActivePeriod,
  type PlanFilterValue,
} from './durationFilter';

type HistoryRange = { from: string; to: string };

function toDayjsRange(range: HistoryRange): [Dayjs, Dayjs] {
  return [dayjs(range.from), dayjs(range.to)];
}

export default function PlanningDurationFilter() {
  const {
    planningDurationFilter,
    setPlanningDurationFilter,
    planningHistoryRange,
    setPlanningHistoryRange,
    setActivePlanPeriod,
    setPage,
  } = PlanningAndReportingStore();

  const isHistory = isPlanHistoryFilter(planningDurationFilter);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [draftRange, setDraftRange] =
    useState<HistoryRange>(planningHistoryRange);

  const triggerLabel = isHistory
    ? formatHistoryRangeLabel(planningHistoryRange)
    : planFilterLabel(planningDurationFilter);

  const presetRanges = useMemo(() => {
    const today = todayIso();
    return [
      {
        key: '7',
        label: 'Last 7 days',
        range: {
          from: dayjs(today).subtract(6, 'day').format('YYYY-MM-DD'),
          to: today,
        },
      },
      {
        key: '30',
        label: 'Last 30 days',
        range: {
          from: dayjs(today).subtract(29, 'day').format('YYYY-MM-DD'),
          to: today,
        },
      },
      {
        key: '90',
        label: 'Last 90 days',
        range: defaultHistoryRange(today),
      },
    ] as const;
  }, []);

  const applyPreset = (value: PlanFilterValue) => {
    setPlanningDurationFilter(value);
    if (!isPlanHistoryFilter(value)) {
      setActivePlanPeriod(planFilterValueToActivePeriod(value));
    }
    setPage(1);
    setMenuOpen(false);
    setRangeOpen(false);
  };

  const openCustomRange = () => {
    setDraftRange({ ...planningHistoryRange });
    setMenuOpen(false);
    setRangeOpen(true);
  };

  const applyCustomRange = () => {
    if (!draftRange.from || !draftRange.to) return;
    setPlanningHistoryRange(draftRange);
    setPlanningDurationFilter(PLAN_FILTER_HISTORY);
    setPage(1);
    setRangeOpen(false);
  };

  const closeCustomRange = () => {
    setDraftRange({ ...planningHistoryRange });
    setRangeOpen(false);
  };

  const menuItems: MenuProps['items'] = [
    ...PLAN_FILTER_OPTIONS.filter((o) => o.value !== PLAN_FILTER_HISTORY).map(
      (o) => ({
        key: o.value,
        label: o.label,
        onClick: () => applyPreset(o.value),
      }),
    ),
    { type: 'divider' as const },
    {
      key: PLAN_FILTER_HISTORY,
      label: 'Custom range…',
      onClick: openCustomRange,
    },
  ];

  const rangePanel = (
    <div
      className="flex w-[min(100vw-2rem,20rem)] flex-col gap-3 p-1"
      data-cy="planning-duration-custom-range-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <p
        data-cy="planning-and-reporting-components-planning-planningdurationfilter-tsx-planningdurationfilter-p-126"
        className="m-0 text-[12px] font-medium text-[#64748B]"
      >
        Custom range
      </p>
      <DatePicker.RangePicker
        size="middle"
        allowClear={false}
        value={toDayjsRange(draftRange)}
        onChange={(values) => {
          if (!values?.[0] || !values?.[1]) return;
          setDraftRange({
            from: values[0].format('YYYY-MM-DD'),
            to: values[1].format('YYYY-MM-DD'),
          });
        }}
        className="w-full"
        data-cy="planning-history-range"
      />
      <div
        data-cy="planning-and-reporting-components-planning-planningdurationfilter-tsx-planningdurationfilter-div-141"
        className="flex flex-wrap gap-1.5"
      >
        {presetRanges.map((p) => (
          <button
            key={p.key}
            type="button"
            data-cy={`planning-duration-preset-${p.key}`}
            onClick={() => setDraftRange(p.range)}
            className="rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[11px] font-medium text-[#475569] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#1E40AF]"
          >
            {p.label}
          </button>
        ))}
      </div>
      <div
        data-cy="planning-and-reporting-components-planning-planningdurationfilter-tsx-planningdurationfilter-div-154"
        className="flex justify-end gap-2 border-t border-[#F1F2F6] pt-2"
      >
        <Button
          size="small"
          onClick={closeCustomRange}
          data-cy="planning-duration-range-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          size="small"
          className="!bg-[#1E40AF] hover:!bg-[#1E3A8A]"
          onClick={applyCustomRange}
          data-cy="planning-duration-range-apply"
        >
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-cy="planning-duration-filter"
    >
      <Popover
        trigger={[]}
        open={rangeOpen}
        onOpenChange={(open) => {
          if (!open) closeCustomRange();
        }}
        placement="bottomRight"
        content={rangePanel}
        arrow={false}
        destroyTooltipOnHide
      >
        <Dropdown
          menu={{
            items: menuItems,
            selectable: true,
            selectedKeys: [planningDurationFilter],
          }}
          trigger={['click']}
          open={menuOpen}
          onOpenChange={(open) => {
            if (rangeOpen) return;
            setMenuOpen(open);
          }}
          placement="bottomRight"
        >
          <button
            type="button"
            data-cy="planning-duration-trigger"
            aria-label="Plan duration"
            aria-expanded={menuOpen || rangeOpen}
            className={classNames(
              'inline-flex h-9 min-w-[128px] max-w-[220px] items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-left text-[13px] font-medium text-[#161A2C] transition-colors hover:border-[#BFDBFE] hover:bg-[#F8FAFC]',
              (menuOpen || rangeOpen) &&
                'border-[#BFDBFE] ring-2 ring-[#1E40AF]/10',
            )}
          >
            <span
              data-cy="planning-and-reporting-components-planning-planningdurationfilter-tsx-planningdurationfilter-span-216"
              className="min-w-0 truncate"
            >
              {triggerLabel}
            </span>
            <DownOutlined className="shrink-0 text-[10px] text-[#8F94A3]" />
          </button>
        </Dropdown>
      </Popover>
    </div>
  );
}
