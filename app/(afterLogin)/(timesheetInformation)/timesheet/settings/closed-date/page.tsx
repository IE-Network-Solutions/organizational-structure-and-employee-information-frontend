'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import ClosedDateTable from './_components/closedDateTable';
import ClosedDateSidebar from './_components/closedDateSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Page = () => {
  const { setIsShowClosedDateSidebar, setSelectedClosedDate } =
    useTimesheetSettingsStore();

  return (
    <>
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1/2 mb-3 ">
          <PageHeader title="Closed Date" size="small">
            <AccessGuard permissions={[Permissions.CreateClosedDate]}>
              <Button
                size="large"
                type="primary"
                id="createNewClosedHolidayFieldId"
                icon={<LuPlus size={18} />}
                onClick={() => {
                  setSelectedClosedDate(null);
                  setIsShowClosedDateSidebar(true);
                }}
              >
                <span className="hidden sm:inline"> New Closed Date</span>
              </Button>
            </AccessGuard>
          </PageHeader>
        </div>
      </div>

      {/* Scrollable Container for Horizontal Scroll */}
      <div className="w-full overflow-x-auto border border-gray-300 rounded-lg p-2 mt-12">
        <ClosedDateTable />
      </div>

      <ClosedDateSidebar />
    </>
  );
};

export default Page;
