'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import ClosedDateTable from './_components/closedDateTable';
import ClosedDateSidebar from './_components/closedDateSidebar';

const Page = () => {
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } =
    useTimesheetSettingsStore();

  return (
    <>
      <PageHeader title="Closed Date" size="small">
        <Button
          size="large"
          type="primary"
          id="createNewClosedHolidayFieldId"
          icon={<LuPlus size={18} />}
          onClick={() => {
            setSelectedClosedDate(null), setIsShowClosedDateSidebar(true);
          }}
        >
          New Closed Date
        </Button>
      </PageHeader>

      <ClosedDateTable />

      <ClosedDateSidebar />
    </>
  );
};

export default Page;
