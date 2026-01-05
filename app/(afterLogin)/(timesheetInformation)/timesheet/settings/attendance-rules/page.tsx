'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAttendanceNotificationTypes } from '@/store/server/features/timesheet/attendanceNotificationType/queries';
import { Button } from 'antd';
import TypeTable from './_components/typeTable';
import AddTypeSidebar from './_components/addTypeSidebar';
import CreateRuleSidebar from './_components/ createRuleSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const {
    setIsShowRulesAddTypeSidebar,
    setIsShowCreateRuleSidebar,
    setAttendanceNotificationType,
    attendanceNotificationType,
  } = useTimesheetSettingsStore();

  const { data: attendanceTypeData } = useGetAttendanceNotificationTypes();

  useEffect(() => {
    setAttendanceNotificationType(attendanceTypeData?.items ?? []);
  }, [attendanceTypeData]);

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-attendance-rules-container"
      data-cy="time-attendance-settings-attendance-rules-container"
    >
      <div
        className="flex items-center justify-between mb-4"
        id="time-attendance-settings-attendance-rules-header"
        data-cy="time-attendance-settings-attendance-rules-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-attendance-rules-title"
          data-cy="time-attendance-settings-attendance-rules-title"
        >
          Attendance Rules
        </h1>
        <div
          className="flex items-center gap-2"
          id="time-attendance-settings-attendance-rules-actions"
          data-cy="time-attendance-settings-attendance-rules-actions"
        >
          <AccessGuard
            permissions={[Permissions.CreateAttendanceRule]}
            data-cy="time-attendance-settings-attendance-rules-add-rule-button-access-guard"
          >
            <Button
              id="time-attendance-settings-attendance-rules-add-rule-button"
              data-cy="time-attendance-settings-attendance-rules-add-rule-button"
              type="default"
              icon={
                <FaPlus data-cy="time-attendance-settings-attendance-rules-add-rule-button-icon" />
              }
              className="h-10 w-10 sm:w-auto"
              disabled={!attendanceNotificationType.length}
              onClick={() => setIsShowCreateRuleSidebar(true)}
            >
              <span
                id="time-attendance-settings-attendance-rules-add-rule-button-label"
                data-cy="time-attendance-settings-attendance-rules-add-rule-button-label"
                className="hidden md:inline"
              >
                {' '}
                New Rule
              </span>
            </Button>
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.CreateAttendanceRuleType]}
            data-cy="time-attendance-settings-attendance-rules-add-type-button-access-guard"
          >
            <Button
              id="time-attendance-settings-attendance-rules-add-type-button"
              data-cy="time-attendance-settings-attendance-rules-add-type-button"
              className="h-10 w-10 sm:w-auto"
              icon={
                <FaPlus data-cy="time-attendance-settings-attendance-rules-add-type-button-icon" />
              }
              onClick={() => setIsShowRulesAddTypeSidebar(true)}
              type="primary"
            >
              <span
                id="time-attendance-settings-attendance-rules-add-type-button-label"
                data-cy="time-attendance-settings-attendance-rules-add-type-button-label"
                className="hidden md:inline"
              >
                {' '}
                New Type
              </span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      {attendanceNotificationType.map((type, index) => (
        <div
          key={index}
          className="overflow-x-auto scrollbar-none w-full"
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
