'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CarryOverCard from './_components/carryOverCard';
import CarryOverSidebar from './_components/carryOverSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Page = () => {
  const { setIsShowCarryOverRuleSidebar } = useTimesheetSettingsStore();
  const { data } = useGetCarryOverRules();
  return (
    <>
      {' '}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1/2 mb-3 ">
          <PageHeader title="Carry-over Rule" size="small">
            <AccessGuard permissions={[Permissions.CreateCarryOverRule]}>
              <Button
                size="large"
                type="primary"
                id="carryOver"
                icon={<LuPlus size={18} />}
                onClick={() => setIsShowCarryOverRuleSidebar(true)}
              >
                <span className="hidden md:inline"> New Carry-over Rule</span>
              </Button>
            </AccessGuard>
          </PageHeader>
        </div>
      </div>
      {/* Scrollable Container for Horizontal Scroll */}
      <div className="w-full overflow-x-auto  mt-12">
        {data &&
          data.items.map((item) => <CarryOverCard key={item.id} item={item} />)}
      </div>
      <CarryOverSidebar />
    </>
  );
};

export default Page;
