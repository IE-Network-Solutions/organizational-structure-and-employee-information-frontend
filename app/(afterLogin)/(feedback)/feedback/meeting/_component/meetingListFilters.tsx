'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Select, DatePicker, Button, Popover } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { MdClose, MdOutlineFilterAlt } from 'react-icons/md';
import dayjs, { type Dayjs } from 'dayjs';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetAllMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDebounce } from '../../../../../../utils/useDebounce';
import { MeetingFormOptionsMultiSelect } from './meetingFormAssigneeStyleSelects';
import './meetingListFiltersDropdown.css';
import filterStyles from './meetingListFilters.module.css';

const { RangePicker } = DatePicker;

type LabelValueOption = { value: string; label: string };

export default function MeetingListFilters() {
  const {
    setDepartmentId,
    departmentId,
    meetingTypeId,
    setMeetingTypeId,
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    setTitle,
  } = useMeetingStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftMeetingTypeId, setDraftMeetingTypeId] = useState<string | null>(
    null,
  );
  const [draftDepartmentIds, setDraftDepartmentIds] = useState<string[]>([]);
  const [draftRange, setDraftRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetAllMeetingType();

  const departmentOptions: LabelValueOption[] =
    Departments?.map((i) => ({
      value: String(i.id),
      label: String(i?.name ?? ''),
    })) ?? [];
  const meetingOptions: LabelValueOption[] | undefined = meetTypes?.items?.map(
    (i: { id: string; name: string }) => ({
      value: i.id,
      label: i.name,
    }),
  );

  const appliedDepartmentIds = useMemo(() => {
    if (!departmentId) return [] as string[];
    return Array.isArray(departmentId)
      ? departmentId.map((x) => String(x))
      : [String(departmentId)];
  }, [departmentId]);

  const appliedFilterChips = useMemo(() => {
    type Chip = { key: string; label: string; onRemove: () => void };
    const chips: Chip[] = [];

    if (meetingTypeId) {
      const label =
        meetingOptions?.find((o) => String(o.value) === String(meetingTypeId))
          ?.label ?? String(meetingTypeId);
      chips.push({
        key: `meeting-type-${meetingTypeId}`,
        label,
        onRemove: () => setMeetingTypeId(null),
      });
    }

    appliedDepartmentIds.forEach((id) => {
      const label =
        departmentOptions.find((o) => String(o.value) === String(id))?.label ??
        id;
      chips.push({
        key: `dept-${id}`,
        label,
        onRemove: () => {
          const next = appliedDepartmentIds.filter((x) => x !== id);
          setDepartmentId(next.length ? (next as unknown as string) : null);
        },
      });
    });

    if (startAt && endAt) {
      const a = dayjs(startAt).format('DD MMM YYYY');
      const b = dayjs(endAt).format('DD MMM YYYY');
      chips.push({
        key: 'date-range',
        label: `${a} – ${b}`,
        onRemove: () => {
          setStartAt('');
          setEndAt('');
        },
      });
    }

    return chips;
  }, [
    meetingTypeId,
    appliedDepartmentIds,
    startAt,
    endAt,
    meetingOptions,
    departmentOptions,
    setMeetingTypeId,
    setDepartmentId,
    setStartAt,
    setEndAt,
  ]);

  const syncDraftFromStore = useCallback(() => {
    setDraftMeetingTypeId(meetingTypeId ?? null);
    setDraftDepartmentIds(
      !departmentId
        ? []
        : Array.isArray(departmentId)
          ? departmentId.map((x) => String(x))
          : [String(departmentId)],
    );
    setDraftRange(
      startAt && endAt
        ? ([dayjs(startAt), dayjs(endAt)] as [Dayjs, Dayjs])
        : null,
    );
  }, [meetingTypeId, departmentId, startAt, endAt]);

  useEffect(() => {
    if (filterOpen) {
      syncDraftFromStore();
    }
  }, [filterOpen, syncDraftFromStore]);

  const handleResetDraft = () => {
    setDraftMeetingTypeId(null);
    setDraftDepartmentIds([]);
    setDraftRange(null);
  };

  const handleApplyFilters = () => {
    setMeetingTypeId(draftMeetingTypeId);
    setDepartmentId(
      draftDepartmentIds.length
        ? (draftDepartmentIds as unknown as string)
        : null,
    );
    if (draftRange?.[0] && draftRange?.[1]) {
      setStartAt(draftRange[0] as unknown as string);
      setEndAt(draftRange[1] as unknown as string);
    } else {
      setStartAt('');
      setEndAt('');
    }
    setFilterOpen(false);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };
  const onSearchChange = useDebounce(handleTitleChange, 2000);
  const handleSearchInput = (value: string) => {
    onSearchChange(value);
  };

  const filterPanel = (
    <div
      className={`flex w-[min(100vw-1.5rem,520px)] max-w-[520px] flex-col overflow-hidden rounded-xl bg-white shadow-lg ${filterStyles.panel}`}
      onMouseDown={(e) => e.preventDefault()}
      data-cy="feedback-meeting-filters-popover"
    >
      <div
        className="flex items-start justify-between gap-3 px-4 pb-0 pt-4"
        data-cy="feedback-meeting-filters-popover-header-row"
      >
        <div
          className="min-w-0"
          data-cy="feedback-meeting-filters-popover-header-text-wrap"
        >
          <h3
            className="m-0 text-base font-semibold leading-tight text-[#030712]"
            data-cy="feedback-meeting-filters-title"
          >
            Filter
          </h3>
          <p
            className="mb-0 mt-1 text-sm font-normal leading-snug text-black/45"
            data-cy="feedback-meeting-filters-subtitle"
          >
            Select all filters that apply
          </p>
        </div>
        <button
          type="button"
          className="flex size-6 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-gray-600 transition-colors hover:bg-black/[0.04] hover:text-gray-800"
          aria-label="Close filters"
          onClick={() => setFilterOpen(false)}
          data-cy="feedback-meeting-filters-close"
        >
          <MdClose size={14} aria-hidden />
        </button>
      </div>

      <div
        className="flex flex-col gap-4 p-4"
        data-cy="feedback-meeting-filters-popover-body"
      >
        <div
          className="flex min-w-0 flex-col gap-1.5"
          data-cy="feedback-meeting-filters-field-meeting-type"
        >
          <span
            className="text-[14px] font-normal leading-none text-[#030712]"
            data-cy="feedback-meeting-filters-label-meeting-type"
          >
            Meeting type
          </span>
          <Select
            showSearch
            placeholder="Select"
            allowClear
            filterOption={(input: string, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={meetingOptions}
            className="w-full"
            value={draftMeetingTypeId ?? undefined}
            onChange={(value) => setDraftMeetingTypeId(value ?? null)}
            data-cy="feedback-meeting-component-meetinglist-select-meeting-type"
            id="feedback-meeting-component-meetinglist-select-meeting-type"
          />
        </div>

        <div
          className="flex min-w-0 flex-col gap-1.5"
          data-cy="feedback-meeting-filters-field-department"
        >
          <span
            className="text-[14px] font-normal leading-none text-[#030712]"
            data-cy="feedback-meeting-filters-label-department"
          >
            Department
          </span>
          <div
            className={filterStyles.filterSelectScope}
            data-cy="feedback-meeting-filters-department-select-scope"
          >
            <MeetingFormOptionsMultiSelect
              value={draftDepartmentIds}
              onChange={setDraftDepartmentIds}
              options={departmentOptions}
              hint="Select"
              dropdownClassName="meeting-list-filter-dept-dropdown"
              data-cy="feedback-meeting-component-meetinglist-select-department"
            />
          </div>
        </div>

        <div
          className="flex min-w-0 flex-col gap-1.5"
          data-cy="feedback-meeting-filters-field-date-range"
        >
          <span
            className="text-[14px] font-normal leading-none text-[#030712]"
            data-cy="feedback-meeting-filters-label-meeting-date"
          >
            Meeting date
          </span>
          <RangePicker
            value={draftRange}
            onChange={(values) => setDraftRange(values)}
            format="DD MMM YYYY"
            className="w-full"
            placeholder={['Select date', 'Select date']}
            data-cy="feedback-meeting-component-meetinglist-range-picker"
            id="feedback-meeting-component-meetinglist-range-picker"
          />
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-end gap-3 px-4 pb-3 pt-0"
        data-cy="feedback-meeting-filters-popover-footer"
      >
        <Button
          type="default"
          onClick={handleResetDraft}
          className="!h-8 !min-h-8 rounded-lg !border !border-solid !border-[#D9D9D9] !bg-white !px-[15px] text-[14px] font-normal !text-[#030712] shadow-none hover:!border-[#D9D9D9] hover:!bg-[#fafafa] hover:!text-[#030712]"
          data-cy="feedback-meeting-filters-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleApplyFilters}
          className="!h-8 !min-h-8 rounded-lg !border-none !bg-[#1E40AF] !px-[15px] text-[14px] font-normal !text-white shadow-none hover:!bg-[#1e3a8a] hover:!text-white"
          data-cy="feedback-meeting-filters-save"
        >
          Save filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3"
      data-cy="feedback-meeting-component-meetinglist-div-filters"
      id="feedback-meeting-component-meetinglist-div-filters"
    >
      <div
        className="flex h-8 w-[310px] max-w-full shrink-0 items-center overflow-hidden rounded-lg border border-[#D9D9D9] bg-white"
        data-cy="feedback-meeting-search-group"
      >
        <Input
          allowClear
          variant="borderless"
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Search meeting"
          rootClassName="!flex !h-8 min-w-0 flex-1 !items-center"
          className="rounded-none border-0 bg-transparent text-sm shadow-none"
          classNames={{
            input: '!h-8 !min-h-0 !py-0 !leading-8 text-sm align-middle',
            suffix: '!flex !items-center',
          }}
          data-cy="feedback-meeting-component-meetinglist-input-search"
          id="feedback-meeting-component-meetinglist-input-search"
        />
        <div
          className="w-px shrink-0 self-stretch bg-[#D9D9D9]"
          aria-hidden
          data-cy="feedback-meeting-filters-search-divider"
        />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center border-0 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Search"
          data-cy="feedback-meeting-search-icon-button"
        >
          <SearchOutlined className="text-base" />
        </button>
      </div>

      <div
        className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2"
        data-cy="feedback-meeting-applied-filters-row"
      >
        {appliedFilterChips.map(({ key, label, onRemove }) => (
          <span
            key={key}
            className="inline-flex !h-[22px] !min-h-[22px] max-w-[min(100%,240px)] shrink-0 items-center gap-1.5 rounded-md border border-solid border-[#D9D9D9] bg-[rgba(0,0,0,0.02)] px-2 py-0 text-[12px] font-normal leading-none text-black/70"
            data-cy={`feedback-meeting-applied-filter-chip-${key}`}
          >
            <button
              type="button"
              className="m-0 flex size-4 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-black/60 hover:text-black/80"
              onClick={onRemove}
              aria-label={`Remove filter ${label}`}
              data-cy={`feedback-meeting-applied-filter-chip-remove-${key}`}
            >
              <CloseOutlined className="text-[10px]" />
            </button>
            <span
              className="min-w-0 truncate"
              title={label}
              data-cy={`feedback-meeting-applied-filter-chip-label-${key}`}
            >
              {label}
            </span>
          </span>
        ))}

        <Popover
          open={filterOpen}
          onOpenChange={setFilterOpen}
          trigger="click"
          placement="bottomRight"
          arrow={false}
          styles={{ body: { padding: 0 } }}
          content={filterPanel}
        >
          <Button
            type="default"
            className="!h-8 shrink-0 flex min-h-8 items-center gap-2 rounded-lg border-[#D9D9D9] px-3 text-sm font-normal leading-none text-[#030712] shadow-none hover:border-[#D9D9D9] hover:text-[#030712]"
            icon={<MdOutlineFilterAlt className="text-base" aria-hidden />}
            data-cy="feedback-meeting-filters-menu-button"
          >
            Filter
          </Button>
        </Popover>
      </div>
    </div>
  );
}
