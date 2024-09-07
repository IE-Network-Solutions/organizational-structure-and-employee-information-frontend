import React, { useEffect, useState } from 'react';
import { Avatar, Table } from 'antd';

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
  AttendanceRecordType,
  AttendanceRecordTypeBadgeTheme,
  attendanceRecordTypeOption,
} from '@/types/timesheet/attendance';
import { formatToAttendanceType } from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';

const EmployeeAttendanceTable = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const { page, limit, setPage, setLimit } = usePagination(1, 10);
  const [filter, setFilter] =
    useState<Partial<AttendanceRequestBody['filter']>>();
  const { data, isFetching } = useGetAttendances({ page, limit }, { filter });

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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
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
        const type = formatToAttendanceType(item);
        const title = attendanceRecordTypeOption.find(
          (item) => item.value === type,
        )!.label;
        const min =
          type === AttendanceRecordType.EARLY
            ? item.earlyByMinutes
            : type === AttendanceRecordType.LATE
              ? item.lateByMinutes
              : 0;
        return (
          <StatusBadge theme={AttendanceRecordTypeBadgeTheme[type]}>
            <div className="text-center">
              <div>{title}</div>
              {min &&
                [
                  AttendanceRecordType.EARLY,
                  AttendanceRecordType.LATE,
                ].includes(type) && (
                  <div className="font-normal">{min} min</div>
                )}
            </div>
          </StatusBadge>
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
    if (data && data.items) {
      const nData = data.items.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          employee: item.createdBy,
          date: item.createdAt,
          clockIn: item.startAt,
          clockOut: item.endAt,
          status: item,
          totalTime: `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`,
          overTime: item.overTimeMinutes + ' min',
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
        pagination={defaultTablePagination(
          data?.meta?.totalItems,
          (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
        )}
      />
    </>
  );
};

export default EmployeeAttendanceTable;
