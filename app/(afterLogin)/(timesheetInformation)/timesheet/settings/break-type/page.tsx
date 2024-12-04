'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button } from 'antd';
import React from 'react';
import { LuPlus } from 'react-icons/lu';
import BreakTypeSidebar from './_component/brakTypeSidebar';
import BreakTypeTable from './_component/breakTypeTable/inex';

const Page = () => {
  const { setIsShowBreakTypeSidebar } = useTimesheetSettingsStore();

  return (
    <div>
      <PageHeader title="Break Type" size="small">
        <Button
          size="large"
          type="primary"
          id="createNewClosedHolidayFieldId"
          icon={<LuPlus size={18} />}
          onClick={() => {
            setIsShowBreakTypeSidebar(true);
          }}
        >
          New Break Type
        </Button>
      </PageHeader>
      <BreakTypeSidebar />
      <BreakTypeTable />
    </div>
  );
};

export default Page;
