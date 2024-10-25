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
      <PageHeader size="small" title="Attendace Rules">
        <Space size={20}>
          <Button
            id='createNewTypeMainButtonId'
            size="large"
            icon={<LuPlus size={18} />}
            onClick={() => setIsShowRulesAddTypeSidebar(true)}
          >
            New Type
          </Button>
          <Button
            id='createNewRuleMainButtonId'
            size="large"
            type="primary"
            icon={<LuPlus size={18} />}
            disabled={!attendanceNotificationType.length}
            onClick={() => setIsShowCreateRuleSidebar(true)}
          >
            New Rule
          </Button>
        </Space>
      </PageHeader>

      {attendanceNotificationType.map((type) => (
        <TypeTable type={type} key={type.id} />
      ))}

      <AddTypeSidebar />
      <CreateRuleSidebar />
    </>
  );
};

export default Page;
