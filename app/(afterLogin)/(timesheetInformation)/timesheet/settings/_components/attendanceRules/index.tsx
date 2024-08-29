import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Space } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import RuleTable from './ruleTable';
import AddTypeSidebar from './addTypeSidebar';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import CreateRuleSidebar from './ createRuleSidebar';

const AttendanceRules = () => {
  const { setIsShowRulesAddTypeSidebar, setIsShowCreateRule } =
    useTimesheetSettingsStore();

  return (
    <>
      <PageHeader size="small" title="Attendace Rules">
        <Space size={20}>
          <Button
            size="large"
            icon={<LuPlus size={18} />}
            onClick={() => setIsShowRulesAddTypeSidebar(true)}
          >
            New Type
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<LuPlus size={18} />}
            onClick={() => setIsShowCreateRule(true)}
          >
            New Rule
          </Button>
        </Space>
      </PageHeader>

      <RuleTable />
      <RuleTable />

      <AddTypeSidebar />
      <CreateRuleSidebar />
    </>
  );
};

export default AttendanceRules;
