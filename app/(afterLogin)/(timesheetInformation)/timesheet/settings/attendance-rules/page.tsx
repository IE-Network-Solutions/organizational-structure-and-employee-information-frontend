'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAttendanceNotificationTypes } from '@/store/server/features/timesheet/attendanceNotificationType/queries';
import TypeTable from './_components/typeTable';
import AddTypeSidebar from './_components/addTypeSidebar';
import CreateRuleSidebar from './_components/createRuleSidebar';

const Page = () => {
  const { setAttendanceNotificationType, attendanceNotificationType } =
    useTimesheetSettingsStore();

  const { data: attendanceTypeData } = useGetAttendanceNotificationTypes();

  useEffect(() => {
    setAttendanceNotificationType(attendanceTypeData?.items ?? []);
  }, [attendanceTypeData]);

  return (
    <div
      id="time-attendance-settings-attendance-rules-container"
      data-cy="time-attendance-settings-attendance-rules-container"
    >
      {attendanceNotificationType.map((type, index) => (
        <div
          key={index}
          className="w-full"
          id={`time-attendance-settings-attendance-rules-type-table-container-${index}`}
          data-cy={`time-attendance-settings-attendance-rules-type-table-container-${index}`}
        >
          <TypeTable
            type={type}
            key={type.id}
            data-cy={`time-attendance-settings-attendance-rules-type-table-${index}`}
          />
        </div>
      ))}

      <AddTypeSidebar data-cy="time-attendance-settings-attendance-rules-add-type-sidebar" />
      <CreateRuleSidebar data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar" />
    </div>
  );
};

export default Page;
