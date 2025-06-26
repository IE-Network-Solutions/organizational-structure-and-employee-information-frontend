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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg text-bold">Attendance Rules</h1>
        <div className="flex items-center gap-2">
          <AccessGuard permissions={[Permissions.CreateAttendanceRule]}>
            <Button
              id="createNewRuleMainButtonId"
              type="default"
              icon={<FaPlus />}
              className="h-10 w-10 sm:w-auto"
              disabled={!attendanceNotificationType.length}
              onClick={() => setIsShowCreateRuleSidebar(true)}
            >
              <span className="hidden md:inline"> New Rule</span>
            </Button>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.CreateAttendanceRuleType]}>
            <Button
              id="createNewTypeMainButtonId"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              onClick={() => setIsShowRulesAddTypeSidebar(true)}
              type="primary"
            >
              <span className="hidden md:inline"> New Type</span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      {attendanceNotificationType.map((type, index) => (
        <div key={index} className="overflow-x-auto scrollbar-none w-full">
          <TypeTable type={type} key={type.id} />
        </div>
      ))}

      <AddTypeSidebar />
      <CreateRuleSidebar />
    </div>
  );
};

export default Page;
