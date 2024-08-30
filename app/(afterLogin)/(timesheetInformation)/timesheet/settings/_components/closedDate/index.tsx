import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import ClosedDateTable from './closedDateTable';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ClosedDateSidebar from './closedDateSidebar';

const ClosedDate = () => {
  const { setIsShowClosedDateSidebar } = useTimesheetSettingsStore();

  return (
    <>
      <PageHeader title="Closed Date" size="small">
        <Button
          size="large"
          type="primary"
          icon={<LuPlus size={18} />}
          onClick={() => setIsShowClosedDateSidebar(true)}
        >
          New Closed Date
        </Button>
      </PageHeader>

      <ClosedDateTable />

      <ClosedDateSidebar />
    </>
  );
};

export default ClosedDate;
