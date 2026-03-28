import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Table, Avatar, Button, Popover, Modal, Select } from 'antd';
import { UserOutlined, CloseOutlined } from '@ant-design/icons';
import { LuSettings2 } from 'react-icons/lu';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetEmployeeOkr } from '@/store/server/features/okrplanning/okr/objective/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetSessionById } from '@/store/server/features/payroll/payroll/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';

const { Option } = Select;

// Memoized score tag component to prevent unnecessary re-renders
const ScoreTag = React.memo(({ score }: { score: number }): JSX.Element => {
  if (score >= 90)
    return (
      <span
        className="block w-24 text-center bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold"
        data-cy={`okr-employee-score-tag-green-${score}`}
      >
        {score?.toLocaleString()}%
      </span>
    );
  if (score >= 75)
    return (
      <span
        className="block w-24 text-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold"
        data-cy={`okr-employee-score-tag-yellow-${score}`}
      >
        {score?.toLocaleString()}%
      </span>
    );
  return (
    <span
      className="block w-24 text-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold"
      data-cy={`okr-employee-score-tag-red-${score}`}
    >
      {score?.toLocaleString()}%
    </span>
  );
});

// Memoized employee details component to prevent unnecessary re-renders
const EmployeeDetails = React.memo(
  ({ empId, type }: { empId: string; type: string }) => {
    const { data: userDetails, isLoading, error } = useGetEmployee(empId);

    if (isLoading)
      return (
        <>
          <LoadingOutlined />
        </>
      );

    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
      '-';
    const email = `${userDetails?.email} ` || '-';
    const profileImage = userDetails?.profileImage;
    const jobPosition =
      `${userDetails?.employeeJobInformation[0]?.position?.name} ` || '-';
    const department =
      `${userDetails?.employeeJobInformation[0]?.department?.name} ` || '-';
    return (
      <>
        {type === 'user' ? (
          <div className="flex gap-2" data-cy="employee-okr-user-info">
            <Avatar src={profileImage} icon={<UserOutlined />} />
            <div data-cy="employee-okr-user-details">
              {userName}
              <div
                className="text-xs text-gray-500"
                data-cy="employee-okr-user-email"
              >
                {email}
              </div>
            </div>
          </div>
        ) : (
          <span
            className="text-xs text-gray-500"
            data-cy={`employee-okr-${type}-info`}
          >
            {type == 'job' ? jobPosition : department}
          </span>
        )}
      </>
    );
  },
);

// Memoized session detail component to prevent unnecessary re-renders
const SessionDetail = React.memo(({ sessionId }: { sessionId: string[] }) => {
  const { data: session, isLoading, error } = useGetSessionById(sessionId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !session) return '-';

  const sessionName = `${session?.name}` || '-';

  return (
    <span className="text-xs text-gray-500" data-cy="employee-okr-session-name">
      {sessionName}
    </span>
  );
});

