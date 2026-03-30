import React, { useEffect, useState, useRef } from 'react';
import { Select, Modal } from 'antd';
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

const { Option } = Select;

export type OkrSearchProps = {
  /** When true, filter layout matches "All Employee OKR" (multi-session, user & department; no metric). */
  allEmployeeLayout?: boolean;
};

const OkrSearch: React.FC<OkrSearchProps> = ({
  allEmployeeLayout = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  /** `false` initial value so mounting with `allEmployeeLayout` true is treated as a layout change (e.g. Performance employees after visiting OKR). */
  const prevAllEmployeeLayoutRef = useRef<boolean>(false);
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
    const allEmployeeLayoutChanged =
      prevAllEmployeeLayoutRef.current !== allEmployeeLayout;

    // If fiscal year was changed externally, update sessions for that fiscal year
    if (fiscalYearChangedExternally && fiscalYearId) {
      const selectedFiscalYear = getAllFiscalYears?.items?.find(
        (i) => i?.id == fiscalYearId,
      );

      if (selectedFiscalYear) {
        if (allEmployeeLayout || okrTab == 4) {
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
      prevAllEmployeeLayoutRef.current = allEmployeeLayout;
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

      if (allEmployeeLayout || okrTab == 4) {
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
      prevAllEmployeeLayoutRef.current = allEmployeeLayout;
      initializedRef.current = true;
      return;
    }

    // If okrTab or employee-perf layout changed, update sessions for current fiscal year
    if ((okrTabChanged || allEmployeeLayoutChanged) && fiscalYearId) {
      const selectedFiscalYear = getAllFiscalYears?.items?.find(
        (i) => i?.id == fiscalYearId,
      );

      if (selectedFiscalYear) {
        if (allEmployeeLayout || okrTab == 4) {
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
      prevAllEmployeeLayoutRef.current = allEmployeeLayout;
    }

    prevAllEmployeeLayoutRef.current = allEmployeeLayout;
  }, [
    getAllFiscalYears?.items,
    getActiveFisicalYear,
    okrTab,
    allEmployeeLayout,
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
          value={treatAsAllEmployeeTab ? sessionIds : sessionIds?.[0]}
          id="mobile-session-select"
          data-cy="okr-mobile-session-select"
          placeholder="Filter by Session"
          className="w-full h-14 overflow-y-auto text-[10px]"
          allowClear
          showSearch
          onChange={(value: any) => {
            if (treatAsAllEmployeeTab) {
              setSessionIds(
                Array.isArray(value) ? value : value ? [value] : [],
              );
            } else {
              setSessionIds(value ? [value] : []);
            }
          }}
          mode={treatAsAllEmployeeTab ? 'multiple' : undefined}
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
      {showUserAndDepartmentFilters && (
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
      {showMetricTypeFilter && (
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
              value={treatAsAllEmployeeTab ? sessionIds : sessionIds?.[0]}
              id="desktop-session-select"
              data-cy="okr-desktop-session-select"
              placeholder="Filter by Session"
              className="w-full h-14 overflow-y-auto text-[10px]"
              allowClear
              showSearch
              onChange={(value: any) => {
                if (treatAsAllEmployeeTab) {
                  setSessionIds(
                    Array.isArray(value) ? value : value ? [value] : [],
                  );
                } else {
                  setSessionIds(value ? [value] : []);
                }
              }}
              mode={treatAsAllEmployeeTab ? 'multiple' : undefined}
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
          {showUserAndDepartmentFilters && (
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
            className={`${okrTab == 1 && !allEmployeeLayout ? 'ml-auto' : ''}`}
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
