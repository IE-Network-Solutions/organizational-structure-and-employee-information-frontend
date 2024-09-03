import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import CarryOverCard from './carryOverCard';
import CarryOverSidebar from './carryOverSidebar';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useCarryOverRules } from '@/store/server/features/timesheet/carryOverRule/queries';

const CarryOverRule = () => {
  const { setIsShowCarryOverRuleSidebar } = useTimesheetSettingsStore();
  const { data } = useCarryOverRules();
  return (
    <>
      <PageHeader title="Carry-over Rule" size="small">
        <Button
          size="large"
          type="primary"
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

export default CarryOverRule;
