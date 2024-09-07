import React, { useEffect, useState } from 'react';
import AttendanceTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Table } from 'antd';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { CommonObject } from '@/types/commons/commonObject';
import { DATE_FORMAT, DATETIME_FORMAT, localUserID } from '@/utils/constants';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import {
  AttendanceRecord,
  AttendanceRecordType,
  AttendanceRecordTypeBadgeTheme,
  attendanceRecordTypeOption,
} from '@/types/timesheet/attendance';
import { formatToAttendanceType } from '@/helpers/formatTo';
import dayjs from 'dayjs';
import { AiOutlineReload } from 'react-icons/ai';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';

const AttendanceTable = () => {
  const userFilter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [localUserID ?? ''],
  };
  const { setIsShowViewSidebar, setViewAttendanceId } = useMyTimesheetStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const { page, limit, setPage, setLimit } = usePagination(1, 10);
  const [filter, setFilter] =
    useState<Partial<AttendanceRequestBody['filter']>>(userFilter);
  const { data, isFetching, refetch } = useGetAttendances(
    { page, limit },
    { filter },
  );

  const columns: TableColumnsType<any> = [
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
        <div>{dayjs(date).format(DATETIME_FORMAT)}</div>
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
          date: item.createdAt,
          clockIn: item.startAt,
          locationIn: item?.geolocations[0]?.allowedArea?.title ?? '',
          clockOut: item.endAt,
          locationOut:
            item?.geolocations[item?.geolocations.length - 1]?.allowedArea
              ?.title ?? '',
          status: item,
          totalTime: `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`,
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
        <div className="text-2xl font-bold text-gray-900">Attendance</div>
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

export default AttendanceTable;
