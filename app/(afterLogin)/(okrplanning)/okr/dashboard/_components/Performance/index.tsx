'use client';

import { Select, Spin, DatePicker, Button, Pagination } from 'antd';
import type React from 'react';
import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKRDashboardStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/dashboard';
import { CalendarOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useExcelExport } from './useExcelExport';
import {
  useGetAllUsersAverageScoreByDate,
  useGetUserAverageScoreByDate,
  useGetActiveMonth,
} from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useGetActiveEmployee,
  useEmployeeAllFilter,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Performance: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const {
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedFilter,
    setSelectedFilter,
    searchTerm,
    setSearchTerm,
    personalFilter,
    setPersonalFilter,
    dateRange,
    setDateRange,
    personalDateRange,
    setPersonalDateRange,
  } = OKRDashboardStore();

  const [isExporting, setIsExporting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { exportPerformanceData } = useExcelExport();

  const formatDate = (date: any) => {
    if (!date) return null;
    return date.format('YYYY-MM-DD');
  };

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '-';
    return `${score}%`;
  };

  const startDate = dateRange?.[0] ? formatDate(dateRange[0]) : null;
  const endDate = dateRange?.[1] ? formatDate(dateRange[1]) : null;
  const personalStartDate = personalDateRange?.[0]
    ? formatDate(personalDateRange[0])
    : null;
  const personalEndDate = personalDateRange?.[1]
    ? formatDate(personalDateRange[1])
    : null;

  const { searchParams } = useEmployeeManagementStore();

  const hasActiveSearchParams = Object.values(searchParams).some(
    (value) => value && value !== '' && value !== 'after',
  );

  const { data: filteredEmployeeData, isLoading: isLoadingEmployeeList } =
    useEmployeeAllFilter(
      1000,
      1,
      searchParams.allOffices || '',
      searchParams.allJobs || '',
      searchParams.employee_name || '',
      searchParams.allStatus || '',
      searchParams.gender || '',
      searchParams.employmentType || '',
      searchParams.joinedDate || '',
      searchParams.joinedDateType || 'after',
    );

  const { data: allEmployees, isLoading: isLoadingAllEmployees } =
    useGetActiveEmployee();

  const { data: activeMonth, isLoading: isLoadingActiveMonth } =
    useGetActiveMonth();

  const activeMonthStart = activeMonth?.startDate
    ? dayjs(activeMonth.startDate).format('YYYY-MM-DD')
    : dayjs().startOf('month').format('YYYY-MM-DD');
  const activeMonthEnd = activeMonth?.endDate
    ? dayjs(activeMonth.endDate).format('YYYY-MM-DD')
    : dayjs().endOf('month').format('YYYY-MM-DD');

  const { data: allUsersAverage, isLoading: isLoadingAdmin } =
    useGetAllUsersAverageScoreByDate({
      startDate: startDate || activeMonthStart,
      endDate: endDate || activeMonthEnd,
      page: currentPage,
      limit: pageSize,
    });

  // Separate hook for Excel export with large page size
  const { refetch: refetchAllUsers } = useGetAllUsersAverageScoreByDate(
    {
      startDate: startDate || activeMonthStart,
      endDate: endDate || activeMonthEnd,
      page: 1,
      limit: 10000, // Very large limit to get all users
    },
    {
      enabled: false, // Don't fetch automatically
    },
  );

  const { data: personalAverage, isLoading: isLoadingPersonal } =
    useGetUserAverageScoreByDate({
      userId: userId || '',
      startDate: personalStartDate || activeMonthStart,
      endDate: personalEndDate || activeMonthEnd,
    });

  const { data: selectedUserAverage, isLoading: isLoadingSelectedUser } =
    useGetUserAverageScoreByDate(
      {
        userId: selectedUserId || '',
        startDate: startDate || activeMonthStart,
        endDate: endDate || activeMonthEnd,
      },
      {
        enabled: !!selectedUserId,
      },
    );

  const { data: assignedPeriods } = useGetAssignedPlanningPeriodForUserId();

  const allUsersForSearch = useMemo(() => {
    const employeeData = hasActiveSearchParams
      ? filteredEmployeeData?.items || allEmployees?.items
      : allEmployees?.items || filteredEmployeeData?.items;

    if (!employeeData || !Array.isArray(employeeData)) return [];

    return employeeData.map((employee: any) => ({
      id: employee.id,
      name:
        `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
        employee.email ||
        `Employee ${employee.id}`,
      profileImage: employee.profileImage,
    }));
  }, [allEmployees, filteredEmployeeData, hasActiveSearchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value || '');
      setCurrentPage(1);

      if (value) {
        const selectedUser = allUsersForSearch.find(
          (user: any) => user.name === value,
        );
        setSelectedUserId(selectedUser?.id || null);
      } else {
        setSelectedUserId(null);
      }
    },
    [setCurrentPage, allUsersForSearch],
  );

  const handleFilterChange = useCallback((value: string) => {
    setSelectedFilter(value);
  }, []);

  const handleDateRangeChange = useCallback((dates: [any, any] | null) => {
    setDateRange(dates);
  }, []);

  const employees = useMemo(() => {
    if (selectedUserId) {
      const employee = allUsersForSearch.find(
        (user: any) => user.id === selectedUserId,
      );
      return [
        {
          id: selectedUserId,
          name: employee?.name || `Employee ${selectedUserId}`,
          profileImage: employee?.profileImage || null,
          monthly: selectedUserAverage?.monthlyAverage?.averageScore ?? null,
          weekly: selectedUserAverage?.weeklyAverage?.averageScore ?? null,
          daily: selectedUserAverage?.dailyAverage?.averageScore ?? null,
        },
      ];
    }

    if (!allUsersAverage?.users || !Array.isArray(allUsersAverage.users)) {
      return [];
    }

    const employeeMap = new Map();
    allUsersForSearch.forEach((employee: any) => {
      employeeMap.set(employee.id, employee);
    });

    return allUsersAverage.users.map((perf: any) => {
      const employee = employeeMap.get(perf.userId);
      return {
        id: perf.userId,
        name: employee ? employee.name : `Employee ${perf.userId}`,
        profileImage: employee?.profileImage || null,
        monthly: perf?.monthlyAverage?.averageScore ?? null,
        weekly: perf?.weeklyAverage?.averageScore ?? null,
        daily: perf?.dailyAverage?.averageScore ?? null,
      };
    });
  }, [allUsersAverage, allUsersForSearch, selectedUserId, selectedUserAverage]);

  const paginationData = useMemo(() => {
    if (selectedUserId) {
      return { totalEmployees: 1, currentEmployees: employees };
    }

    const totalEmployees = allUsersAverage?.totalUsers || 0;
    const currentEmployees = employees;
    return { totalEmployees, currentEmployees };
  }, [allUsersAverage, employees, selectedUserId]);

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all users for Excel export (ignore pagination)
      const { data: allUsersForExport } = await refetchAllUsers();

      if (
        !allUsersForExport?.users ||
        !Array.isArray(allUsersForExport.users)
      ) {
        throw new Error('No data available for export');
      }

      // Build employee map for all users
      const employeeMap = new Map();
      allUsersForSearch.forEach((employee: any) => {
        employeeMap.set(employee.id, employee);
      });

      // Create export data with all users
      const exportData = allUsersForExport.users.map((perf: any) => {
        const employee = employeeMap.get(perf.userId);
        return {
          id: perf.userId,
          name: employee ? employee.name : `Employee ${perf.userId}`,
          profileImage: employee?.profileImage || null,
          monthly: perf?.monthlyAverage?.averageScore ?? null,
          weekly: perf?.weeklyAverage?.averageScore ?? null,
          daily: perf?.dailyAverage?.averageScore ?? null,
        };
      });

      // Apply search filter if there's a search term
      const filteredExportData = searchTerm
        ? exportData.filter((employee: any) =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : exportData;

      await exportPerformanceData(
        filteredExportData,
        'Average Performance Report',
        selectedFilter,
      );
    } catch (error) {
      NotificationMessage.error({
        message: 'Failed to download report. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const personalData = useMemo(
    () => ({
      daily: personalAverage?.dailyAverage?.averageScore ?? null,
      weekly: personalAverage?.weeklyAverage?.averageScore ?? null,
      monthly: personalAverage?.monthlyAverage?.averageScore ?? null,
    }),
    [personalAverage],
  );

  const personalAvailablePeriods = useMemo(() => {
    if (!assignedPeriods || !Array.isArray(assignedPeriods)) return [];

    const periods: string[] = [];
    assignedPeriods.forEach((period: any) => {
      const periodName = period.planningPeriod?.name;
      if (periodName) {
        switch (periodName.toLowerCase()) {
          case 'daily':
            periods.push('Daily');
            break;
          case 'weekly':
            periods.push('Weekly');
            break;
          case 'monthly':
            periods.push('Monthly');
            break;
        }
      }
    });

    return periods;
  }, [assignedPeriods]);

  const getPersonalChartData = () => {
    if (personalAvailablePeriods.length === 0) {
      return { labels: [], data: [], colors: [] };
    }

    if (personalFilter === 'All') {
      const labels = personalAvailablePeriods;
      const data = labels.map((period: string) => {
        switch (period.toLowerCase()) {
          case 'daily':
            return personalData.daily ?? 0;
          case 'weekly':
            return personalData.weekly ?? 0;
          case 'monthly':
            return personalData.monthly ?? 0;
          default:
            return 0;
        }
      });
      return {
        labels,
        data,
        colors: labels.map(() => '#8C8CFF'),
      };
    }

    const value =
      personalFilter === 'Daily'
        ? (personalData.daily ?? 0)
        : personalFilter === 'Weekly'
          ? (personalData.weekly ?? 0)
          : (personalData.monthly ?? 0);

    if (personalAvailablePeriods.includes(personalFilter)) {
      return { labels: [personalFilter], data: [value], colors: ['#8C8CFF'] };
    }

    return { labels: [], data: [], colors: [] };
  };

  const { labels, data, colors } = getPersonalChartData();

  const personalChartData = {
    labels,
    datasets: [
      {
        label: 'Average Performance',
        data,
        backgroundColor: colors,
        borderRadius: 10,
        barThickness: 50,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 10 },
        grid: { color: '#F0F0F0' },
      },
      y: {
        grid: { display: true },
        ticks: { font: { family: 'inherit', size: 18 } },
      },
    },
  };

  const AdminPageView = () => (
    <div
      className="space-y-3"
      id="okr-performance-admin-view"
      data-cy="okr-performance-admin-view"
    >
      <div
        className="flex items-center gap-3"
        id="okr-performance-admin-filters"
        data-cy="okr-performance-admin-filters"
      >
        <Select
          showSearch
          allowClear
          className="w-50 rounded-lg"
          placeholder="Search employee"
          value={searchTerm || undefined}
          onChange={handleSearchChange}
          options={allUsersForSearch.map((emp: any) => ({
            value: emp.name,
            label: emp.name,
          }))}
          id="okr-performance-admin-search-select"
          data-cy="okr-performance-admin-search-select"
        />
        <DatePicker.RangePicker
          placeholder={['From', 'To']}
          suffixIcon={<CalendarOutlined />}
          className="rounded-lg w-50"
          value={dateRange}
          onChange={handleDateRangeChange}
          id="okr-performance-admin-date-range"
          data-cy="okr-performance-admin-date-range"
        />
        <Select
          value={selectedFilter}
          onChange={handleFilterChange}
          suffixIcon={
            <div data-cy="okr-performance-admin-period-filter-icon-wrapper">
              <DownOutlined data-cy="okr-performance-admin-period-filter-icon-display-icon" />
            </div>
          }
          className="w-20 rounded-lg"
          options={[
            { value: 'All', label: 'All' },
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
            { value: 'Monthly', label: 'Monthly' },
          ]}
          id="okr-performance-admin-period-filter"
          data-cy="okr-performance-admin-period-filter"
        />
        <Button
          type="primary"
          className="bg-blue-500 text-white rounded-lg flex items-center gap-1 h-8 px-3"
          loading={isExporting}
          onClick={handleExcelExport}
          id="okr-performance-admin-export-button"
          data-cy="okr-performance-admin-export-button"
        >
          <img
            id="okr-performance-admin-export-button-icon"
            data-cy="okr-performance-admin-export-button-icon"
            src="/icons/file-download.svg"
            alt="Download"
            className="w-3 h-6 brightness-0 invert"
          />
        </Button>
      </div>

      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        id="okr-performance-admin-table"
        data-cy="okr-performance-admin-table"
      >
        <div
          className="bg-gray-50 px-4 py-3 border-b border-gray-200"
          id="okr-performance-admin-table-header"
          data-cy="okr-performance-admin-table-header"
        >
          <div
            className={`grid gap-3 text-xs font-medium text-gray-600 ${selectedFilter === 'All' ? 'grid-cols-4' : 'grid-cols-2'}`}
            id="okr-performance-admin-table-header-grid"
            data-cy="okr-performance-admin-table-header-grid"
          >
            <div
              className="text-center"
              id="okr-performance-admin-table-header-employee"
              data-cy="okr-performance-admin-table-header-employee"
            >
              Employee
            </div>
            {selectedFilter === 'All' ? (
              <>
                <div
                  className="text-right"
                  id="okr-performance-admin-table-header-monthly"
                  data-cy="okr-performance-admin-table-header-monthly"
                >
                  Monthly
                </div>
                <div
                  className="text-right"
                  id="okr-performance-admin-table-header-weekly"
                  data-cy="okr-performance-admin-table-header-weekly"
                >
                  Weekly
                </div>
                <div
                  className="text-right"
                  id="okr-performance-admin-table-header-daily"
                  data-cy="okr-performance-admin-table-header-daily"
                >
                  Daily
                </div>
              </>
            ) : (
              <div
                className="text-right"
                id="okr-performance-admin-table-header-selected-filter"
                data-cy="okr-performance-admin-table-header-selected-filter"
              >
                {selectedFilter}
              </div>
            )}
          </div>
        </div>

        <div
          className="max-h-[270px] overflow-y-auto space-y-2 p-3 hide-scrollbar"
          id="okr-performance-admin-table-body"
          data-cy="okr-performance-admin-table-body"
        >
          {(isLoadingAllEmployees ||
            isLoadingEmployeeList ||
            isLoadingAdmin ||
            isLoadingActiveMonth) &&
          !selectedUserId ? (
            <div
              className="flex justify-center items-center h-20"
              id="okr-performance-admin-loading"
              data-cy="okr-performance-admin-loading"
            >
              <Spin
                size="default"
                data-cy="okr-performance-admin-loading-spin"
              />
            </div>
          ) : selectedUserId && isLoadingSelectedUser ? (
            <div
              className="flex justify-center items-center h-20"
              id="okr-performance-admin-selected-loading"
              data-cy="okr-performance-admin-selected-loading"
            >
              <Spin
                size="default"
                data-cy="okr-performance-admin-selected-loading-spin"
              />
            </div>
          ) : paginationData.currentEmployees.length === 0 ? (
            <div
              className="flex justify-center items-center h-20 text-gray-500"
              id="okr-performance-admin-empty-state"
              data-cy="okr-performance-admin-empty-state"
            >
              <span
                id="okr-performance-admin-empty-state-text-display-span"
                data-cy="okr-performance-admin-empty-state-text-display-span"
              >
                No employees found
              </span>
            </div>
          ) : (
            paginationData.currentEmployees.map((employee: any) => (
              <div
                key={employee.id}
                className="bg-white border border-gray-200 rounded-lg p-3"
                id={`okr-performance-admin-employee-card-${employee.id}`}
                data-cy={`okr-performance-admin-employee-card-${employee.id}`}
              >
                <div
                  className={`grid gap-3 items-center ${selectedFilter === 'All' ? 'grid-cols-4' : 'grid-cols-2'}`}
                  id={`okr-performance-admin-employee-grid-${employee.id}`}
                  data-cy={`okr-performance-admin-employee-grid-${employee.id}`}
                >
                  <div
                    className="flex items-center gap-2"
                    id={`okr-performance-admin-employee-info-${employee.id}`}
                    data-cy={`okr-performance-admin-employee-info-${employee.id}`}
                  >
                    <div
                      className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100"
                      id={`okr-performance-admin-employee-avatar-wrapper-${employee.id}`}
                      data-cy={`okr-performance-admin-employee-avatar-wrapper-${employee.id}`}
                    >
                      <Image
                        src={employee.profileImage || Avatar}
                        alt="Employee profile"
                        layout="fill"
                        className="object-cover"
                        id={`okr-performance-admin-employee-avatar-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-avatar-${employee.id}`}
                      />
                    </div>
                    <div
                      className="flex flex-col"
                      id={`okr-performance-admin-employee-name-wrapper-${employee.id}`}
                      data-cy={`okr-performance-admin-employee-name-wrapper-${employee.id}`}
                    >
                      <span
                        className="text-xs font-semibold text-gray-500"
                        id={`okr-performance-admin-employee-name-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-name-${employee.id}`}
                      >
                        {employee.name}
                      </span>
                    </div>
                  </div>
                  {selectedFilter === 'All' ? (
                    <>
                      <div
                        className="text-right"
                        id={`okr-performance-admin-employee-monthly-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-monthly-${employee.id}`}
                      >
                        <div
                          className="text-xs font-medium text-gray-500"
                          id={`okr-performance-admin-employee-monthly-value-${employee.id}`}
                          data-cy={`okr-performance-admin-employee-monthly-value-${employee.id}`}
                        >
                          {formatScore(employee.monthly)}
                        </div>
                      </div>
                      <div
                        className="text-right"
                        id={`okr-performance-admin-employee-weekly-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-weekly-${employee.id}`}
                      >
                        <div
                          className="text-xs font-medium text-gray-500"
                          id={`okr-performance-admin-employee-weekly-value-${employee.id}`}
                          data-cy={`okr-performance-admin-employee-weekly-value-${employee.id}`}
                        >
                          {formatScore(employee.weekly)}
                        </div>
                      </div>
                      <div
                        className="text-right"
                        id={`okr-performance-admin-employee-daily-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-daily-${employee.id}`}
                      >
                        <div
                          className="text-xs font-medium text-gray-500"
                          id={`okr-performance-admin-employee-daily-value-${employee.id}`}
                          data-cy={`okr-performance-admin-employee-daily-value-${employee.id}`}
                        >
                          {formatScore(employee.daily)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className="text-right"
                      id={`okr-performance-admin-employee-selected-score-${employee.id}`}
                      data-cy={`okr-performance-admin-employee-selected-score-${employee.id}`}
                    >
                      <div
                        className="text-xs font-medium text-gray-500"
                        id={`okr-performance-admin-employee-selected-score-value-${employee.id}`}
                        data-cy={`okr-performance-admin-employee-selected-score-value-${employee.id}`}
                      >
                        {selectedFilter === 'Monthly'
                          ? formatScore(employee.monthly)
                          : selectedFilter === 'Weekly'
                            ? formatScore(employee.weekly)
                            : formatScore(employee.daily)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {!selectedUserId && (
            <div
              className="flex justify-center pt-2"
              id="okr-performance-admin-pagination"
              data-cy="okr-performance-admin-pagination"
            >
              <Pagination
                current={allUsersAverage?.page || currentPage}
                total={allUsersAverage?.totalUsers || 0}
                pageSize={allUsersAverage?.limit || pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size && size !== pageSize) setPageSize(size);
                }}
                showSizeChanger
                pageSizeOptions={['5', '10', '20', '50', '100']}
                size="small"
                className="pagination-custom"
                data-cy="okr-performance-admin-pagination-control"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PersonalPageView = () => {
    const filterOptions = useMemo(() => {
      const options = [{ value: 'All', label: 'All' }];
      personalAvailablePeriods.forEach((period: string) => {
        options.push({ value: period, label: period });
      });
      return options;
    }, [personalAvailablePeriods]);

    return (
      <div
        className="space-y-3"
        id="okr-performance-personal-view"
        data-cy="okr-performance-personal-view"
      >
        <div
          className="flex justify-end gap-3"
          id="okr-performance-personal-filters"
          data-cy="okr-performance-personal-filters"
        >
          <Select
            value={personalFilter}
            onChange={setPersonalFilter}
            className="w-28 rounded-lg"
            options={filterOptions}
            id="okr-performance-personal-filter-select"
            data-cy="okr-performance-personal-filter-select"
          />
          <DatePicker.RangePicker
            placeholder={['From', 'To']}
            suffixIcon={<CalendarOutlined />}
            className="rounded-lg"
            value={personalDateRange}
            onChange={setPersonalDateRange}
            id="okr-performance-personal-date-range"
            data-cy="okr-performance-personal-date-range"
          />
        </div>

        <div
          className="bg-white rounded-lg border border-gray-200 p-4 w-full"
          id="okr-performance-personal-chart-card"
          data-cy="okr-performance-personal-chart-card"
        >
          {isLoadingPersonal || isLoadingActiveMonth ? (
            <div
              className="flex justify-center items-center h-48"
              id="okr-performance-personal-loading"
              data-cy="okr-performance-personal-loading"
            >
              <Spin data-cy="okr-performance-personal-loading-spin" />
            </div>
          ) : personalAvailablePeriods.length === 0 ? (
            <div
              className="flex justify-center items-center h-48 text-gray-500"
              id="okr-performance-personal-empty"
              data-cy="okr-performance-personal-empty"
            >
              <div
                className="text-center"
                id="okr-performance-personal-empty-content-display-div"
                data-cy="okr-performance-personal-empty-content-display-div"
              >
                <p
                  className="text-lg font-medium"
                  id="okr-performance-personal-empty-text-display-p"
                  data-cy="okr-performance-personal-empty-text-display-p"
                >
                  No Performance record found
                </p>
              </div>
            </div>
          ) : (
            <div
              id="okr-performance-personal-chart-wrapper"
              data-cy="okr-performance-personal-chart-wrapper"
            >
              <Bar
                data={personalChartData}
                options={chartOptions}
                id="okr-performance-personal-chart-bar-display-chart"
                data-cy="okr-performance-personal-chart-bar-display-chart"
              />
            </div>
          )}
        </div>

        {personalAvailablePeriods.length > 0 && (
          <div
            className="flex justify-center mt-2"
            id="okr-performance-personal-legend-container"
            data-cy="okr-performance-personal-legend-container"
          >
            <div
              className="flex items-center gap-2"
              id="okr-performance-personal-legend-wrapper-display-div"
              data-cy="okr-performance-personal-legend-wrapper-display-div"
            >
              <div
                className="flex items-center gap-1"
                id="okr-performance-personal-legend-item-display-div"
                data-cy="okr-performance-personal-legend-item-display-div"
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: colors[0] || '#4C4CFF' }}
                  id="okr-performance-personal-legend-color"
                  data-cy="okr-performance-personal-legend-color"
                />
                <span
                  className="text-sm text-gray-600"
                  id="okr-performance-personal-legend-label-display-span"
                  data-cy="okr-performance-personal-legend-label-display-span"
                >
                  Average Performance
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 w-full flex flex-col"
      id="okr-performance-container"
      data-cy="okr-performance-container"
    >
      <div
        className="flex justify-between items-center mb-4"
        id="okr-performance-header"
        data-cy="okr-performance-header"
      >
        <div
          className="text-lg font-bold text-gray-800"
          id="okr-performance-title"
          data-cy="okr-performance-title"
        >
          Performance
        </div>
        <div
          className="flex items-center bg-[#f8f8f8] border border-gray-300 rounded-lg w-fit h-10 p-1 gap-6"
          id="okr-performance-tab-toggle"
          data-cy="okr-performance-tab-toggle"
        >
          <AccessGuard permissions={[Permissions.ViewAllEmployeePerformance]}>
            <button
              onClick={() => setActiveTab('admin')}
              className={
                activeTab === 'admin'
                  ? 'px-6 h-8 bg-white text-black text-xs rounded-lg shadow-md'
                  : 'px-3 h-full bg-transparent text-black text-xs'
              }
              id="okr-performance-admin-tab-button"
              data-cy="okr-performance-admin-tab-button"
            >
              Admin Page
            </button>
          </AccessGuard>
          <button
            onClick={() => setActiveTab('personal')}
            className={
              activeTab === 'personal'
                ? 'px-6 h-8 bg-white text-black text-xs rounded-lg shadow-md'
                : 'px-3 h-full bg-transparent text-black text-xs'
            }
            id="okr-performance-personal-tab-button"
            data-cy="okr-performance-personal-tab-button"
          >
            Personal
          </button>
        </div>
      </div>

      {activeTab === 'admin' ? (
        <AccessGuard
          data-cy="okr-performance-admin-access-guard"
          permissions={[Permissions.ViewAllEmployeePerformance]}
        >
          <AdminPageView data-cy="okr-performance-admin-page-view" />
        </AccessGuard>
      ) : (
        <PersonalPageView data-cy="okr-performance-personal-page-view" />
      )}
    </div>
  );
};

export default Performance;