const EmployeeOKRTable: React.FC = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const {
    employeeSearchObjParams,
    employeeSessionIds,
    employeePageSize,
    employeeCurrentPage,
    setEmployeePageSize,
    setEmployeeCurrentPage,
    setEmployeeSearchObjParams,
    employeeFiscalYearId,
    setEmployeeFiscalYearId,
    setEmployeeSessionIds,
  } = useOKRStore();

  const {
    data: employeeOkr,
    isLoading,
    refetch,
  } = useGetEmployeeOkr(
    employeeSessionIds,
    employeeSearchObjParams,
    employeePageSize,
    employeeCurrentPage,
  );

  const { isMobile, isTablet } = useIsMobile();
  const { data: getAllFiscalYears, isLoading: fyLoading } =
    useGetAllFiscalYears();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { data: Departments } = useGetUserDepartment();
  const { data: allUsers } = useGetAllUsers();
  const { data: Metrics } = useGetMetrics();

  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );

  const handleFilter = (
    value: string,
    key: keyof typeof employeeSearchObjParams,
  ) => {
    setEmployeeSearchObjParams(key, value);
  };

  const handleReset = () => {
    const defaultFiscalYear =
      activeFiscalYear ||
      getAllFiscalYears?.items?.find((fy: any) => fy?.active) ||
      getAllFiscalYears?.items?.[0];
    const allSessionIds =
      defaultFiscalYear?.sessions?.map((session: any) => session?.id) || [];

    setEmployeeFiscalYearId(defaultFiscalYear?.id || '');
    setEmployeeSessionIds(allSessionIds);
    handleFilter('', 'departmentId');
    handleFilter('', 'userId');
    handleFilter('', 'metricTypeId');
  };

  // Memoize data source to prevent unnecessary re-renders
  const dataSource = useMemo(
    () => (Array.isArray(employeeOkr?.items) ? employeeOkr?.items : []),
    [employeeOkr?.items],
  );

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: 'Employee Name',
        dataIndex: 'userId',
        key: 'userId',
        render: (userId: string) => (
          <EmployeeDetails type="user" empId={userId} />
        ),
      },
      {
        title: 'Job Title',
        dataIndex: 'title',
        key: 'title',
        render: (notused: any, render: any) => (
          <EmployeeDetails type="job" empId={render?.userId} />
        ),
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        render: (notused: any, render: any) => (
          <EmployeeDetails type="department" empId={render?.userId} />
        ),
      },
      {
        title: 'Quarter',
        dataIndex: 'quarter',
        key: 'quarter',
        render: (notused: any, render: any) => (
          <SessionDetail sessionId={render?.sessionId} />
        ),
      },
      {
        title: 'OKR Score',
        dataIndex: 'okrScore',
        key: 'okrScore',
        render: (score: number) => <ScoreTag score={score} />,
      },
    ],
    [],
  );

  // Filter content component for popover/modal
  const FilterContent = () => (
    <div
      id="employee-okr-filter-content"
      data-cy="employee-okr-filter-content"
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-cy="employee-okr-filter-content-div">
        {/* Employee Filter */}
        <div
          id="employee-okr-employee-field"
          data-cy="employee-okr-employee-field"
          className="flex flex-col gap-2"
        >
          <label
            id="employee-okr-employee-label"
            data-cy="employee-okr-employee-label"
            className="text-sm font-medium text-gray-700"
          >
            Employee{' '}
            <span
              className="text-red-500"
              data-cy="employee-okr-employee-required"
            >
              *
            </span>
          </label>
          <Select
            id="employee-okr-employee-select"
            data-cy="employee-okr-employee-select"
            showSearch
            placeholder="Select a person"
            className="w-full h-10 rounded-md"
            allowClear
            value={employeeSearchObjParams.userId}
            onChange={(value) => handleFilter(value, 'userId')}
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

        {/* Department */}
        <div
          id="employee-okr-department-field"
          data-cy="employee-okr-department-field"
          className="flex flex-col gap-2"
        >
          <label
            id="employee-okr-department-label"
            data-cy="employee-okr-department-label"
            className="text-sm font-medium text-gray-700"
          >
            Department
          </label>
          <Select
            id="employee-okr-department-select"
            data-cy="employee-okr-department-select"
            placeholder="Filter by Department"
            className="w-full h-10 rounded-md"
            allowClear
            showSearch
            value={employeeSearchObjParams.departmentId}
            onChange={(value) => handleFilter(value, 'departmentId')}
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {DepartmentWithUsers?.map((dept: any) => (
              <Option
                data-cy={`employee-okr-department-select-option-${dept?.id}`}
                key={dept.id}
                value={dept.id}
              >
                {dept.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Fiscal Year */}
      <div
        id="employee-okr-fiscal-year-field"
        data-cy="employee-okr-fiscal-year-field"
        className="flex flex-col gap-2"
      >
        <label
          id="employee-okr-fiscal-year-label"
          data-cy="employee-okr-fiscal-year-label"
          className="text-sm font-medium text-gray-700"
        >
          Fiscal Year{' '}
          <span
            className="text-red-500"
            data-cy="employee-okr-fiscal-year-required"
          >
            *
          </span>
        </label>
        <Select
          loading={fyLoading}
          value={employeeFiscalYearId}
          id="employee-okr-fiscal-year-select"
          data-cy="employee-okr-fiscal-year-select"
          placeholder="Filter by Fiscal Year"
          onChange={(value) => {
            const selectedFiscalYear = getAllFiscalYears?.items?.find(
              (fy: any) => fy?.id === value,
            );
            const allSessionIds =
              selectedFiscalYear?.sessions?.map((session: any) => session?.id) ||
              [];

            setEmployeeFiscalYearId(value || '');
            setEmployeeSessionIds(allSessionIds);
          }}
          allowClear
          showSearch
          className="w-full h-10 rounded-md"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {getAllFiscalYears?.items?.map((item: any) => (
            <Select.Option
              data-cy={`employee-okr-fiscal-year-select-option-${item?.id}`}
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
        id="employee-okr-session-field"
        data-cy="employee-okr-session-field"
        className="flex flex-col gap-2"
      >
        <label
          id="employee-okr-session-label"
          data-cy="employee-okr-session-label"
          className="text-sm font-medium text-gray-700"
        >
          Session{' '}
          <span
            className="text-red-500"
            data-cy="employee-okr-session-required"
          >
            *
          </span>
        </label>
        <Select
          loading={fyLoading}
          value={employeeSessionIds}
          id="employee-okr-session-select"
          data-cy="employee-okr-session-select"
          placeholder="Filter by Session"
          className="w-full min-h-[40px] rounded-md"
          allowClear
          showSearch
          maxTagCount="responsive"
          maxTagTextLength={14}
          maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
          listHeight={200}
          dropdownStyle={{ maxHeight: 220, overflowY: 'auto' }}
          onChange={(value: any) => {
            setEmployeeSessionIds(
              Array.isArray(value) ? value : value ? [value] : [],
            );
          }}
          mode="multiple"
          filterOption={(input, option) =>
            (option?.children as any)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {getAllFiscalYears?.items
            ?.find((fy: any) => fy.id === employeeFiscalYearId)
            ?.sessions?.map((session: any) => (
              <Option
                data-cy={`employee-okr-session-select-option-${session?.id}`}
                key={session.id}
                value={session.id}
              >
                {session.name}
              </Option>
            ))}
        </Select>
      </div>

      {/* Metric Type */}
      <div
        id="employee-okr-metric-type-field"
        data-cy="employee-okr-metric-type-field"
        className="flex flex-col gap-2"
      >
        <label
          id="employee-okr-metric-type-label"
          data-cy="employee-okr-metric-type-label"
          className="text-sm font-medium text-gray-700"
        >
          Metric Type{' '}
          <span
            className="text-red-500"
            data-cy="employee-okr-metric-type-required"
          >
            *
          </span>
        </label>
        <Select
          id="employee-okr-metric-type-select"
          data-cy="employee-okr-metric-type-select"
          placeholder="Filter by Metric Type"
          className="w-full h-10 rounded-md"
          allowClear
          value={employeeSearchObjParams.metricTypeId}
          onChange={(value) => handleFilter(value, 'metricTypeId')}
        >
          <Option
            data-cy="employee-okr-metric-type-select-option-all"
            value=""
          >
            All
          </Option>
          {Metrics?.items?.map((metric: any) => (
            <Option
              data-cy={`employee-okr-metric-type-select-option-${metric?.id}`}
              key={metric.id}
              value={metric.id}
            >
              {metric.name}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );

  const filterPopoverContent = (
    <div
      id="employee-okr-filter-popover-content"
      data-cy="employee-okr-filter-popover-content"
      className="w-[460px] max-w-[460px]"
    >
      <FilterContent />
      <div
        id="employee-okr-filter-popover-footer"
        data-cy="employee-okr-filter-popover-footer"
        className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100"
      >
        <Button
          id="employee-okr-filter-reset-button"
          data-cy="employee-okr-filter-reset-button"
          onClick={handleReset}
          className="h-8 px-4 rounded-md text-xs text-gray-700 border-gray-300"
        >
          Reset
        </Button>
        <Button
          id="employee-okr-filter-save-button"
          data-cy="employee-okr-filter-save-button"
          type="primary"
          onClick={() => setIsFilterModalOpen(false)}
          className="h-8 px-4 rounded-md text-xs bg-okr-primary border-okr-primary"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  const filterPopoverTitle = (
    <div
      id="employee-okr-filter-popover-header"
      data-cy="employee-okr-filter-popover-header"
      className="flex justify-between items-start"
    >
      <div data-cy="employee-okr-filter-popover-header-content">
        <h3
          id="employee-okr-filter-popover-title"
          data-cy="employee-okr-filter-popover-title"
          className="text-base font-bold text-gray-900"
        >
          Filter
        </h3>
        <p
          id="employee-okr-filter-popover-subtitle"
          data-cy="employee-okr-filter-popover-subtitle"
          className="text-xs text-gray-500 mt-1"
        >
          Select All filters that apply
        </p>
      </div>
      <button
        id="employee-okr-filter-popover-close-button"
        data-cy="employee-okr-filter-popover-close-button"
        onClick={() => setIsFilterModalOpen(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        aria-label="Close filter"
      >
        <CloseOutlined className="text-lg" />
      </button>
    </div>
  );

  const mobileModalHeader = (
    <div
      id="employee-okr-filter-modal-header"
      data-cy="employee-okr-filter-modal-header"
      className="flex justify-between items-start pb-4"
    >
      <div data-cy="employee-okr-filter-modal-header-content">
        <h3
          id="employee-okr-filter-modal-title"
          data-cy="employee-okr-filter-modal-title"
          className="text-lg font-bold text-gray-900"
        >
          Filter
        </h3>
        <p
          id="employee-okr-filter-modal-subtitle"
          data-cy="employee-okr-filter-modal-subtitle"
          className="text-sm text-gray-500 mt-1"
        >
          Select All filters that apply
        </p>
      </div>
      <button
        id="employee-okr-filter-modal-close-button"
        data-cy="employee-okr-filter-modal-close-button"
        onClick={() => setIsFilterModalOpen(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        aria-label="Close modal"
      >
        <CloseOutlined className="text-lg" />
      </button>
    </div>
  );

  // Memoize pagination change handler
  const onPageChange = useCallback(
    (page: number, pageSize?: number) => {
      setEmployeeCurrentPage(page);
      if (pageSize) {
        setEmployeePageSize(pageSize);
      }
    },
    [setEmployeeCurrentPage, setEmployeePageSize],
  );

  useEffect(() => {
    refetch();
  }, [employeeSessionIds, refetch, employeeSearchObjParams]);

  useEffect(() => {
    if (employeeFiscalYearId) return;

    const defaultFiscalYear =
      activeFiscalYear ||
      getAllFiscalYears?.items?.find((fy: any) => fy?.active) ||
      getAllFiscalYears?.items?.[0];

    if (!defaultFiscalYear?.id) return;

    const allSessionIds =
      defaultFiscalYear?.sessions?.map((session: any) => session?.id) || [];

    setEmployeeFiscalYearId(defaultFiscalYear?.id);
    setEmployeeSessionIds(allSessionIds);
  }, [
    activeFiscalYear,
    getAllFiscalYears?.items,
    employeeFiscalYearId,
    setEmployeeFiscalYearId,
    setEmployeeSessionIds,
  ]);

  return (
    <div
      id="okr-employee-okr-table-container"
      data-cy="okr-employee-okr-table-container"
      className="py-6"
    >
      {/* Search and Filter Controls */}
      <div
        id="employee-okr-search-filter-container"
        data-cy="employee-okr-search-filter-container"
        className="mb-4 flex justify-between items-center gap-3"
      >
        {/* Search Input */}
        <div
          id="employee-okr-search-input-container"
          data-cy="employee-okr-search-input-container"
          className="flex-1 sm:flex-none min-w-0"
        >
          <Select
            id="employee-okr-search-input"
            data-cy="employee-okr-search-input"
            showSearch
            allowClear
            placeholder="Search Employee"
            value={employeeSearchObjParams.userId || undefined}
            onChange={(value) => handleFilter(value || '', 'userId')}
            className="h-10 w-full sm:w-[300px]"
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

        {/* Filter Button - Desktop */}
        {!isMobile && !isTablet && (
          <Popover
            content={filterPopoverContent}
            title={filterPopoverTitle}
            trigger="click"
            open={isFilterModalOpen}
            onOpenChange={(visible) => setIsFilterModalOpen(visible)}
            placement="bottomRight"
            overlayClassName="employee-okr-filter-popover"
            overlayStyle={{ width: 500 }}
            arrow={false}
          >
            <Button
              id="employee-okr-desktop-filter-button"
              data-cy="employee-okr-desktop-filter-button"
              type="default"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 h-10"
              icon={<LuSettings2 size={16} />}
            >
              Filter
            </Button>
          </Popover>
        )}

        {/* Filter Button - Mobile */}
        {(isMobile || isTablet) && (
          <>
            <Button
              id="employee-okr-mobile-filter-button"
              data-cy="employee-okr-mobile-filter-button"
              type="default"
              onClick={() => setIsFilterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg h-10 flex-shrink-0"
              icon={<LuSettings2 size={20} />}
            >
              Filter
            </Button>
            <Modal
              data-cy="employee-okr-mobile-filter-modal"
              open={isFilterModalOpen}
              onCancel={() => setIsFilterModalOpen(false)}
              title={mobileModalHeader}
              closable={false}
              wrapClassName="okr-mobile-filter-sheet"
              footer={
                <div
                  id="employee-okr-mobile-filter-modal-footer"
                  data-cy="employee-okr-mobile-filter-modal-footer"
                  className="flex justify-end gap-3 pt-4"
                >
                  <Button
                    id="employee-okr-mobile-filter-reset-button"
                    data-cy="employee-okr-mobile-filter-reset-button"
                    onClick={handleReset}
                    className="px-6 rounded-lg text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Reset
                  </Button>
                  <Button
                    id="employee-okr-mobile-filter-save-button"
                    data-cy="employee-okr-mobile-filter-save-button"
                    type="primary"
                    onClick={() => setIsFilterModalOpen(false)}
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
              <FilterContent />
            </Modal>
          </>
        )}
      </div>

      <div
        className={isMobile || isTablet ? 'overflow-x-auto' : ''}
        style={
          isMobile || isTablet
            ? { WebkitOverflowScrolling: 'touch' }
            : undefined
        }
        data-cy="employee-okr-table-wrapper"
      >
        <Table
          id="okr-employee-okr-table"
          data-cy="okr-employee-okr-table"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          loading={isLoading}
          scroll={{
            y: 400,
            ...(isMobile || isTablet ? { x: 'max-content' } : {}),
          }}
          rowKey="id"
        />
      </div>

      {isMobile || isTablet ? (
        <CustomMobilePagination
          data-cy="okr-employee-okr-mobile-pagination"
          totalResults={employeeOkr?.meta?.totalItems ?? 0}
          pageSize={employeePageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          data-cy="okr-employee-okr-desktop-pagination"
          current={employeeOkr?.meta?.currentPage ?? 0}
          total={employeeOkr?.meta?.totalItems ?? 0}
          pageSize={employeePageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => setEmployeePageSize(pageSize)}
        />
      )}
    </div>
  );
};

ScoreTag.displayName = 'ScoreTag';
EmployeeDetails.displayName = 'EmployeeDetails';
SessionDetail.displayName = 'SessionDetail';

export default React.memo(EmployeeOKRTable);
