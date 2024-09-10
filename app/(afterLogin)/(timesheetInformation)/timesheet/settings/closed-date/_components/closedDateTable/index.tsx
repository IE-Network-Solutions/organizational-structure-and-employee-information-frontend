import React from 'react';
import { Button, Space, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

const ClosedDateTable = () => {
  const { setIsShowClosedDateSidebar } = useTimesheetSettingsStore();
  const columns: TableColumnsType<any> = [
    {
      title: 'Date Naming',
      dataIndex: 'dateNaming',
      key: 'dateNaming',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: () => (
        <Space size={10}>
          <Button
            icon={<FiEdit2 size={16} />}
            type="primary"
            className="w-[30px] h-[30px]"
            onClick={() => setIsShowClosedDateSidebar(true)}
          />
          <Button
            className="w-[30px] h-[30px]"
            danger
            icon={<FiTrash2 size={16} />}
            type="primary"
          />
        </Space>
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
