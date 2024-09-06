import React, { useEffect, useState } from 'react';
import LeaveManagementTableFilter from './tableFilter';
import { Avatar, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { UserOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { TbFileDownload } from 'react-icons/tb';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import {
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { CommonObject } from '@/types/commons/commonObject';

const LeaveManagementTable = () => {
  const { setIsShowLeaveRequestManagementSidebar } = useLeaveManagementStore();
  const [tableData, setTableData] = useState<any[]>([]);
  // const [page, setPage] = useState('1');
  const page = '1';
  const [filter, setFilter] = useState<Partial<LeaveRequestBody['filter']>>({});
  const { data, isFetching } = useGetLeaveRequest(
    { page, limit: '20' },
    { filter },
  );

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'employee',
      key: 'employee',
      render: (employee: any) =>
        employee ? (
          <div className="flex items-center gap-1.5">
            <Avatar size={24} icon={<UserOutlined />} />
            <div className="flex-1">
              <div className="text-xs text-gray-900">{employee.name}</div>
              <div className="text-[10px] leading-4	text-gray-600">
                {employee.email}
              </div>
            </div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'from',
      dataIndex: 'from',
      key: 'from',
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'to',
      dataIndex: 'to',
      key: 'to',
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'total',
      dataIndex: 'total',
      key: 'total',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Attachment',
      dataIndex: 'attachment',
      key: 'attachment',
      render: (file: any) =>
        file ? (
          <div className="flex justify-between align-middle">
            <div>-</div>
            <TbFileDownload size={14} />
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: LeaveRequestStatus) => (
        <StatusBadge theme={LeaveRequestStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
  ];

  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
          from: item.startAt,
          to: item.endAt,
          total: item.days,
          type: typeof item.leaveType === 'string' ? '' : item.leaveType.title,
          attachment: item.justificationDocument,
          status: item.status,
        })),
      );
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<LeaveRequestBody['filter']> = {};
    if (val.dateRange) {
      nFilter['date'] = {
        from: val.dateRange[0],
        to: val.dateRange[1],
      };
    }

    if (val.type) {
      nFilter['leaveTypeIds'] = [val.type];
    }

    if (val.status) {
      nFilter['status'] = val.status;
    }

    setFilter(nFilter);
  };

  return (
    <div className="mt-6">
      <LeaveManagementTableFilter onChange={onFilterChange} />

      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        rowSelection={{ checkStrictly: false }}
        pagination={{ position: ['none', 'bottomLeft'] }}
        onRow={() => {
          return {
            onClick: () => setIsShowLeaveRequestManagementSidebar(true),
          };
        }}
      />
    </div>
  );
};

export default LeaveManagementTable;
