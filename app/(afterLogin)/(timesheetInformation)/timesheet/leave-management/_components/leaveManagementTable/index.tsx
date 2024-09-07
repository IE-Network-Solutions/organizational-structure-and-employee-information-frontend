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
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';

const LeaveManagementTable = () => {
  const { setIsShowLeaveRequestManagementSidebar, setLeaveRequestId } =
    useLeaveManagementStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const {
    page,
    limit,
    orderBy,
    orderDirection,
    setPage,
    setLimit,
    setOrderBy,
    setOrderDirection,
  } = usePagination(1, 10);
  const [filter, setFilter] = useState<Partial<LeaveRequestBody['filter']>>({});
  const { data, isFetching } = useGetLeaveRequest(
    { page, limit, orderBy, orderDirection },
    { filter },
  );

  const columns: TableColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'createdBy',
      key: 'createdBy',
      sorter: true,
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
      dataIndex: 'startAt',
      key: 'startAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'to',
      dataIndex: 'endAt',
      key: 'endAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'total',
      dataIndex: 'days',
      key: 'days',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      sorter: true,
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
          createdBy: item.createdBy,
          startAt: item.startAt,
          endAt: item.endAt,
          days: item.days,
          leaveType:
            typeof item.leaveType === 'string' ? '' : item.leaveType.title,
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
        pagination={defaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
        onRow={(rowData: CommonObject) => {
          return {
            onClick: () => {
              setLeaveRequestId(rowData.key);
              setIsShowLeaveRequestManagementSidebar(true);
            },
          };
        }}
      />
    </div>
  );
};

export default LeaveManagementTable;
