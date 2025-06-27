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
    employeeData?.items?.filter(
      (employee: any) => employee.reportingTo?.id === userId,
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
    <Card className="w-full bg-white rounded-xl shadow-md p-0 min-h-[320px] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2">
        <span className="font-bold text-lg text-gray-900">
          Awaiting Approvals
        </span>
        <span className="text-sm font-medium flex gap-2">
          <span
            className={`cursor-pointer px-1 ${selectedFilter === 'plan' ? 'text-[#4F8CFF] font-bold' : 'text-gray-400'}`}
            onClick={() =>
              setSelectedFilter(selectedFilter === 'plan' ? 'all' : 'plan')
            }
          >
            {planCount} Plans
          </span>
          <span
            className={`cursor-pointer px-1 ${selectedFilter === 'report' ? 'text-[#4F8CFF] font-bold' : 'text-gray-400'}`}
            onClick={() =>
              setSelectedFilter(selectedFilter === 'report' ? 'all' : 'report')
            }
          >
            {reportCount} Reports
          </span>
        </span>
      </div>
      <div className="flex-1">
        <div className="bg-white border rounded-xl overflow-hidden h-full">
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
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
                  <div key={label} className="bg-white border rounded-xl mb-4">
                    <div className="bg-[#F5F5F5] rounded-t-xl px-4 py-2 text-lg font-semibold text-gray-900 border-b">
                      {label}
                    </div>
                    <div className="flex flex-col gap-3 px-4 py-4 bg-white">
                      {filtered.map(({ type, item, employee }, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between bg-white rounded-xl border border-[#E5E7EB] px-4 py-3"
                        >
                          <div className="flex flex-col">
                            <span className="text-gray-500 text-base font-normal">
                              {formatDate(item.createdAt)}
                            </span>
                            {subordinates.length > 0 && (
                              <span className="text-xs text-gray-400 mt-1">
                                {formatEmployeeName(employee)}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-4 py-1 rounded-full text-base font-semibold text-gray-900`}
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
