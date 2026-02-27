import React, { useEffect, useRef } from 'react';
import { Select, Modal, Button, Popover } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useOKRStore, useSearchFilterStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';

const { Option } = Select;

interface OkrSearchProps {
  embedded?: boolean;
  'data-cy'?: string;
}

const OkrSearch: React.FC<OkrSearchProps> = ({ embedded = false, 'data-cy': dataCy }) => {
  const {
    isFilterModalOpen: isModalOpen,
    openFilterModal,
    closeFilterModal,
    setFilterModalOpen,
  } = useSearchFilterStore();
  const { isMobile, isTablet } = useIsMobile();
  const {
    searchObjParams,
    setSearchObjParams,
    okrTab,
    setFiscalYearId,
    fiscalYearId,
    setSessionIds,
    sessionIds,
  } = useOKRStore();

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
        if (okrTab == 4) {
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

      if (okrTab == 4) {
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
        if (okrTab == 4) {
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

  const handleReset = () => {
    setFiscalYearId('');
    setSessionIds([]);
    handleFilter('', 'metricTypeId');
    handleFilter('', 'userId');
    handleFilter('', 'departmentId');
  };

  const MobileFilterContent = () => (
    <div
      id="mobile-filter-content"
      data-cy="okr-mobile-filter-content"
      className="flex flex-col gap-4"
    >
      {/* Employee – full width, label above (same fields as desktop) */}
      {String(okrTab) !== '1' && (
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
            Employee <span className="text-red-500">*</span>
          </label>
          <Select
            id="mobile-employee-select"
            data-cy="okr-mobile-employee-select"
            showSearch
            placeholder="Input"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={(node) => node.parentElement ?? document.body}
            value={searchObjParams.userId}
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

      {/* Department – full width (same as desktop when tab != 1) */}
      {String(okrTab) !== '1' && (
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
            Department <span className="text-red-500">*</span>
          </label>
          <Select
            id="mobile-department-select"
            data-cy="okr-mobile-department-select"
            placeholder="Select"
            className="w-full h-12 rounded-lg"
            allowClear
            showSearch
            value={searchObjParams.departmentId}
            onChange={(value) => handleFilter(value, 'departmentId')}
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
          Fiscal Year <span className="text-red-500">*</span>
        </label>
        <Select
          loading={fyLoading}
          value={fiscalYearId}
          id="mobile-fiscal-year-select"
          data-cy="okr-mobile-fiscal-year-select"
          placeholder="Select"
          onChange={(value) => setFiscalYearId(value)}
          allowClear
          showSearch
          getPopupContainer={(node) => node.parentElement ?? document.body}
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
          Session <span className="text-red-500">*</span>
        </label>
        <Select
          loading={fyLoading}
          value={okrTab == 4 ? sessionIds : sessionIds?.[0]}
          id="mobile-session-select"
          data-cy="okr-mobile-session-select"
          placeholder="Select"
          className="w-full h-12 rounded-lg overflow-y-auto"
          allowClear
          showSearch
          getPopupContainer={(node) => node.parentElement ?? document.body}
          onChange={(value: any) => {
            if (okrTab == 4) {
              setSessionIds(
                Array.isArray(value) ? value : value ? [value] : [],
              );
            } else {
              setSessionIds(value ? [value] : []);
            }
          }}
          mode={okrTab == 4 ? 'multiple' : undefined}
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

      {/* Metric Type – full width (same as desktop when tab != 4) */}
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
            Metric Type <span className="text-red-500">*</span>
          </label>
          <Select
            id="mobile-metric-type-select"
            data-cy="okr-mobile-metric-type-select"
            placeholder="Select"
            className="w-full h-12 rounded-lg"
            allowClear
            getPopupContainer={(node) => node.parentElement ?? document.body}
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

  const filterPopoverContent = (
    <div
      id="filter-popover-content"
      data-cy="okr-filter-popover-content"
      className="w-[460px]"
    >
      <MobileFilterContent data-cy="okr-filter-popover-fields" />
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
      <div>
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
      <div>
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
              onClick={openFilterModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              icon={<LuSettings2 size={16} />}
            >
              Filter
            </Button>
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
              <MobileFilterContent data-cy="okr-mobile-filter-content" />
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
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              icon={<LuSettings2 size={16} />}
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
        <div
          id="desktop-search-grid"
          data-cy="okr-desktop-search-grid"
          className="grid grid-cols-12 gap-4"
        >
          {/* User Filter */}
          {okrTab != 1 && (
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
            className={`${okrTab == 4 ? 'col-span-3' : 'col-span-2'}`}
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
            className={`${okrTab == 4 ? 'col-span-3' : 'col-span-2'}`}
            data-cy="okr-desktop-session-container"
          >
            <Select
              loading={fyLoading}
              value={okrTab == 4 ? sessionIds : sessionIds?.[0]}
              id="desktop-session-select"
              data-cy="okr-desktop-session-select"
              placeholder="Filter by Session"
              className="w-full h-14 overflow-y-auto text-[10px]"
              allowClear
              showSearch
              onChange={(value: any) => {
                if (okrTab == 4) {
                  setSessionIds(
                    Array.isArray(value) ? value : value ? [value] : [],
                  );
                } else {
                  setSessionIds(value ? [value] : []);
                }
              }}
              mode={okrTab == 4 ? 'multiple' : undefined}
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
          {okrTab != 1 && (
            <div
              className={`${okrTab == 4 ? 'col-span-2' : 'col-span-2'}`}
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
          {okrTab != 4 && (
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
          style={{ maxWidth: '100%', paddingBottom: 0 }}
        >
          <MobileFilterContent data-cy="okr-mobile-filter-content" />
        </Modal>
      </div>
    </>
  );
};

export default OkrSearch;
