import { Card } from 'antd';
import React from 'react';
import {
  useDefaultPlanningPeriods,
  useGetPlanning,
  useGetReporting,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { create } from 'zustand';

const normalize = (str: string) => str?.toLowerCase().replace(/s$/, '');

// Zustand store for Awaiting Approvals filter
type AwaitingApprovalsFilter = 'all' | 'plan' | 'report';
interface AwaitingApprovalsState {
  selectedFilter: AwaitingApprovalsFilter;
  setSelectedFilter: (filter: AwaitingApprovalsFilter) => void;
}
export const useAwaitingApprovalsStore = create<AwaitingApprovalsState>(
  (set) => ({
    selectedFilter: 'all',
    setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  }),
);

const AwaitingApprovalsList: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: employeeData } = useGetAllUsers();
  const selectedFilter = useAwaitingApprovalsStore((s) => s.selectedFilter);
  const setSelectedFilter = useAwaitingApprovalsStore(
    (s) => s.setSelectedFilter,
  );

  // Check if user has subordinates
  const subordinates =
    employeeData?.items?.filter((employee: any) =>
      employee?.delegatedTo?.id
        ? employee?.delegatedTo?.id === userId
        : employee.reportingTo?.id === userId,
    ) || [];

  // Determine which users to fetch data for
  const targetUserIds =
    subordinates.length > 0 ? subordinates.map((sub: any) => sub.id) : [userId];

  // Build a map of periodId to label
  const periodMap: Record<string, string> = {};
  (planningPeriods?.items || []).forEach((period: any) => {
    const label =
      normalize(period.intervalType) === 'day'
        ? 'Daily'
        : normalize(period.intervalType) === 'week'
          ? 'Weekly'
          : normalize(period.intervalType) === 'month'
            ? 'Monthly'
            : period.name;
    periodMap[period.id] = label;
  });

  // Get period IDs for each type
  const dailyPeriodId = planningPeriods?.items?.find(
    (p: any) =>
      normalize(p.intervalType) === 'day' || normalize(p.name) === 'day',
  )?.id;
  const weeklyPeriodId = planningPeriods?.items?.find(
    (p: any) =>
      normalize(p.intervalType) === 'week' || normalize(p.name) === 'week',
  )?.id;
  const monthlyPeriodId = planningPeriods?.items?.find(
    (p: any) =>
      normalize(p.intervalType) === 'month' || normalize(p.name) === 'month',
  )?.id;

  // Get plans for each period (similar to planning module)
  const { data: dailyPlans } = useGetPlanning({
    userId: targetUserIds,
    planPeriodId: dailyPeriodId || '',
    page: 1,
    pageSize: 100,
  });
  const { data: weeklyPlans } = useGetPlanning({
    userId: targetUserIds,
    planPeriodId: weeklyPeriodId || '',
    page: 1,
    pageSize: 100,
  });
  const { data: monthlyPlans } = useGetPlanning({
    userId: targetUserIds,
    planPeriodId: monthlyPeriodId || '',
    page: 1,
    pageSize: 100,
  });

  // Get reports for each period (similar to reporting module)
  const { data: dailyReports } = useGetReporting({
    userId: targetUserIds,
    planPeriodId: dailyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });
  const { data: weeklyReports } = useGetReporting({
    userId: targetUserIds,
    planPeriodId: weeklyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });
  const { data: monthlyReports } = useGetReporting({
    userId: targetUserIds,
    planPeriodId: monthlyPeriodId || '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  // Collect all plans and reports
  const allPlans = [
    ...(dailyPlans?.items || []),
    ...(weeklyPlans?.items || []),
    ...(monthlyPlans?.items || []),
  ];

  const allReports = [
    ...(dailyReports?.items || []),
    ...(weeklyReports?.items || []),
    ...(monthlyReports?.items || []),
  ];

  // Filter open plans (not validated)
  const openPlans = allPlans.filter((plan) => !plan.isValidated);

  // Filter open reports (not validated)
  const openReports = allReports.filter(
    (report) => !report.plan?.isReportValidated,
  );

  // Helper to get employee data
  const getEmployeeData = (id: string) => {
    const employeeDataDetail = employeeData?.items?.find(
      (emp: any) => emp?.id === id,
    );
    return employeeDataDetail || {};
  };

  // Group by period label
  const grouped: Record<
    string,
    { type: 'Plan' | 'Report'; item: any; employee: any }[]
  > = {
    Daily: [],
    Weekly: [],
    Monthly: [],
  };

  // Group plans by their period
  openPlans.forEach((plan) => {
    const periodId = plan.planningUser?.planningPeriodId;
    const label = periodMap[periodId];
    const employee = getEmployeeData(plan.createdBy);
    if (label && grouped[label]) {
      grouped[label].push({ type: 'Plan', item: plan, employee });
    }
  });

  // Group reports by their period - use the plan's periodId
  openReports.forEach((report) => {
    const periodId = report.plan?.planningUser?.planningPeriodId;
    const label = periodMap[periodId];
    const employee = getEmployeeData(report.createdBy);
    if (label && grouped[label]) {
      grouped[label].push({ type: 'Report', item: report, employee });
    }
  });

  // Helper to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to format employee name
  const formatEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    return `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim();
  };

  // Count for header
  const planCount = openPlans.length;
  const reportCount = openReports.length;

  return (
    <Card
      className="w-full bg-white rounded-xl shadow-md p-0 min-h-[320px] flex flex-col justify-between"
      id="okr-awaiting-card-container-display-card"
      data-cy="okr-awaiting-card-container-display-card"
    >
      <div
        className="flex items-center justify-between pb-2"
        id="okr-awaiting-header-container-display-div"
        data-cy="okr-awaiting-header-container-display-div"
      >
        <span
          className="font-bold text-lg text-gray-900"
          id="okr-awaiting-header-title-display-span"
          data-cy="okr-awaiting-header-title-display-span"
        >
          Awaiting Approvals
        </span>
        <span
          className="text-sm font-medium flex gap-2"
          id="okr-awaiting-filter-toggle-display-span"
          data-cy="okr-awaiting-filter-toggle-display-span"
        >
          <span
            className={`cursor-pointer px-1 ${selectedFilter === 'plan' ? 'text-[#4F8CFF] font-bold' : 'text-gray-400'}`}
            onClick={() =>
              setSelectedFilter(selectedFilter === 'plan' ? 'all' : 'plan')
            }
            id="okr-awaiting-plan-filter-toggle-action-span"
            data-cy="okr-awaiting-plan-filter-toggle-action-span"
          >
            {planCount} Plans
          </span>
          <span
            className={`cursor-pointer px-1 ${selectedFilter === 'report' ? 'text-[#4F8CFF] font-bold' : 'text-gray-400'}`}
            onClick={() =>
              setSelectedFilter(selectedFilter === 'report' ? 'all' : 'report')
            }
            id="okr-awaiting-report-filter-toggle-action-span"
            data-cy="okr-awaiting-report-filter-toggle-action-span"
          >
            {reportCount} Reports
          </span>
        </span>
      </div>
      <div
        className="flex-1"
        id="okr-awaiting-body-wrapper-display-div"
        data-cy="okr-awaiting-body-wrapper-display-div"
      >
        <div
          className="bg-white border rounded-xl overflow-hidden h-full"
          id="okr-awaiting-list-container-display-div"
          data-cy="okr-awaiting-list-container-display-div"
        >
          <div
            className="max-h-64 overflow-y-auto scrollbar-hide"
            id="okr-awaiting-scroll-container-display-div"
            data-cy="okr-awaiting-scroll-container-display-div"
          >
            {['Daily', 'Weekly', 'Monthly'].map((label) => {
              // Filter items by selectedFilter
              const filtered =
                selectedFilter === 'all'
                  ? grouped[label]
                  : grouped[label].filter((entry) =>
                      selectedFilter === 'plan'
                        ? entry.type === 'Plan'
                        : entry.type === 'Report',
                    );
              if (filtered.length > 0) {
                return (
                  <div
                    key={label}
                    className="bg-white border rounded-xl mb-4"
                    id={`okr-awaiting-period-card-display-div-${label}`}
                    data-cy={`okr-awaiting-period-card-display-div-${label}`}
                  >
                    <div
                      className="bg-[#F5F5F5] rounded-t-xl px-4 py-2 text-lg font-semibold text-gray-900 border-b"
                      id={`okr-awaiting-period-header-display-div-${label}`}
                      data-cy={`okr-awaiting-period-header-display-div-${label}`}
                    >
                      {label}
                    </div>
                    <div
                      className="flex flex-col gap-3 px-4 py-4 bg-white"
                      id={`okr-awaiting-period-list-display-div-${label}`}
                      data-cy={`okr-awaiting-period-list-display-div-${label}`}
                    >
                      {filtered.map(({ type, item, employee }, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between bg-white rounded-xl border border-[#E5E7EB] px-4 py-3"
                          id={`okr-awaiting-entry-container-display-div-${item.id || idx}`}
                          data-cy={`okr-awaiting-entry-container-display-div-${item.id || idx}`}
                        >
                          <div
                            className="flex flex-col"
                            id={`okr-awaiting-entry-details-display-div-${item.id || idx}`}
                            data-cy={`okr-awaiting-entry-details-display-div-${item.id || idx}`}
                          >
                            <span
                              className="text-gray-500 text-base font-normal"
                              id={`okr-awaiting-entry-date-display-span-${item.id || idx}`}
                              data-cy={`okr-awaiting-entry-date-display-span-${item.id || idx}`}
                            >
                              {formatDate(item.createdAt)}
                            </span>
                            {subordinates.length > 0 && (
                              <span
                                className="text-xs text-gray-400 mt-1"
                                id={`okr-awaiting-entry-employee-display-span-${item.id || idx}`}
                                data-cy={`okr-awaiting-entry-employee-display-span-${item.id || idx}`}
                              >
                                {formatEmployeeName(employee)}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-4 py-1 rounded-full text-base font-semibold text-gray-900`}
                            id={`okr-awaiting-entry-type-display-span-${item.id || idx}`}
                            data-cy={`okr-awaiting-entry-type-display-span-${item.id || idx}`}
                          >
                            {type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AwaitingApprovalsList;
