import React from 'react';
import HistoryTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Table } from 'antd';
import { TbFileDownload } from 'react-icons/tb';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

const columns: TableColumnsType<any> = [
  {
    title: 'From',
    dataIndex: 'from',
    key: 'from',
    render: (date: string) => <div>{date}</div>,
  },
  {
    title: 'To',
    dataIndex: 'to',
    key: 'to',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => <div>{text}</div>,
  },
  {
    title: 'Attachment',
    dataIndex: 'attachment',
    key: 'attachment',
    render: (text: string) => (
      <div className="flex justify-between align-middle">
        <div>{text}</div>
        <TbFileDownload size={14} />
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => <StatusBadge>{text}</StatusBadge>,
  },
  {
    title: '',
    dataIndex: 'action',
    key: 'action',
    render: () => (
      <div className="flex items-center gap-2.5">
        <Button
          className="w-[30px] h-[30px]"
          icon={<FiEdit2 size={16} />}
          type="primary"
        />

        <Button
          className="w-[30px] h-[30px]"
          danger
          icon={<FiTrash2 size={16} />}
          type="primary"
        />
      </div>
    ),
  },
];

const TABLE_DATA: any[] = [
  {
    key: '1',
    from: '01 Mar 2024',
    to: '02 Mar 2024',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'rejected',
    action: '',
  },
  {
    key: '2',
    from: '01 Mar 2024',
    to: '02 Mar 2024',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'rejected',
    action: '',
  },
  {
    key: '3',
    from: '01 Mar 2024',
    to: '02 Mar 2024',
    total: '3 Days',
    type: 'Engagement',
    attachment: 'File.pdf',
    status: 'rejected',
    action: '',
  },
];

const HistoryTable = () => {
  return (
    <>
      <HistoryTableFilter />
      <Table
        className="mt-6"
        columns={columns}
        dataSource={TABLE_DATA}
        pagination={{ position: ['none', 'bottomLeft'] }}
      />
    </>
  );
};

export default HistoryTable;
