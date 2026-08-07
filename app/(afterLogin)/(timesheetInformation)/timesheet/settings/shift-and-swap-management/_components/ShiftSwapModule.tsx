'use client';

import { useEffect, useMemo } from 'react';
import { Tabs } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useShiftSwapStore } from '@/store/uistate/features/timesheet/shiftSwap';
import { mapEmployeeToDirectory } from './shared/utils';
import OverviewDashboard from './overview';
import ShiftTemplatesPanel from './templates';
import ScheduleCalendar from './schedule';
import MyShiftsPanel from './myShifts';
import SwapRequestsPanel from './swaps';
import ReportsPanel from './reports';
import AuditLogPanel from './auditLog';

const ShiftSwapModule = () => {
  const { data: employeeData } = useGetAllUsers();
  const { activeSection, assignments, setActiveSection, hydrateFromDirectory } =
    useShiftSwapStore();

  const directoryFromApi = useMemo(() => {
    const items = employeeData?.items || employeeData || [];
    return Array.isArray(items) ? items.map(mapEmployeeToDirectory) : [];
  }, [employeeData]);

  const people = useMemo(() => {
    const fromAssignments = assignments.map((item) => ({
      id: item.employeeId,
      name: item.employeeName,
      departmentId: item.departmentId,
      departmentName: item.departmentName,
      locationId: item.locationId,
      locationName: item.locationName,
      teamId: item.teamId,
      teamName: item.teamName,
      positionId: item.positionId,
      positionName: item.positionName,
    }));
    return Array.from(
      new Map(
        [...fromAssignments, ...directoryFromApi].map((person) => [
          person.id,
          person,
        ]),
      ).values(),
    );
  }, [directoryFromApi, assignments]);

  useEffect(() => {
    if (directoryFromApi.length) {
      hydrateFromDirectory(directoryFromApi);
    }
  }, [directoryFromApi, hydrateFromDirectory]);

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg p-4 bg-white"
      id="time-attendance-settings-shift-swap-module"
      data-cy="time-attendance-settings-shift-swap-module"
    >
      <Tabs
        activeKey={activeSection}
        onChange={setActiveSection}
        items={[
          {
            key: 'overview',
            label: (
              <span
                className={
                  activeSection === 'overview'
                    ? 'text-primary font-semibold'
                    : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-overview"
              >
                Overview
              </span>
            ),
            children: <OverviewDashboard people={people} />,
          },
          {
            key: 'templates',
            label: (
              <span
                className={
                  activeSection === 'templates'
                    ? 'text-primary font-semibold'
                    : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-templates"
              >
                Shift Templates
              </span>
            ),
            children: <ShiftTemplatesPanel />,
          },
          {
            key: 'schedule',
            label: (
              <span
                className={
                  activeSection === 'schedule'
                    ? 'text-primary font-semibold'
                    : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-schedule"
              >
                Schedule
              </span>
            ),
            children: <ScheduleCalendar people={people} />,
          },
          {
            key: 'my-shifts',
            label: (
              <span
                className={
                  activeSection === 'my-shifts'
                    ? 'text-primary font-semibold'
                    : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-my-shifts"
              >
                My Shifts
              </span>
            ),
            children: <MyShiftsPanel people={people} />,
          },
          {
            key: 'swaps',
            label: (
              <span
                className={
                  activeSection === 'swaps' ? 'text-primary font-semibold' : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-swaps"
              >
                Swap Requests
              </span>
            ),
            children: <SwapRequestsPanel />,
          },
          {
            key: 'reports',
            label: (
              <span
                className={
                  activeSection === 'reports'
                    ? 'text-primary font-semibold'
                    : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-reports"
              >
                Reports
              </span>
            ),
            children: <ReportsPanel people={people} />,
          },
          {
            key: 'audit',
            label: (
              <span
                className={
                  activeSection === 'audit' ? 'text-primary font-semibold' : ''
                }
                data-cy="time-attendance-settings-shift-swap-tab-audit"
              >
                Audit Log
              </span>
            ),
            children: <AuditLogPanel />,
          },
        ]}
        id="time-attendance-settings-shift-swap-inner-tabs"
        data-cy="time-attendance-settings-shift-swap-inner-tabs"
      />
    </div>
  );
};

export default ShiftSwapModule;
