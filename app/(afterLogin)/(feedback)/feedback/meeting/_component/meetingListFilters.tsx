'use client';

import React, { useState } from 'react';
import { Input, Select, DatePicker, Button, Popover } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetAllMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDebounce } from '../../../../../../utils/useDebounce';

const { RangePicker } = DatePicker;

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

  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetAllMeetingType();

  const departmentOptions = Departments?.map((i) => ({
    value: i.id,
    label: i?.name,
  }));
  const meetingOptions = meetTypes?.items?.map(
    (i: { id: string; name: string }) => ({
      value: i.id,
      label: i.name,
    }),
  );

  const handleChangeRange = (
    values: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (values?.[0] && values?.[1]) {
      setStartAt(values[0] as unknown as string);
      setEndAt(values[1] as unknown as string);
    } else {
      setStartAt('');
      setEndAt('');
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };
  const onSearchChange = useDebounce(handleTitleChange, 2000);
  const handleSearchInput = (value: string) => {
    onSearchChange(value);
  };

  const rangeValue =
    startAt && endAt
      ? ([dayjs(startAt), dayjs(endAt)] as [dayjs.Dayjs, dayjs.Dayjs])
      : null;

  const filterPanel = (
    <div
      className="w-[min(100vw-2rem,320px)] space-y-3 pt-1"
      onMouseDown={(e) => e.preventDefault()}
      data-cy="feedback-meeting-filters-popover"
    >
      <div data-cy="feedback-meeting-filters-field-meeting-type">
        <Select
          showSearch
          placeholder="Select meeting type"
          allowClear
          maxTagCount={1}
          filterOption={(input: string, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={meetingOptions}
          className="w-full"
          value={meetingTypeId ?? undefined}
          onChange={(value) => setMeetingTypeId(value ?? null)}
          data-cy="feedback-meeting-component-meetinglist-select-meeting-type"
          id="feedback-meeting-component-meetinglist-select-meeting-type"
        />
      </div>
      <div data-cy="feedback-meeting-filters-field-department">
        <Select
          showSearch
          placeholder="Select department"
          allowClear
          filterOption={(input: string, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          mode="multiple"
          options={departmentOptions}
          maxTagCount={1}
          className="w-full"
          value={
            !departmentId
              ? []
              : Array.isArray(departmentId)
                ? departmentId
                : [departmentId]
          }
          onChange={(value) =>
            setDepartmentId(value?.length ? (value as unknown as string) : null)
          }
          data-cy="feedback-meeting-component-meetinglist-select-department"
          id="feedback-meeting-component-meetinglist-select-department"
        />
      </div>
      <div data-cy="feedback-meeting-filters-field-date-range">
        <RangePicker
          value={rangeValue}
          onChange={handleChangeRange}
          format="DD MMM YYYY"
          className="w-full"
          data-cy="feedback-meeting-component-meetinglist-range-picker"
          id="feedback-meeting-component-meetinglist-range-picker"
        />
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      data-cy="feedback-meeting-component-meetinglist-div-filters"
      id="feedback-meeting-component-meetinglist-div-filters"
    >
      <div
        className="flex h-8 w-[310px] max-w-full shrink-0 items-stretch overflow-hidden rounded-md border border-gray-300 bg-white"
        data-cy="feedback-meeting-search-group"
      >
        <Input
          allowClear
          variant="borderless"
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="search meeting"
          classNames={{
            affixWrapper:
              '!h-8 !min-h-8 flex-1 rounded-none border-0 bg-transparent shadow-none [&_input]:h-8 [&_input]:py-0',
          }}
          className="flex-1 text-sm"
          data-cy="feedback-meeting-component-meetinglist-input-search"
          id="feedback-meeting-component-meetinglist-input-search"
        />
        <div className="w-px shrink-0 self-stretch bg-gray-300" aria-hidden />
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center border-0 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Search"
          data-cy="feedback-meeting-search-icon-button"
        >
          <SearchOutlined className="text-base" />
        </button>
      </div>

      <Popover
        open={filterOpen}
        onOpenChange={setFilterOpen}
        trigger="click"
        placement="bottomRight"
        content={filterPanel}
      >
        <Button
          type="default"
          className="!h-8 flex min-h-8 items-center gap-2 rounded-md border-gray-300 px-3 text-sm font-normal leading-none text-gray-700 shadow-none hover:text-gray-900"
          icon={<FilterOutlined className="text-base" />}
          data-cy="feedback-meeting-filters-menu-button"
        >
          Filter
        </Button>
      </Popover>
    </div>
  );
}
