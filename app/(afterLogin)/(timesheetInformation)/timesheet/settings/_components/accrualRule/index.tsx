import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Table } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import NewAccrualRuleSidebar from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/accrualRule/newAccrualRuleSidebar';

const AccrualRule = () => {
  const { setIsShowNewAccrualRuleSidebar } = useTimesheetSettingsStore();
  const columns: TableColumnsType<any> = [
    {
      title: 'Accrual Rule',
      dataIndex: 'accrualRule',
      key: 'accrualRule',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Accrual Period',
      dataIndex: 'accrualPeriod',
      key: 'accrualPeriod',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'submittedDate',
      key: 'submittedDate',
      render: (text: string) => <div>{text}</div>,
    },
  ];

  const data = [
    {
      key: '1',
      accrualRule: 'Offer',
      accrualPeriod: 'Monthly',
      submittedDate: '13 Jul 2022',
    },
  ];

  return (
    <>
      <PageHeader title="Accrual Rule" size="small">
        <Button
          size="large"
          type="primary"
          icon={<LuPlus size={18} />}
          onClick={() => setIsShowNewAccrualRuleSidebar(true)}
        >
          New Rule
        </Button>
      </PageHeader>

      <Table
        columns={columns}
        className="mt-6"
        dataSource={data}
        pagination={false}
      />

      <NewAccrualRuleSidebar />
    </>
  );
};

export default AccrualRule;
