import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Table } from 'antd';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import NewAccrualRuleSidebar from './newAccrualRuleSidebar';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';

const AccrualRule = () => {
  const { setIsShowNewAccrualRuleSidebar } = useTimesheetSettingsStore();
  const { data } = useGetAccrualRules();
  const columns: TableColumnsType<any> = [
    {
      title: 'Accrual Rule',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Accrual Period',
      dataIndex: 'period',
      key: 'period',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => <div>{dayjs(text).format(DATE_FORMAT)}</div>,
    },
  ];

  const tableData = () => {
    return data
      ? data.items.map((item) => ({
          key: item.id,
          title: item.title,
          period: item.period,
          createdAt: item.createdAt,
        }))
      : [];
  };

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
        dataSource={tableData()}
        pagination={false}
      />

      <NewAccrualRuleSidebar />
    </>
  );
};

export default AccrualRule;
