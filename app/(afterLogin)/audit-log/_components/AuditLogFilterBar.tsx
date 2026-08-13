'use client';

import { useState } from 'react';
import { Button, DatePicker, Input, Popover, Select } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  AUDIT_LOG_MODULE_OPTIONS,
  AUDIT_SEVERITIES,
  AuditLogFilters,
  AuditSeverity,
  PrototypeAuditPerson,
} from './types';
import { AUDIT_SELECT_CLASS, formatFullName, toDayjsRange } from './utils';

type FilterDraft = Omit<AuditLogFilters, 'search'>;

const emptyDraft = (): FilterDraft => ({
  actorId: undefined,
  targetId: undefined,
  severities: [],
  module: undefined,
  dateFrom: null,
  dateTo: null,
});

const toDraft = (filters: AuditLogFilters): FilterDraft => ({
  actorId: filters.actorId,
  targetId: filters.targetId,
  severities: [...filters.severities],
  module: filters.module,
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
});

interface AuditLogFilterBarProps {
  filters: AuditLogFilters;
  actors: PrototypeAuditPerson[];
  targets: PrototypeAuditPerson[];
  hideTargetFilter?: boolean;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onClear: () => void;
  onExport: () => void;
}

const AuditLogFilterBar = ({
  filters,
  actors,
  targets,
  hideTargetFilter = false,
  onFiltersChange,
  onExport,
}: AuditLogFilterBarProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(() => toDraft(filters));

  const handleOpenChange = (open: boolean) => {
    if (open) setDraft(toDraft(filters));
    setFilterOpen(open);
  };

  const [dateFrom, dateTo] = toDayjsRange(draft.dateFrom, draft.dateTo);

  const handleReset = () => {
    const next = emptyDraft();
    setDraft(next);
    onFiltersChange({ ...filters, ...next });
  };

  const handleSave = () => {
    onFiltersChange({ ...filters, ...draft });
    setFilterOpen(false);
  };

  const filterContent = (
    <div
      className="md:w-[440px] w-full md:max-w-[calc(100vw-32px)] max-w-full px-4 py-2"
      data-cy="audit-log-filter-popover-content"
      id="audit-log-filter-popover-content"
    >
      <div
        className="flex justify-between items-start mb-1"
        data-cy="audit-log-filter-popover-header"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 m-0">Filter</h3>
          <p className="text-sm text-gray-500 mt-1 mb-0">
            Select All filters that apply
          </p>
        </div>
        <button
          type="button"
          aria-label="Close filter"
          onClick={() => setFilterOpen(false)}
          className="text-gray-400 hover:text-gray-600 leading-none text-xl font-medium"
          data-cy="audit-log-filter-close-button"
        >
          ×
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-5" data-cy="audit-log-filter-fields">
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Performed By
          </div>
          <Select
            allowClear
            showSearch
            placeholder="Select actor"
            value={draft.actorId}
            optionFilterProp="label"
            className={AUDIT_SELECT_CLASS}
            options={actors.map((person) => ({
              value: person.id,
              label: formatFullName(person),
            }))}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                actorId: value || undefined,
              }))
            }
            data-cy="audit-log-actor-select"
          />
        </div>

        {!hideTargetFilter && (
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">
              Affected Person
            </div>
            <Select
              allowClear
              showSearch
              placeholder="Select target"
              value={draft.targetId}
              optionFilterProp="label"
              className={AUDIT_SELECT_CLASS}
              options={targets.map((person) => ({
                value: person.id,
                label: formatFullName(person),
              }))}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  targetId: value || undefined,
                }))
              }
              data-cy="audit-log-target-select"
            />
          </div>
        )}

        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Severity Level
          </div>
          <Select
            mode="multiple"
            allowClear
            placeholder="Select severity"
            value={draft.severities}
            className={AUDIT_SELECT_CLASS}
            maxTagCount="responsive"
            options={AUDIT_SEVERITIES.map((severity) => ({
              value: severity,
              label: severity,
            }))}
            onChange={(value: AuditSeverity[]) =>
              setDraft((current) => ({
                ...current,
                severities: value || [],
              }))
            }
            data-cy="audit-log-severity-select"
          />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Module</div>
          <Select
            allowClear
            showSearch
            placeholder="Select module"
            value={draft.module}
            optionFilterProp="label"
            className={AUDIT_SELECT_CLASS}
            options={AUDIT_LOG_MODULE_OPTIONS}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                module: value || undefined,
              }))
            }
            data-cy="audit-log-module-select"
          />
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900 mb-2">Date</div>
          <DatePicker.RangePicker
            value={[dateFrom, dateTo]}
            format="YYYY-MM-DD"
            placeholder={['Start date', 'End date']}
            className="w-full h-10"
            onChange={(dates) =>
              setDraft((current) => ({
                ...current,
                dateFrom: dates?.[0]?.format('YYYY-MM-DD') ?? null,
                dateTo: dates?.[1]?.format('YYYY-MM-DD') ?? null,
              }))
            }
            data-cy="audit-log-date-range-picker"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={handleReset}
          className="transition-colors hover:bg-gray-100 hover:border-gray-300"
          data-cy="audit-log-filter-reset-button"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          data-cy="audit-log-filter-save-button"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="flex items-center justify-between gap-2 flex-wrap"
      data-cy="audit-log-filter-bar"
      id="audit-log-filter-bar"
    >
      <Input
        allowClear
        placeholder="Search by actor (e.g., Wongel) or target (e.g., Abel)..."
        value={filters.search}
        onChange={(event) =>
          onFiltersChange({ ...filters, search: event.target.value })
        }
        className="w-full sm:w-[320px] h-10"
        suffix={
          <div className="text-gray-400 border-l border-gray-300 py-1 pl-2">
            <SearchOutlined />
          </div>
        }
        data-cy="audit-log-search-input"
        id="audit-log-search-input"
      />

      <div className="flex items-center gap-2 ml-auto">
        <Popover
          content={filterContent}
          trigger="click"
          open={filterOpen}
          onOpenChange={handleOpenChange}
          placement="bottomRight"
          align={{
            offset: [0, 4],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => document.body}
          data-cy="audit-log-filter-popover"
        >
          <Button
            type="default"
            className="h-10 flex items-center gap-2 border border-gray-200 text-gray-700 bg-white"
            icon={<FilterAltOutlinedIcon className="text-gray-600 text-base" />}
            data-cy="audit-log-filter-button"
            id="audit-log-filter-button"
          >
            Filter
          </Button>
        </Popover>

        <Button
          type="default"
          icon={<DownloadOutlined />}
          className="h-10"
          onClick={onExport}
          data-cy="audit-log-export-button"
          id="audit-log-export-button"
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default AuditLogFilterBar;
