import React from 'react';
import { Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import ActionButtons from '@/components/common/actionButton/actionButtons';

const ClosedDateTable = () => {
  const { setIsShowClosedDateSidebar } = useTimesheetSettingsStore();
  const columns: TableColumnsType<any> = [
    {
      title: 'Date Naming',
      dataIndex: 'dateNaming',
      key: 'dateNaming',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      sorter: true,
      render: () => (
        <ActionButtons
          onEdit={() => setIsShowClosedDateSidebar(true)}
          onDelete={() => setIsShowClosedDateSidebar(true)}
        />
      ),
    },
  ];

  const data = [
    {
      key: '1',
      dateNaming: "New Year's Day",
      type: 'Holiday',
      date: '12 Sep 2023',
      description: 'lorem',
      action: '',
    },
    {
      key: '2',
      dateNaming: "New Year's Day",
      type: 'Holiday',
      date: '12 Sep 2023',
      description: 'lorem',
      action: '',
    },
  ];

  return (
    <Table
      className="mt-6"
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
};

export default ClosedDateTable;
