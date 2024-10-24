'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CarryOverCard from './_components/carryOverCard';
import CarryOverSidebar from './_components/carryOverSidebar';

const Page = () => {
  const { setIsShowCarryOverRuleSidebar } = useTimesheetSettingsStore();
  const { data } = useGetCarryOverRules();
  return (
    <>
      <PageHeader title="Carry-over Rule" size="small">
        <Button
          size="large"
          type="primary"
          id='carryOver'
          icon={<LuPlus size={18} />}
          onClick={() => setIsShowCarryOverRuleSidebar(true)}
        >
          New Rule
        </Button>
      </PageHeader>

      {data &&
        data.items.map((item) => <CarryOverCard key={item.id} item={item} />)}

      <CarryOverSidebar />
    </>
  );
};

export default Page;
