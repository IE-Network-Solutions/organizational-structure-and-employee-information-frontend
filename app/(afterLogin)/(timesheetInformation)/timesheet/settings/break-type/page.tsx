'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Button } from 'antd';
import React from 'react';
import { LuPlus } from 'react-icons/lu';
import BreakTypeSidebar from './_component/brakTypeSidebar';
import BreakTypeTable from './_component/breakTypeTable/inex';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Page = () => {
  const { setIsShowBreakTypeSidebar } = useTimesheetSettingsStore();

  return (
    <>
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1/2 mb-4 ">
          <PageHeader title="Break Type" size="small">
            <AccessGuard permissions={[Permissions.CreateBreakType]}>
              <Button
                size="large"
                type="primary"
                id="createNewClosedHolidayFieldId"
                icon={<LuPlus size={18} />}
                onClick={() => {
                  setIsShowBreakTypeSidebar(true);
                }}
              >
                <span className="hidden md:inline"> New Break Type</span>
              </Button>
            </AccessGuard>
          </PageHeader>
        </div>
      </div>
      <div className="w-full overflow-x-auto  p-2 mt-12">
        <BreakTypeTable />
      </div>
      <BreakTypeSidebar />
    </>
  );
};

export default Page;
