import { Button, Popover, Select } from 'antd';
import React from 'react';
import { useDebounce } from '@/utils/useDebounce';
import {
  CalendarData,
  useIncentiveStore,
} from '@/store/uistate/features/incentive/incentive';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchIncentiveSessions } from '@/store/server/features/incentive/project/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { MdOutlineFilterAlt } from 'react-icons/md';

const DynamicIncentiveFilter: React.FC = () => {
  const {
    searchParams,
    setSearchParams,
    setSelectedSessions,
    currentPage,
    pageSize,
    selectedYear,
    setSelectedYear,
    setCurrentPage,
  } = useIncentiveStore();
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
  const [draftFilters, setDraftFilters] = React.useState<{
    byYear?: string;
    bySession?: string[];
    byMonth?: string;
  }>({});

  const { data: employeeData } = useGetAllUsers();
  const { data: allSessions } = useFetchIncentiveSessions();
  const { data: activeCalender } = useGetActiveFiscalYears();
  const { data: fiscalYear } = useGetAllFiscalYears(pageSize, currentPage);

  const activeFiscalYearName = activeCalender
    ? activeCalender?.name
    : 'Select Year';

  const handleSearchCategory = async (
    value: string | boolean | any,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
    setCurrentPage(1);
  };

  const onSearchChange = useDebounce(handleSearchCategory, 2000);
  const onSelectChange = handleSearchCategory;

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  const handleCreatedByMonth = (value: string) => {
    onSelectChange(value, 'byMonth');
  };

  const handleCreatedByYear = (yearId: string) => {
    setSelectedYear(yearId);
    const selectedFiscalYear = fiscalYear?.items?.find(
      (year: any) => year?.id === yearId,
    );

    if (selectedFiscalYear) {
      const sessionIds =
        selectedFiscalYear?.sessions?.map((session: any) => session?.id) || [];

      setSelectedSessions(sessionIds);
      onSelectChange(sessionIds, 'bySession');
    } else {
      setSelectedSessions([]);
      onSelectChange([], 'bySession');
    }

    onSelectChange(yearId, 'byYear');
  };

  const handleCreatedBySession = (value: any[]) => {
    const sessionIds = Array.isArray(value) ? value : [value];
    setSelectedSessions(sessionIds);
    onSelectChange(sessionIds, 'bySession');
  };

  React.useEffect(() => {
    if (activeCalender?.sessions?.length) {
      const defaultSessionIds = activeCalender?.sessions?.map(
        (session: any) => session?.id,
      );
      setSelectedSessions(defaultSessionIds);
      onSelectChange(defaultSessionIds, 'bySession');
    }
    if (!selectedYear) {
      onSelectChange('', 'byMonth');
    }
  }, [activeCalender]);

  React.useEffect(() => {
    setDraftFilters({
      byYear: (searchParams?.byYear as string) || undefined,
      bySession: Array.isArray(searchParams?.bySession)
        ? (searchParams?.bySession as string[])
        : [],
      byMonth: (searchParams?.byMonth as string) || undefined,
    });
  }, [searchParams?.byYear, searchParams?.bySession, searchParams?.byMonth]);

  const draftSessionMonths = allSessions?.items
    ?.filter((session: CalendarData) =>
      (draftFilters?.bySession || []).includes(session?.id),
    )
    .flatMap((session: CalendarData) => session?.months);

  const filterPopoverContent = (
    <div
      className="md:w-[570px] w-[320px] py-4 px-5"
      data-cy="dynamic-incentive-filter-popover"
    >
      <div
        className="flex items-center justify-between mb-3"
        data-cy="dynamic-incentive-filter-popover-header"
      >
        <div
          className="text-base font-bold text-black/70"
          data-cy="dynamic-incentive-filter-popover-title"
        >
          Filter
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setFilterPopoverOpen(false)}
        />
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        data-cy="dynamic-incentive-filter-grid"
      >
        <div data-cy="recognition-history-filter-type-field">
          <div
            className="text-sm font-normal text-black/70 mb-2"
            data-cy="recognition-history-filter-type-label"
          >
            Type
          </div>
          <Select
            placeholder="Select"
            allowClear
            className="w-full h-10"
            onChange={(value) =>
              setDraftFilters((prev) => ({
                ...prev,
                childRecognitionTypeId: value,
              }))
            }
          />
        </div>
        <div data-cy="dynamic-incentive-filter-year-field">
          <div
            className="text-sm font-normal text-black/70 mb-2"
            data-cy="dynamic-incentive-filter-year-label"
          >
            Year
          </div>
          <Select
            placeholder={activeFiscalYearName}
            allowClear
            className="w-full h-10"
            value={draftFilters?.byYear || undefined}
            onChange={(value) =>
              setDraftFilters((prev) => ({
                ...prev,
                byYear: value,
                bySession: [],
                byMonth: undefined,
              }))
            }
            options={
              fiscalYear?.items?.map((item: any) => ({
                key: item?.id,
                value: item?.id,
                label: item?.name,
              })) ?? []
            }
          />
        </div>

        <div data-cy="dynamic-incentive-filter-month-field-container">
          <div data-cy="dynamic-incentive-filter-month-field">
            <div
              className="text-sm font-normal text-black/70 mb-2"
              data-cy="dynamic-incentive-filter-month-label"
            >
              Month
            </div>
            <Select
              placeholder="Select Month"
              allowClear
              className="w-full h-10"
              value={draftFilters?.byMonth || undefined}
              onChange={(value) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  byMonth: value,
                }))
              }
              disabled={!draftSessionMonths?.length}
              options={
                draftSessionMonths?.map((month: any) => ({
                  key: month?.id,
                  value: month?.id,
                  label: month?.name,
                })) ?? []
              }
            />
          </div>
        </div>

        <div data-cy="dynamic-incentive-filter-session-field">
          <div
            className="text-sm font-normal text-black/70 mb-2"
            data-cy="dynamic-incentive-filter-session-label"
          >
            Session
          </div>
          <Select
            mode="multiple"
            placeholder="Select Session"
            allowClear
            className="w-full h-10"
            value={draftFilters?.bySession || []}
            onChange={(value) =>
              setDraftFilters((prev) => ({
                ...prev,
                bySession: value,
                byMonth: undefined,
              }))
            }
            disabled={!draftFilters?.byYear}
            options={
              fiscalYear?.items
                ?.find((item: any) => item?.id === draftFilters?.byYear)
                ?.sessions?.map((session: any) => ({
                  key: session?.id,
                  value: session?.id,
                  label: session?.name,
                })) ?? []
            }
          />
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-3 pt-4"
        data-cy="dynamic-incentive-filter-actions"
      >
        <Button
          type="default"
          className="font-normal h-8 border border-[#D9D9D9]"
          onClick={() => {
            setDraftFilters({
              byYear: (searchParams?.byYear as string) || undefined,
              bySession: Array.isArray(searchParams?.bySession)
                ? (searchParams?.bySession as string[])
                : [],
              byMonth: (searchParams?.byMonth as string) || undefined,
            });
            setFilterPopoverOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={() => {
            const yearValue = draftFilters?.byYear || '';
            const sessionValue = draftFilters?.bySession || [];
            const monthValue = draftFilters?.byMonth || '';

            if (yearValue) {
              handleCreatedByYear(yearValue);
            } else {
              setSelectedYear(null);
              setSelectedSessions([]);
              onSelectChange('', 'byYear');
              onSelectChange([], 'bySession');
            }

            handleCreatedBySession(sessionValue);
            handleCreatedByMonth(monthValue);
            setFilterPopoverOpen(false);
          }}
          className="font-normal h-8"
        >
          Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      id="dynamic-incentive-filter-container"
      data-cy="dynamic-incentive-filter-container"
      className="my-5 mx-1"
    >
      <div
        className="flex items-center justify-between gap-3"
        data-cy="dynamic-incentive-filter-toolbar"
      >
        <Select
          id="dynamic-incentive-filter-employee-select"
          data-cy="dynamic-incentive-filter-employee-select"
          value={searchParams?.employee_name || undefined}
          onChange={(value) => handleSearchInput(value, 'employee_name')}
          placeholder="Search Employee"
          allowClear
          showSearch
          className="w-full max-w-[320px] h-8"
          optionFilterProp="label"
          filterOption={(input: any, option: any) =>
            option?.label?.toLowerCase()?.includes(input.toLowerCase())
          }
          options={
            employeeData?.items?.map((items: any) => ({
              value: items?.id,
              label:
                `${items?.firstName || ''} ${items?.middleName || ''}`.trim(),
            })) ?? []
          }
          suffixIcon={
            <div
              className="flex h-8 items-center justify-center border-l border-gray-200 pl-2"
              data-cy="recognition-history-employee-search-suffix"
            >
              <SearchOutlined className="ml-1" />
            </div>
          }
        />

        <Popover
          trigger="click"
          placement="bottomRight"
          open={filterPopoverOpen}
          onOpenChange={(open) => {
            setFilterPopoverOpen(open);
            if (open) {
              setDraftFilters({
                byYear: (searchParams?.byYear as string) || undefined,
                bySession: Array.isArray(searchParams?.bySession)
                  ? (searchParams?.bySession as string[])
                  : [],
                byMonth: (searchParams?.byMonth as string) || undefined,
              });
            }
          }}
          content={filterPopoverContent}
        >
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-black/70 hover:border-gray-300 hover:bg-gray-50"
            data-cy="dynamic-incentive-filter-trigger"
          >
            <MdOutlineFilterAlt className="text-lg text-black/55" />
            Filter
          </button>
        </Popover>
      </div>
    </div>
  );
};

export default DynamicIncentiveFilter;
