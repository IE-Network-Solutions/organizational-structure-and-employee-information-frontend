import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Avatar, Space, Table } from 'antd';

import TableFilter from './tableFilter';

import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { TableColumnsType } from '@/types/table/table';
import { UserOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from '@/utils/constants';
import {
  AttendanceRecord,
  AttendanceRecordTypeBadgeTheme,
} from '@/types/timesheet/attendance';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';

interface EmployeeAttendanceTableProps {
  setBodyRequest: Dispatch<SetStateAction<AttendanceRequestBody>>;
  isImport: boolean;
}

const EmployeeAttendanceTable: FC<EmployeeAttendanceTableProps> = ({
  setBodyRequest,
  isImport,
}) => {
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
  const [filter, setFilter] =
    useState<Partial<AttendanceRequestBody['filter']>>();
  const { data, isFetching, refetch } = useGetAttendances(
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
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'clockIn',
      render: (date: string) => (
        <div>{dayjs(date).format(DATETIME_FORMAT)}</div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'clockOut',
      render: (date: string) => (
        <div>{date ? dayjs(date).format(DATETIME_FORMAT) : '-'}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (item: AttendanceRecord) => {
        const statuses = formatToAttendanceStatuses(item);
        return (
          <Space>
            {statuses.map((status) => (
              <StatusBadge
                theme={AttendanceRecordTypeBadgeTheme[status.status]}
                key={status.status}
              >
                <div className="text-center">
                  <div>{status.status}</div>
                  {status.text && (
                    <div className="font-normal">{status.text}</div>
                  )}
                </div>
              </StatusBadge>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Over-time',
      dataIndex: 'overTime',
      key: 'overTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Total time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Approval Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: () => <div>-</div>,
    },
  ];

  useEffect(() => {
    if (isImport) {
      refetch();
    }
  }, [isImport]);

  useEffect(() => {
    if (data && data.items) {
      const nData = data.items.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          clockIn: item.startAt,
          clockOut: item.endAt,
          status: item,
          totalTime: `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`,
          overTime: `${timeToHour(item.overTimeMinutes)}:${timeToLastMinute(item.overTimeMinutes)} hrs`,
          approvalStatus: item,
        };
      });
      setTableData(nData);
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = {};
    if (val.date) {
      nFilter['date'] = {
        from: val.date[0],
        to: val.date[1],
      };
    }

    if (val.type) {
      nFilter['type'] = val.type;
    }

    setFilter(nFilter);
    setBodyRequest((prev) => ({
      ...prev,
      filter: nFilter,
    }));
  };

  return (
    <>
      <div className="mb-6">
        <TableFilter onChange={onFilterChange} />
      </div>
      <Table
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        rowSelection={{ checkStrictly: false }}
        pagination={defaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
      />
    </>
  );
};

export default EmployeeAttendanceTable;
