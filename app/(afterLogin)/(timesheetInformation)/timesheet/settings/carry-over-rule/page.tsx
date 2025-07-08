'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import { Button } from 'antd';
import CarryOverCard from './_components/carryOverCard';
import CarryOverSidebar from './_components/carryOverSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const { setIsShowCarryOverRuleSidebar } = useTimesheetSettingsStore();
  const { data } = useGetCarryOverRules();
  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg text-bold">Carry-over Rule</h1>
        <AccessGuard permissions={[Permissions.CreateCarryOverRule]}>
          <Button
            size="large"
            type="primary"
            id="carryOver"
            icon={<FaPlus />}
            className="h-10 w-10 sm:w-auto"
            onClick={() => setIsShowCarryOverRuleSidebar(true)}
          >
            <span className="hidden md:inline"> New Carry-over Rule</span>
          </Button>
        </AccessGuard>
      </div>
      {/* Scrollable Container for Horizontal Scroll */}
      <div className="w-full overflow-x-auto scrollbar-none">
        {data &&
          data.items.map((item) => <CarryOverCard key={item.id} item={item} />)}
      </div>
      <CarryOverSidebar />
    </div>
  );
};

export default Page;
