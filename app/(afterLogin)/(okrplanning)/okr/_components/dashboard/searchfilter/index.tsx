import React, { useEffect, useState, useRef } from 'react';
import { Select, Modal, Popover, Button } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';
import { MdOutlineFilterAlt } from 'react-icons/md';

const { Option } = Select;

export type OkrSearchProps = {
  /** When true, filter layout matches "All Employee OKR" (multi-session, user & department; no metric). */
  allEmployeeLayout?: boolean;
  /**
   * When true with `allEmployeeLayout`, desktop shows employee search + a Filter popover
   * (fiscal year, session, department). Does not change filter state behavior.
   */
  filterInPopover?: boolean;
};

const OkrSearch: React.FC<OkrSearchProps> = ({
  allEmployeeLayout = false,
  filterInPopover = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const {
    searchObjParams,
    setSearchObjParams,
    okrTab,
    setFiscalYearId,
    fiscalYearId,
    setSessionIds,
    sessionIds,
  } = useOKRStore();

  const treatAsAllEmployeeTab = allEmployeeLayout || okrTab == 4;
  /** Send all FY sessions only for OKR tab 4 / legacy all-employee toolbar. Performance employees (`filterInPopover`) uses the active session only. */
  const useAllSessionsForEmployeeOkr =
    (allEmployeeLayout && !filterInPopover) || okrTab == 4;
  const showUserAndDepartmentFilters = allEmployeeLayout || okrTab != 1;
  const showMetricTypeFilter = !allEmployeeLayout && okrTab != 4;

  const { data: getAllFiscalYears, isLoading: fyLoading } =
    useGetAllFiscalYears();
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { data: Metrics } = useGetMetrics();
  const { data: allUsers } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();

  // Use refs to track previous values and prevent infinite loops
  const prevFiscalYearIdRef = useRef<string>(fiscalYearId);
  const prevOkrTabRef = useRef<number | string>(okrTab);
  const initializedRef = useRef<boolean>(false);

  // Only sync fiscal year and sessions on mount or when okrTab/fiscalYearId changes
  // This prevents infinite loops by checking if values actually changed
  useEffect(() => {
    // Skip if data isn't loaded yet
    if (!getAllFiscalYears?.items && !getActiveFisicalYear) {
      return;
    }

    // Check if fiscalYearId was changed externally (by user selection)
    const fiscalYearChangedExternally =
      prevFiscalYearIdRef.current !== fiscalYearId;
    const okrTabChanged = prevOkrTabRef.current !== okrTab;

    // If fiscal year was changed externally, update sessions for that fiscal year
    if (fiscalYearChangedExternally && fiscalYearId) {
      const selectedFiscalYear = getAllFiscalYears?.items?.find(
        (i) => i?.id == fiscalYearId,
      );

      if (selectedFiscalYear) {
        if (useAllSessionsForEmployeeOkr) {
          const allSessionIds =
            selectedFiscalYear?.sessions?.map((item: any) => item.id) || [];
          setSessionIds(allSessionIds);
        } else {
          const activeSessionId = selectedFiscalYear?.sessions?.find(
            (s: any) => s?.active,
          )?.id;
          const fallbackFirstSessionId = selectedFiscalYear?.sessions?.[0]?.id;
          const chosen = activeSessionId || fallbackFirstSessionId || '';
          setSessionIds(chosen ? [chosen] : []);
        }
      }
      // Update refs after handling the change
      prevFiscalYearIdRef.current = fiscalYearId;
      prevOkrTabRef.current = okrTab;
      return;
    }

    // Only initialize default fiscal year if not already initialized and no fiscal year is set
    if (!initializedRef.current && !fiscalYearId) {
      const selectedFiscalYear = getActiveFisicalYear;

      if (!selectedFiscalYear) {
        initializedRef.current = true;
        return;
      }

      const newFiscalYearId = selectedFiscalYear?.id || '';

      if (useAllSessionsForEmployeeOkr) {
        const allSessionIds =
          selectedFiscalYear?.sessions?.map((item: any) => item.id) || [];
        setSessionIds(allSessionIds);
      } else {
        const activeSessionId = selectedFiscalYear?.sessions?.find(
          (s: any) => s?.active,
        )?.id;
        const fallbackFirstSessionId = selectedFiscalYear?.sessions?.[0]?.id;
        const chosen = activeSessionId || fallbackFirstSessionId || '';
        setSessionIds(chosen ? [chosen] : []);
      }

      setFiscalYearId(newFiscalYearId);
      prevFiscalYearIdRef.current = newFiscalYearId;
      prevOkrTabRef.current = okrTab;
      initializedRef.current = true;
      return;
    }

    // If okrTab changed, update sessions for current fiscal year
    if (okrTabChanged && fiscalYearId) {
      const selectedFiscalYear = getAllFiscalYears?.items?.find(
        (i) => i?.id == fiscalYearId,
      );

      if (selectedFiscalYear) {
        if (useAllSessionsForEmployeeOkr) {
          const allSessionIds =
            selectedFiscalYear?.sessions?.map((item: any) => item.id) || [];
          setSessionIds(allSessionIds);
        } else {
          const activeSessionId = selectedFiscalYear?.sessions?.find(
            (s: any) => s?.active,
          )?.id;
          const fallbackFirstSessionId = selectedFiscalYear?.sessions?.[0]?.id;
          const chosen = activeSessionId || fallbackFirstSessionId || '';
          setSessionIds(chosen ? [chosen] : []);
        }
      }
      // Update ref after handling the change
      prevOkrTabRef.current = okrTab;
    }
  }, [
    getAllFiscalYears?.items,
    getActiveFisicalYear,
    okrTab,
    allEmployeeLayout,
    filterInPopover,
    fiscalYearId,
    setFiscalYearId,
    setSessionIds,
  ]);

  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );

  const handleFilter = (value: string, key: keyof typeof searchObjParams) => {
    setSearchObjParams(key, value);
  };

  const MobileFilterContent = () => (
    <div
      id="mobile-filter-content"
      data-cy="okr-mobile-filter-content"
      className="flex flex-col gap-4"
    >
      <h3
        id="mobile-filter-title"
        data-cy="okr-mobile-filter-title"
        className="text-lg font-medium mb-2"
      >
        Filter
      </h3>

      {/* Fiscal Year */}
      <div
        id="mobile-fiscal-year-field"
        data-cy="okr-mobile-fiscal-year-field"
        className="flex flex-col gap-2"
      >
        <label
          id="mobile-fiscal-year-label"
          data-cy="okr-mobile-fiscal-year-label"
          className="text-sm text-gray-600"
        >
          Fiscal year
        </label>
        <Select
          loading={fyLoading}
          value={fiscalYearId}
          id="mobile-fiscal-year-select"
          data-cy="okr-mobile-fiscal-year-select"
          placeholder="Filter by Fiscal Year"
          onChange={(value) => setFiscalYearId(value)}
          allowClear
          showSearch
          className="w-full h-14"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {getAllFiscalYears?.items?.map((item: any) => (
            <Select.Option
              data-cy={`okr-mobile-fiscal-year-select-option-${item?.id}`}
              key={item?.id}
              value={item?.id}
            >
              {item?.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Session */}
      <div
        id="mobile-session-field"
        data-cy="okr-mobile-session-field"
        className="flex flex-col gap-2"
      >
        <label
          id="mobile-session-label"
          data-cy="okr-mobile-session-label"
          className="text-sm text-gray-600"
        >
          Session
        </label>
        <Select
          loading={fyLoading}
          value={useAllSessionsForEmployeeOkr ? sessionIds : sessionIds?.[0]}
          id="mobile-session-select"
          data-cy="okr-mobile-session-select"
          placeholder="Filter by Session"
          className="w-full h-14 overflow-y-auto text-[10px]"
          allowClear
          showSearch
          onChange={(value: any) => {
            if (useAllSessionsForEmployeeOkr) {
              setSessionIds(
                Array.isArray(value) ? value : value ? [value] : [],
              );
            } else {
              setSessionIds(value ? [value] : []);
            }
          }}
          mode={useAllSessionsForEmployeeOkr ? 'multiple' : undefined}
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {getAllFiscalYears?.items
            ?.find((fy: any) => fy.id === fiscalYearId)
            ?.sessions?.map((session: any) => (
              <Option
                data-cy={`okr-mobile-session-select-option-${session?.id}`}
                key={session.id}
                value={session.id}
              >
                {session.name}
              </Option>
            ))}
        </Select>
      </div>

      {/* Department */}
      {okrTab != 1 && (
        <div
          id="mobile-department-field"
          data-cy="okr-mobile-department-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-department-label"
            data-cy="okr-mobile-department-label"
            className="text-sm text-gray-600"
          >
            Department
          </label>
          <Select
            id="mobile-department-select"
            data-cy="okr-mobile-department-select"
            placeholder="Filter by Department"
            className="w-full h-14"
            allowClear
            showSearch
            value={searchObjParams.departmentId}
            onChange={(value) => handleFilter(value, 'departmentId')}
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {DepartmentWithUsers?.map((dept: any) => (
              <Option
                data-cy={`okr-mobile-department-select-option-${dept?.id}`}
                key={dept.id}
                value={dept.id}
              >
                {dept.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* Metric Type */}
      {okrTab != 4 && (
        <div
          id="mobile-metric-type-field"
          data-cy="okr-mobile-metric-type-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-metric-type-label"
            data-cy="okr-mobile-metric-type-label"
            className="text-sm text-gray-600"
          >
            Metric Type
          </label>
          <Select
            id="mobile-metric-type-select"
            data-cy="okr-mobile-metric-type-select"
            placeholder="Filter by Metric Type"
            className="w-full h-14"
            allowClear
            value={searchObjParams.metricTypeId}
            onChange={(value) => handleFilter(value, 'metricTypeId')}
          >
            <Option data-cy="okr-mobile-metric-type-select-option-all" value="">
              All
            </Option>
            {Metrics?.items?.map((metric: any) => (
              <Option
                data-cy={`okr-mobile-metric-type-select-option-${metric?.id}`}
                key={metric.id}
                value={metric.id}
              >
                {metric.name}
              </Option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div
        id="desktop-search-filters"
        data-cy="okr-desktop-search-filters"
        className="hidden md:block"
      >
        {allEmployeeLayout && filterInPopover ? (
          <div
            className="flex w-full flex-row items-center justify-between gap-3"
            data-cy="okr-performance-desktop-toolbar"
          >
            {showUserAndDepartmentFilters && (
              <Select
                id="desktop-user-select"
                data-cy="okr-desktop-user-select"
                showSearch
                placeholder="Search Employee"
                className="h-8 w-full md:w-[300px]"
                allowClear
                suffixIcon={
                  <div
                    className="border-l border-gray-200 h-8 flex items-center justify-center"
                    data-cy="okr-desktop-user-search-suffix"
                    id="okr-desktop-user-search-suffix"
                  >
                    <SearchOutlined
                      className="text-gray-600 ml-2"
                      data-cy="okr-desktop-user-search-icon"
                    />
                  </div>
                }
                value={searchObjParams.userId || undefined}
                onChange={(value) => handleFilter(value ?? '', 'userId')}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers?.items?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    ' ' +
                    item?.lastName,
                }))}
              />
            )}
            <Popover
              trigger="click"
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
              placement="bottomRight"
              rootClassName="performance-okr-filter-popover"
              content={
                <div
                  className=" md:w-[min(100vw-2rem,400px)] "
                  data-cy="okr-performance-filter-popover-content"
                >
                  <div
                    className="mb-4 flex items-start justify-between gap-2"
                    data-cy="okr-performance-filter-popover-header-row"
                  >
                    <div data-cy="okr-performance-filter-popover-header-text">
                      <div
                        className="text-base font-semibold text-gray-900"
                        data-cy="okr-performance-filter-popover-title"
                      >
                        Filter
                      </div>
                      <p
                        className="mt-0.5 text-xs font-normal text-gray-500"
                        data-cy="okr-performance-filter-popover-subtitle"
                      >
                        Select All filters that apply
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Close"
                      data-cy="okr-performance-filter-popover-close"
                      onClick={() => setFilterPopoverOpen(false)}
                    >
                      <CloseOutlined />
                    </button>
                  </div>

                  <div
                    className="flex flex-col gap-4"
                    data-cy="okr-performance-filter-popover-fields"
                  >
                    <div
                      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                      data-cy="okr-performance-filter-popover-grid-employee-dept"
                    >
                      <div
                        className="flex flex-col gap-1.5"
                        data-cy="okr-performance-filter-field-employee"
                      >
                        <span
                          className="text-sm text-gray-700"
                          data-cy="okr-performance-filter-label-employee"
                        >
                          Employee{' '}
                          <span
                            className="text-red-500"
                            aria-hidden
                            data-cy="okr-performance-filter-label-employee-required"
                          >
                            *
                          </span>
                        </span>
                        <Select
                          showSearch
                          placeholder="Input"
                          className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                          allowClear
                          value={searchObjParams.userId || undefined}
                          onChange={(value) =>
                            handleFilter(value ?? '', 'userId')
                          }
                          filterOption={(input: any, option: any) =>
                            (option?.label ?? '')
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={allUsers?.items?.map((item: any) => ({
                            ...item,
                            value: item?.id,
                            label:
                              item?.firstName +
                              ' ' +
                              item?.middleName +
                              ' ' +
                              item?.lastName,
                          }))}
                          data-cy="okr-performance-filter-select-employee"
                        />
                      </div>
                      <div
                        className="flex flex-col gap-1.5"
                        data-cy="okr-performance-filter-field-department"
                      >
                        <span
                          className="text-sm text-gray-700"
                          data-cy="okr-performance-filter-label-department"
                        >
                          Department{' '}
                          <span
                            className="text-red-500"
                            aria-hidden
                            data-cy="okr-performance-filter-label-department-required"
                          >
                            *
                          </span>
                        </span>
                        <Select
                          placeholder="Filter by Department"
                          className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                          allowClear
                          showSearch
                          value={searchObjParams.departmentId || undefined}
                          onChange={(value) =>
                            handleFilter(value ?? '', 'departmentId')
                          }
                          filterOption={(input, option) =>
                            (option?.children as any)
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          data-cy="okr-performance-filter-select-department"
                        >
                          {DepartmentWithUsers?.map((dept: any) => (
                            <Option
                              data-cy={`okr-desktop-department-select-option-${dept?.id}`}
                              key={dept.id}
                              value={dept.id}
                            >
                              {dept.name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div
                      className="flex flex-col gap-1.5"
                      data-cy="okr-performance-filter-field-fiscal-year"
                    >
                      <span
                        className="text-sm text-gray-700"
                        data-cy="okr-performance-filter-label-fiscal-year"
                      >
                        Fiscal Year{' '}
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="okr-performance-filter-label-fiscal-year-required"
                        >
                          *
                        </span>
                      </span>
                      <Select
                        loading={fyLoading}
                        value={fiscalYearId || undefined}
                        placeholder="Filter by Fiscal Year"
                        onChange={(value) => setFiscalYearId(value)}
                        allowClear
                        showSearch
                        className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.children as any)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        data-cy="okr-performance-filter-select-fiscal-year"
                      >
                        {getAllFiscalYears?.items?.map((item: any) => (
                          <Select.Option
                            data-cy={`okr-desktop-fiscal-year-select-option-${item?.id}`}
                            key={item?.id}
                            value={item?.id}
                          >
                            {item?.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div
                      className="flex flex-col gap-1.5"
                      data-cy="okr-performance-filter-field-session"
                    >
                      <span
                        className="text-sm text-gray-700"
                        data-cy="okr-performance-filter-label-session"
                      >
                        Session{' '}
                        <span
                          className="text-red-500"
                          aria-hidden
                          data-cy="okr-performance-filter-label-session-required"
                        >
                          *
                        </span>
                      </span>
                      <Select
                        loading={fyLoading}
                        value={sessionIds?.[0]}
                        placeholder="Filter by Session"
                        className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                        allowClear
                        showSearch
                        onChange={(value: string) => {
                          setSessionIds(value ? [value] : []);
                        }}
                        filterOption={(input, option) =>
                          (option?.children as any)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        data-cy="okr-performance-filter-select-session"
                      >
                        {getAllFiscalYears?.items
                          ?.find((fy: any) => fy.id === fiscalYearId)
                          ?.sessions?.map((session: any) => (
                            <Option
                              data-cy={`okr-desktop-session-select-option-${session?.id}`}
                              key={session.id}
                              value={session.id}
                            >
                              {session.name}
                            </Option>
                          ))}
                      </Select>
                    </div>
                  </div>

                  <div
                    className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4"
                    data-cy="okr-performance-filter-popover-footer"
                  >
                    <Button
                      data-cy="okr-performance-filter-reset"
                      className="border-gray-200"
                      onClick={() => {
                        handleFilter('', 'userId');
                        handleFilter('', 'departmentId');
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      data-cy="okr-performance-filter-save"
                      className="!bg-[#1e40af] hover:!bg-[#1d3a9c]"
                      onClick={() => setFilterPopoverOpen(false)}
                    >
                      Save Filter
                    </Button>
                  </div>
                </div>
              }
            >
              <Button
                type="default"
                icon={<MdOutlineFilterAlt className="text-black/70" />}
                className="flex h-8 shrink-0 items-center gap-2 rounded-lg border-gray-200 px-4 text-black/70"
                data-cy="okr-performance-filter-popover-trigger"
              >
                Filter
              </Button>
            </Popover>
          </div>
        ) : (
          <div
            id="desktop-search-grid"
            data-cy="okr-desktop-search-grid"
            className="grid grid-cols-12 gap-4"
          >
            {/* User Filter */}
            {showUserAndDepartmentFilters && (
              <div
                className="col-span-12 lg:col-span-4"
                data-cy="okr-desktop-user-filter-container"
              >
                <Select
                  id="desktop-user-select"
                  data-cy="okr-desktop-user-select"
                  showSearch
                  placeholder="Select a person"
                  className="w-full h-14"
                  allowClear
                  onChange={(value) => handleFilter(value, 'userId')}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers?.items?.map((item: any) => ({
                    ...item,
                    value: item?.id,
                    label:
                      item?.firstName +
                      ' ' +
                      item?.middleName +
                      ' ' +
                      item?.lastName,
                  }))}
                />
              </div>
            )}

            {/* Fiscal Year */}
            <div
              className={`${treatAsAllEmployeeTab ? 'col-span-3' : 'col-span-2'}`}
              data-cy="okr-desktop-fiscal-year-container"
            >
              <Select
                loading={fyLoading}
                value={fiscalYearId}
                id="desktop-fiscal-year-select"
                data-cy="okr-desktop-fiscal-year-select"
                placeholder="Filter by Fiscal Year"
                onChange={(value) => setFiscalYearId(value)}
                allowClear
                showSearch
                className="w-full h-14"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as any)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {getAllFiscalYears?.items?.map((item: any) => (
                  <Select.Option
                    data-cy={`okr-desktop-fiscal-year-select-option-${item?.id}`}
                    key={item?.id}
                    value={item?.id}
                  >
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Session */}
            <div
              className={`${treatAsAllEmployeeTab ? 'col-span-3' : 'col-span-2'}`}
              data-cy="okr-desktop-session-container"
            >
              <Select
                loading={fyLoading}
                value={
                  useAllSessionsForEmployeeOkr ? sessionIds : sessionIds?.[0]
                }
                id="desktop-session-select"
                data-cy="okr-desktop-session-select"
                placeholder="Filter by Session"
                className="w-full h-14 overflow-y-auto text-[10px]"
                allowClear
                showSearch
                onChange={(value: any) => {
                  if (useAllSessionsForEmployeeOkr) {
                    setSessionIds(
                      Array.isArray(value) ? value : value ? [value] : [],
                    );
                  } else {
                    setSessionIds(value ? [value] : []);
                  }
                }}
                mode={useAllSessionsForEmployeeOkr ? 'multiple' : undefined}
                filterOption={(input, option) =>
                  (option?.children as any)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {getAllFiscalYears?.items
                  ?.find((fy: any) => fy.id === fiscalYearId)
                  ?.sessions?.map((session: any) => (
                    <Option
                      data-cy={`okr-desktop-session-select-option-${session?.id}`}
                      key={session.id}
                      value={session.id}
                    >
                      {session.name}
                    </Option>
                  ))}
              </Select>
            </div>

            {/* Department */}
            {showUserAndDepartmentFilters && (
              <div
                className={`${treatAsAllEmployeeTab ? 'col-span-2' : 'col-span-2'}`}
                data-cy="okr-desktop-department-container"
              >
                <Select
                  id="desktop-department-select"
                  data-cy="okr-desktop-department-select"
                  placeholder="Filter by Department"
                  className="w-full h-14"
                  allowClear
                  showSearch
                  onChange={(value) => handleFilter(value, 'departmentId')}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {DepartmentWithUsers?.map((dept: any) => (
                    <Option
                      data-cy={`okr-desktop-department-select-option-${dept?.id}`}
                      key={dept.id}
                      value={dept.id}
                    >
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            {/* Metric Type */}
            {showMetricTypeFilter && (
              <div
                className="col-span-12 lg:col-span-2"
                data-cy="okr-desktop-metric-type-container"
              >
                <Select
                  id="desktop-metric-type-select"
                  data-cy="okr-desktop-metric-type-select"
                  placeholder="Filter by Metric Type"
                  className="w-full h-14"
                  allowClear
                  onChange={(value) => handleFilter(value, 'metricTypeId')}
                >
                  <Option
                    data-cy="okr-desktop-metric-type-select-option-all"
                    value=""
                  >
                    All
                  </Option>
                  {Metrics?.items?.map((metric: any) => (
                    <Option
                      data-cy={`okr-desktop-metric-type-select-option-${metric?.id}`}
                      key={metric.id}
                      value={metric.id}
                    >
                      {metric.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div
        id="mobile-search-filters"
        data-cy="okr-mobile-search-filters"
        className="md:hidden"
      >
        <div
          id="mobile-search-controls"
          data-cy="okr-mobile-search-controls"
          className="flex justify-between gap-4 w-full"
        >
          {okrTab != 1 && (
            <div className="flex-1" data-cy="okr-mobile-user-select-container">
              <Select
                id="mobile-user-select"
                data-cy="okr-mobile-user-select"
                showSearch
                placeholder="Select a person"
                className="w-full h-10"
                allowClear
                onChange={(value) => handleFilter(value, 'userId')}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers?.items?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    ' ' +
                    item?.lastName,
                }))}
              />
            </div>
          )}
          <div
            className={`${okrTab == 1 ? 'ml-auto' : ''}`}
            data-cy="okr-mobile-filter-button-container"
          >
            <CustomButton
              id="mobile-filter-button"
              data-cy="okr-mobile-filter-button"
              type="default"
              size="small"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
              title=""
              icon={
                <LuSettings2
                  data-cy="okr-mobile-filter-button-icon"
                  size={20}
                />
              }
            />
          </div>
        </div>

        <Modal
          data-cy="okr-mobile-filter-modal"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={
            <div
              id="mobile-filter-modal-footer"
              data-cy="okr-mobile-filter-modal-footer"
              className="flex gap-2 justify-center mt-4"
            >
              <CustomButton
                id="mobile-filter-cancel-button"
                data-cy="okr-mobile-filter-cancel-button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border rounded-lg text-sm text-gray-900"
                title="Cancel"
                type="default"
              />
              <CustomButton
                id="mobile-filter-apply-button"
                data-cy="okr-mobile-filter-apply-button"
                title="Filter"
                type="primary"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-6 py-2 text-white rounded-lg text-sm"
              />
            </div>
          }
          className="!m-4 md:hidden"
          style={{
            top: '20%',
            transform: 'translateY(-50%)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          width="90%"
          centered
        >
          <MobileFilterContent data-cy="okr-mobile-filter-content" />
        </Modal>
      </div>
    </>
  );
};

export default OkrSearch;
