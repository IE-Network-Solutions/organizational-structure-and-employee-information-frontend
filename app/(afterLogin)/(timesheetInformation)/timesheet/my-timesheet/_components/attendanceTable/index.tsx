import React, { useEffect, useState } from 'react';
import AttendanceTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Space, Table } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { CommonObject } from '@/types/commons/commonObject';
import { DATE_FORMAT, DATETIME_FORMAT } from '@/utils/constants';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import {
  AttendanceRecord,
  AttendanceRecordTypeBadgeTheme,
} from '@/types/timesheet/attendance';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import dayjs from 'dayjs';
import { AiOutlineReload } from 'react-icons/ai';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const AttendanceTable = () => {
  const { userId } = useAuthenticationStore();
  const userFilter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };
  const { setIsShowViewSidebar, setViewAttendanceId } = useMyTimesheetStore();
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
    useState<Partial<AttendanceRequestBody['filter']>>(userFilter);
  const { data, isFetching, refetch } = useGetAttendances(
    { page, limit, orderBy, orderDirection },
    { filter },
  );

  const columns: TableColumnsType<any> = [
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
        <div>{date ? dayjs(date).format(DATETIME_FORMAT) : '-'}</div>
      ),
    },
    {
      title: 'Location-in',
      dataIndex: 'locationIn',
      key: 'locationIn',
      render: (text: string) => (
        <div className="flex items-center justify-between">
          {text} <GoLocation />
        </div>
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
      title: 'Location-Out',
      dataIndex: 'locationOut',
      key: 'locationOut',
      render: (text: string) => (
        <div className="flex items-center justify-between">
          {text} <GoLocation />
        </div>
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
      title: 'Total time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Over-time',
      dataIndex: 'overTime',
      key: 'overTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (item: AttendanceRecord) => (
        <Button
          className="w-[30px] h-[30px]"
          icon={<IoEyeOutline size={16} />}
          type="primary"
          onClick={() => {
            setViewAttendanceId(item.id);
            setIsShowViewSidebar(true);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (data && data.items) {
      const nData = data.items.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          createdAt: item.createdAt,
          clockIn: item.startAt,
          locationIn: item?.geolocations[0]?.allowedArea?.title ?? '',
          clockOut: item.endAt,
          locationOut:
            item?.geolocations[item?.geolocations.length - 1]?.allowedArea
              ?.title ?? '',
          status: item,
          totalTime: `${item.startAt && item.endAt ? `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs` : '-'} `,
          overTime: item.overTimeMinutes + ' min',
          action: item,
        };
      });
      setTableData(nData);
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = { ...userFilter };
    if (val.date) {
      nFilter['date'] = {
        from: val.date[0],
        to: val.date[1],
      };
    }

    if (val.location) {
      nFilter['locations'] = [val.location];
    }

    if (val.type) {
      nFilter['type'] = val.type;
    }

    setFilter(nFilter);
  };

  return (
    <>
      <div className="flex items-center gap-0.5 mb-6">
        <div className="text-2xl font-bold text-gray-900">My Attendance</div>
        <Button
          type="text"
          size="small"
          icon={<AiOutlineReload size={14} className="text-gray-600" />}
          onClick={() => {
            refetch();
          }}
        ></Button>
      </div>
      <AttendanceTableFilter onChange={onFilterChange} />
      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        pagination={DefaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
        scroll={{ x: 'min-content' }}
      />
    </>
  );
};

export default AttendanceTable;
