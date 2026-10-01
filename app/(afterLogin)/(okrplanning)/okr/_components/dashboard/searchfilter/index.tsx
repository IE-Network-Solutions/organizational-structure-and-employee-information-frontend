import React, { useEffect, useState, useRef } from 'react';
import { Select, Modal, Button, Popover } from 'antd';
import { OKR_STATUS_PILLS } from '../../../_constants/okrStatusPills';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useOKRStore,
  useSearchFilterStore,
} from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { selectValueOrUndefined } from '../okrFilterUsers';
import { useObjectiveTypesStore } from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import { BSC_PILLARS } from '../../../_constants/bscPillars';

/** Keep Select dropdowns inside Popover/Modal so choices don't close the panel. */
const popupContainer = (node: HTMLElement) =>
  node.parentElement ?? document.body;

const { Option } = Select;

export type OkrSearchProps = {
  embedded?: boolean;
  'data-cy'?: string;
  /** When true, filter layout matches "All Employee OKR" (multi-session, user & department; no metric). */
  allEmployeeLayout?: boolean;
  /**
   * When true with `allEmployeeLayout`, desktop shows employee search + a Filter popover
   * (fiscal year, session, department). Does not change filter state behavior.
   */
  filterInPopover?: boolean;
};

const OkrSearch: React.FC<OkrSearchProps> = ({
  embedded = false,
  'data-cy': dataCy,
  allEmployeeLayout = false,
  filterInPopover = false,
}) => {
  const {
    isFilterModalOpen: isModalOpen,
    openFilterModal,
    closeFilterModal,
    setFilterModalOpen,
  } = useSearchFilterStore();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const { isMobile, isTablet } = useIsMobile();
  const {
    searchObjParams,
    setSearchObjParams,
    okrTab,
    setFiscalYearId,
    fiscalYearId,
    setSessionIds,
    sessionIds,
    okrStatusPillId,
    setOkrStatusPillId,
  } = useOKRStore();

  const isMyOkrTab = String(okrTab) === '1';
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
  const objectiveTypes = useObjectiveTypesStore((s) => s.types);

  // Use refs to track previous values and prevent infinite loops
  const prevFiscalYearIdRef = useRef<string>(fiscalYearId);
  const initializedRef = useRef<boolean>(false);

  // Sync sessions only on first init or when the fiscal year changes.
  // Do NOT reset sessions on tab switches — that wiped the user's selection.
  useEffect(() => {
    if (!getAllFiscalYears?.items && !getActiveFisicalYear) {
      return;
    }

    const applyDefaultSessionsForFiscalYear = (selectedFiscalYear: {
      sessions?: Array<{ id: string; active?: boolean }>;
    }) => {
      if (useAllSessionsForEmployeeOkr) {
        const allSessionIds =
          selectedFiscalYear?.sessions?.map((item) => item.id) || [];
        setSessionIds(allSessionIds);
        return;
      }
      const activeSessionId = selectedFiscalYear?.sessions?.find(
        (s) => s?.active,
      )?.id;
      const fallbackFirstSessionId = selectedFiscalYear?.sessions?.[0]?.id;
      const chosen = activeSessionId || fallbackFirstSessionId || '';
      setSessionIds(chosen ? [chosen] : []);
    };

    const fiscalYearChanged = prevFiscalYearIdRef.current !== fiscalYearId;

    // User (or store) changed fiscal year → sessions must match the new year
    if (fiscalYearChanged && fiscalYearId) {
      const selectedFiscalYear = getAllFiscalYears?.items?.find(
        (i) => i?.id == fiscalYearId,
      );
      if (selectedFiscalYear) {
        applyDefaultSessionsForFiscalYear(selectedFiscalYear);
      }
      prevFiscalYearIdRef.current = fiscalYearId;
      return;
    }

    // First load: pick active fiscal year + default session(s)
    if (!initializedRef.current && !fiscalYearId) {
      const selectedFiscalYear = getActiveFisicalYear;

      if (!selectedFiscalYear) {
        initializedRef.current = true;
        return;
      }

      const newFiscalYearId = selectedFiscalYear?.id || '';
      applyDefaultSessionsForFiscalYear(selectedFiscalYear);
      setFiscalYearId(newFiscalYearId);
      prevFiscalYearIdRef.current = newFiscalYearId;
      initializedRef.current = true;
    }
  }, [
    getAllFiscalYears?.items,
    getActiveFisicalYear,
    allEmployeeLayout,
    filterInPopover,
    fiscalYearId,
    setFiscalYearId,
    setSessionIds,
    useAllSessionsForEmployeeOkr,
  ]);

  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );

  const handleFilter = (value: string, key: keyof typeof searchObjParams) => {
    setSearchObjParams(key, value);
  };

  const handleReset = () => {
    setFiscalYearId('');
    setSessionIds([]);
    setOkrStatusPillId(null);
    handleFilter('', 'metricTypeId');
    handleFilter('', 'userId');
    handleFilter('', 'departmentId');
    handleFilter('', 'objectiveTypeId');
    handleFilter('', 'bscPillarId');
  };

  const renderMobileFilterContent = (showStatusPills = false) => (
    <div
      id="mobile-filter-content"
      data-cy="okr-mobile-filter-content"
      className="flex flex-col gap-4"
    >
      {showStatusPills && (
        <div
          className="flex w-full min-w-0 flex-wrap gap-2"
          data-cy="okr-status-pills-row"
        >
          {OKR_STATUS_PILLS.map((pill) => {
            const isSelected = okrStatusPillId === pill.id;
            return (
              <Button
                key={pill.id}
                type="default"
                size="small"
                data-cy={`okr-status-pill-${pill.id}`}
                onClick={() =>
                  setOkrStatusPillId(
                    okrStatusPillId === pill.id ? null : pill.id,
                  )
                }
                className={
                  isSelected
                    ? '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-okr-primary text-okr-primary !bg-white hover:!bg-[#FAFAFA] hover:!border-okr-primary hover:!text-okr-primary'
                    : '!rounded-lg !h-7 !min-h-0 !px-2 !py-0 !leading-none border-gray-200 text-gray-700 !bg-white hover:!bg-gray-50 hover:!border-gray-300 hover:!text-gray-800'
                }
              >
                {pill.label}
              </Button>
            );
          })}
        </div>
      )}
      {/* Employee – full width, label above (same fields as desktop) */}
      {showUserAndDepartmentFilters && (
        <div
          id="mobile-employee-field"
          data-cy="okr-mobile-employee-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-employee-label"
            data-cy="okr-mobile-employee-label"
            className="text-sm font-medium text-gray-700"
          >
            Employee
          </label>
          <Select
            id="mobile-employee-select"
            data-cy="okr-mobile-employee-select"
            showSearch
            placeholder="All employees"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={popupContainer}
            value={selectValueOrUndefined(searchObjParams.userId)}
            onChange={(value) => handleFilter(value ?? '', 'userId')}
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={allUsers?.items?.map((item: any) => ({
              ...item,
              value: item?.id,
              label:
                item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
            }))}
          />
        </div>
      )}

      {/* Department – full width (same as desktop when tab != 1) */}
      {showUserAndDepartmentFilters && (
        <div
          id="mobile-department-field"
          data-cy="okr-mobile-department-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-department-label"
            data-cy="okr-mobile-department-label"
            className="text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <Select
            id="mobile-department-select"
            data-cy="okr-mobile-department-select"
            placeholder="All departments"
            className="w-full h-12 rounded-lg"
            allowClear
            showSearch
            getPopupContainer={popupContainer}
            value={selectValueOrUndefined(searchObjParams.departmentId)}
            onChange={(value) => handleFilter(value ?? '', 'departmentId')}
            filterOption={(input, option) =>
              (option?.children as any)
                ?.toLowerCase()
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

      {/* Fiscal Year – full width */}
      <div
        id="mobile-fiscal-year-field"
        data-cy="okr-mobile-fiscal-year-field"
        className="flex flex-col gap-2"
      >
        <label
          id="mobile-fiscal-year-label"
          data-cy="okr-mobile-fiscal-year-label"
          className="text-sm font-medium text-gray-700"
        >
          Fiscal Year{' '}
          <span
            className="text-red-500"
            data-cy="okr-mobile-fiscal-year-required"
          >
            *
          </span>
        </label>
        <Select
          loading={fyLoading}
          value={selectValueOrUndefined(fiscalYearId)}
          id="mobile-fiscal-year-select"
          data-cy="okr-mobile-fiscal-year-select"
          placeholder="Select"
          onChange={(value) => setFiscalYearId(value ?? '')}
          allowClear
          showSearch
          getPopupContainer={popupContainer}
          className="w-full h-12 rounded-lg"
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

      {/* Session – full width */}
      <div
        id="mobile-session-field"
        data-cy="okr-mobile-session-field"
        className="flex flex-col gap-2"
      >
        <label
          id="mobile-session-label"
          data-cy="okr-mobile-session-label"
          className="text-sm font-medium text-gray-700"
        >
          Session{' '}
          <span className="text-red-500" data-cy="okr-mobile-session-required">
            *
          </span>
        </label>
        <Select
          loading={fyLoading}
          value={
            useAllSessionsForEmployeeOkr
              ? sessionIds
              : selectValueOrUndefined(sessionIds?.[0])
          }
          id="mobile-session-select"
          data-cy="okr-mobile-session-select"
          placeholder="Select"
          className="w-full [&_.ant-select-selector]:!min-h-12 [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!py-1.5 [&_.ant-select-selector]:!overflow-hidden [&_.ant-select-selection-overflow]:!flex-nowrap"
          allowClear
          showSearch
          maxTagCount={useAllSessionsForEmployeeOkr ? 1 : undefined}
          getPopupContainer={popupContainer}
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
            className="text-sm font-medium text-gray-700"
          >
            Metric Type
          </label>
          <Select
            id="mobile-metric-type-select"
            data-cy="okr-mobile-metric-type-select"
            placeholder="All metrics"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={popupContainer}
            value={selectValueOrUndefined(searchObjParams.metricTypeId)}
            onChange={(value) => handleFilter(value ?? '', 'metricTypeId')}
          >
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

      {/* Objective Type */}
      {okrTab != 4 && (
        <div
          id="mobile-objective-type-field"
          data-cy="okr-mobile-objective-type-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-objective-type-label"
            data-cy="okr-mobile-objective-type-label"
            className="text-sm font-medium text-gray-700"
          >
            Objective Type
          </label>
          <Select
            id="mobile-objective-type-select"
            data-cy="okr-mobile-objective-type-select"
            placeholder="All objective types"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={popupContainer}
            value={selectValueOrUndefined(searchObjParams.objectiveTypeId)}
            onChange={(value) => handleFilter(value ?? '', 'objectiveTypeId')}
          >
            {objectiveTypes.map((type) => (
              <Option
                data-cy={`okr-mobile-objective-type-select-option-${type.id}`}
                key={type.id}
                value={type.id}
              >
                {type.name}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {/* BSC Pillar */}
      {okrTab != 4 && (
        <div
          id="mobile-bsc-pillar-field"
          data-cy="okr-mobile-bsc-pillar-field"
          className="flex flex-col gap-2"
        >
          <label
            id="mobile-bsc-pillar-label"
            data-cy="okr-mobile-bsc-pillar-label"
            className="text-sm font-medium text-gray-700"
          >
            BSC Pillar
          </label>
          <Select
            id="mobile-bsc-pillar-select"
            data-cy="okr-mobile-bsc-pillar-select"
            placeholder="All BSC pillars"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={popupContainer}
            value={selectValueOrUndefined(searchObjParams.bscPillarId)}
            onChange={(value) => handleFilter(value ?? '', 'bscPillarId')}
          >
            {BSC_PILLARS.map((pillar) => (
              <Option
                data-cy={`okr-mobile-bsc-pillar-select-option-${pillar.id}`}
                key={pillar.id}
                value={pillar.id}
              >
                {pillar.name}
              </Option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );

  const filterPopoverContent = (
    <div
      id="filter-popover-content"
      data-cy="okr-filter-popover-content"
      className="w-[460px]"
    >
      {renderMobileFilterContent(false)}
      <div
        id="filter-popover-footer"
        data-cy="okr-filter-popover-footer"
        className="flex justify-end gap-3 pt-4"
      >
        <Button
          id="filter-reset-button"
          data-cy="okr-filter-reset-button"
          onClick={handleReset}
          className="px-6 rounded-lg text-sm text-gray-700 border-gray-300"
        >
          Reset
        </Button>
        <Button
          id="filter-save-button"
          data-cy="okr-filter-save-button"
          type="primary"
          onClick={closeFilterModal}
          className="px-6 rounded-lg text-sm bg-okr-primary border-okr-primary"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  const filterPopoverTitle = (
    <div
      id="filter-popover-header"
      data-cy="okr-filter-popover-header"
      className="flex justify-between items-start"
    >
      <div data-cy="okr-filter-popover-header-content">
        <h3
          id="filter-popover-title"
          data-cy="okr-filter-popover-title"
          className="text-lg font-bold text-gray-900"
        >
          Filter
        </h3>
        <p
          id="filter-popover-subtitle"
          data-cy="okr-filter-popover-subtitle"
          className="text-sm text-gray-500 mt-1"
        >
          Select All filters that apply
        </p>
      </div>
      <button
        id="filter-popover-close-button"
        data-cy="okr-filter-popover-close-button"
        onClick={closeFilterModal}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        aria-label="Close filter"
      >
        <CloseOutlined className="text-lg" />
      </button>
    </div>
  );

  const mobileModalHeader = (
    <div
      id="filter-modal-header"
      data-cy="okr-filter-modal-header"
      className="flex justify-between items-start pb-4"
    >
      <div data-cy="okr-filter-modal-header-content">
        <h3
          id="filter-modal-title"
          data-cy="okr-filter-modal-title"
          className="text-lg font-bold text-gray-900"
        >
          Filter
        </h3>
        <p
          id="filter-modal-subtitle"
          data-cy="okr-filter-modal-subtitle"
          className="text-sm text-gray-500 mt-1"
        >
          Select All filters that apply
        </p>
      </div>
      <button
        id="filter-modal-close-button"
        data-cy="okr-filter-modal-close-button"
        onClick={closeFilterModal}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        aria-label="Close modal"
      >
        <CloseOutlined className="text-lg" />
      </button>
    </div>
  );

  if (embedded) {
    const isMobileView = isMobile || isTablet;
    return (
      <div
        id="okr-filter-button-wrapper"
        data-cy={dataCy || 'okr-filter-button-wrapper'}
        className="w-full sm:w-auto flex justify-end"
      >
        {isMobileView ? (
          <>
            <Button
              id="desktop-filter-button"
              data-cy="okr-desktop-filter-button"
              type="default"
              aria-label="Filter"
              title="Filter"
              onClick={openFilterModal}
              className="flex h-10 w-10 min-h-10 min-w-[40px] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-0 shadow-sm hover:bg-gray-50"
              icon={
                <FilterAltOutlinedIcon className="py-1" sx={{ fontSize: 22 }} />
              }
            />
            <Modal
              data-cy="okr-mobile-filter-modal"
              open={isModalOpen}
              onCancel={closeFilterModal}
              afterClose={() => {
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
              }}
              destroyOnClose
              title={mobileModalHeader}
              closable={false}
              wrapClassName="okr-mobile-filter-sheet"
              width="100%"
              styles={{ content: { borderRadius: 8 } }}
              style={{ maxWidth: '100%', paddingBottom: 0 }}
              footer={
                <div
                  id="mobile-filter-modal-footer"
                  data-cy="okr-mobile-filter-modal-footer"
                  className="flex justify-end gap-3 pt-4"
                >
                  <Button
                    id="mobile-filter-reset-button"
                    data-cy="okr-mobile-filter-reset-button"
                    onClick={handleReset}
                    className="px-6 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Reset
                  </Button>
                  <Button
                    id="mobile-filter-save-button"
                    data-cy="okr-mobile-filter-save-button"
                    type="primary"
                    onClick={closeFilterModal}
                    className="px-6 rounded-lg text-sm bg-okr-primary border-okr-primary"
                  >
                    Save Filter
                  </Button>
                </div>
              }
            >
              {renderMobileFilterContent(isMobileView && isMyOkrTab)}
            </Modal>
          </>
        ) : (
          <Popover
            content={filterPopoverContent}
            title={filterPopoverTitle}
            trigger="click"
            open={isModalOpen}
            onOpenChange={(visible) => setFilterModalOpen(visible)}
            placement="bottomRight"
            overlayClassName="okr-filter-popover"
            overlayStyle={{ width: 500 }}
            arrow={false}
          >
            <Button
              id="desktop-filter-button"
              data-cy="okr-desktop-filter-button"
              type="default"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              icon={
                <FilterAltOutlinedIcon className="py-1" sx={{ fontSize: 22 }} />
              }
            >
              Filter
            </Button>
          </Popover>
        )}
      </div>
    );
  }

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
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                          Employee
                        </span>
                        <Select
                          showSearch
                          placeholder="All employees"
                          className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                          allowClear
                          getPopupContainer={popupContainer}
                          value={selectValueOrUndefined(searchObjParams.userId)}
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
                          Department
                        </span>
                        <Select
                          placeholder="All departments"
                          className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                          allowClear
                          showSearch
                          getPopupContainer={popupContainer}
                          value={selectValueOrUndefined(
                            searchObjParams.departmentId,
                          )}
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
                        value={selectValueOrUndefined(fiscalYearId)}
                        placeholder="Filter by Fiscal Year"
                        onChange={(value) => setFiscalYearId(value ?? '')}
                        allowClear
                        showSearch
                        getPopupContainer={popupContainer}
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
                        value={selectValueOrUndefined(sessionIds?.[0])}
                        placeholder="Filter by Session"
                        className="w-full [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:rounded-lg"
                        allowClear
                        showSearch
                        getPopupContainer={popupContainer}
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
                icon={
                  <FilterAltOutlinedIcon
                    className="text-black/70 py-1"
                    sx={{ fontSize: 18 }}
                  />
                }
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
                className="w-full [&_.ant-select-selector]:!min-h-14 [&_.ant-select-selector]:!h-auto [&_.ant-select-selector]:!overflow-hidden [&_.ant-select-selection-overflow]:!flex-nowrap"
                allowClear
                showSearch
                maxTagCount={useAllSessionsForEmployeeOkr ? 1 : undefined}
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

            {/* Objective Type */}
            {showMetricTypeFilter && (
              <div
                className="col-span-12 lg:col-span-2"
                data-cy="okr-desktop-objective-type-container"
              >
                <Select
                  id="desktop-objective-type-select"
                  data-cy="okr-desktop-objective-type-select"
                  placeholder="Filter by Objective Type"
                  className="w-full h-14"
                  allowClear
                  value={selectValueOrUndefined(
                    searchObjParams.objectiveTypeId,
                  )}
                  onChange={(value) =>
                    handleFilter(value ?? '', 'objectiveTypeId')
                  }
                >
                  {objectiveTypes.map((type) => (
                    <Option
                      data-cy={`okr-desktop-objective-type-select-option-${type.id}`}
                      key={type.id}
                      value={type.id}
                    >
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            {/* BSC Pillar */}
            {showMetricTypeFilter && (
              <div
                className="col-span-12 lg:col-span-2"
                data-cy="okr-desktop-bsc-pillar-container"
              >
                <Select
                  id="desktop-bsc-pillar-select"
                  data-cy="okr-desktop-bsc-pillar-select"
                  placeholder="Filter by BSC Pillar"
                  className="w-full h-14"
                  allowClear
                  value={selectValueOrUndefined(searchObjParams.bscPillarId)}
                  onChange={(value) => handleFilter(value ?? '', 'bscPillarId')}
                >
                  {BSC_PILLARS.map((pillar) => (
                    <Option
                      data-cy={`okr-desktop-bsc-pillar-select-option-${pillar.id}`}
                      key={pillar.id}
                      value={pillar.id}
                    >
                      {pillar.name}
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
              onClick={openFilterModal}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
              title=""
              icon={
                <FilterAltOutlinedIcon
                  data-cy="okr-mobile-filter-button-icon"
                  className="py-1"
                  sx={{ fontSize: 24 }}
                />
              }
            />
          </div>
        </div>

        <Modal
          data-cy="okr-mobile-filter-modal"
          open={isModalOpen}
          onCancel={closeFilterModal}
          afterClose={() => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
          }}
          destroyOnClose
          title={mobileModalHeader}
          closable={false}
          wrapClassName="okr-mobile-filter-sheet"
          footer={
            <div
              id="mobile-filter-modal-footer"
              data-cy="okr-mobile-filter-modal-footer"
              className="flex justify-end gap-3 pt-4"
            >
              <Button
                id="mobile-filter-reset-button"
                data-cy="okr-mobile-filter-reset-button"
                onClick={handleReset}
                className="px-6 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
              >
                Reset
              </Button>
              <Button
                id="mobile-filter-save-button"
                data-cy="okr-mobile-filter-save-button"
                type="primary"
                onClick={closeFilterModal}
                className="px-6 rounded-lg text-sm bg-okr-primary border-okr-primary"
              >
                Save Filter
              </Button>
            </div>
          }
          className="md:hidden"
          width="100%"
          styles={{ content: { borderRadius: 8 } }}
          style={{ maxWidth: '100%', paddingBottom: 0 }}
        >
          {renderMobileFilterContent(isMyOkrTab)}
        </Modal>
      </div>
    </>
  );
};

export default OkrSearch;
