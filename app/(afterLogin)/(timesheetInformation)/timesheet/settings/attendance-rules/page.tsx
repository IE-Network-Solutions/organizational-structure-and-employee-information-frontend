'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAttendanceNotificationTypes } from '@/store/server/features/timesheet/attendanceNotificationType/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Space } from 'antd';
import { LuPlus } from 'react-icons/lu';
import TypeTable from './_components/typeTable';
import AddTypeSidebar from './_components/addTypeSidebar';
import CreateRuleSidebar from './_components/ createRuleSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

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
    <>
      <PageHeader size="small" title="Attendance Rules">
        <Space size={20}>
          <AccessGuard permissions={[Permissions.CreateAttendanceRuleType]}>
            <Button
              id="createNewTypeMainButtonId"
              size="large"
              icon={<LuPlus size={18} />}
              onClick={() => setIsShowRulesAddTypeSidebar(true)}
              type="primary"
            >
              <span className="hidden md:inline"> New Type</span>
            </Button>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.CreateAttendanceRule]}>
            <Button
              id="createNewRuleMainButtonId"
              size="large"
              type="primary"
              icon={<LuPlus size={18} />}
              disabled={!attendanceNotificationType.length}
              onClick={() => setIsShowCreateRuleSidebar(true)}
            >
              <span className="hidden md:inline"> New Rule</span>
            </Button>
          </AccessGuard>
        </Space>
      </PageHeader>

      {attendanceNotificationType.map((type) => (
        <div className="overflow-x-auto scrollbar-none w-full">
          <TypeTable type={type} key={type.id} />
        </div>
      ))}

      <AddTypeSidebar />
      <CreateRuleSidebar />
    </>
  );
};

export default Page;
