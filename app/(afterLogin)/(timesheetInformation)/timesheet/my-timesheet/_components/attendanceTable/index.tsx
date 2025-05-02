import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Drawer } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
import { LuSettings2 } from 'react-icons/lu';
import dayjs from 'dayjs';

// Types
import { TableColumnsType } from '@/types/table/table';
import { CommonObject } from '@/types/commons/commonObject';
import { AttendanceRecord } from '@/types/timesheet/attendance';

// Components
import AttendanceTableFilter from './tableFilter/inedx';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

// Store
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';

// Utils
import { DATE_FORMAT, DATETIME_FORMAT } from '@/utils/constants';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import usePagination from '@/utils/usePagination';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { AttendanceRecordTypeBadgeTheme } from '@/types/timesheet/attendance';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';

interface TableData {
  key: string;
  createdAt: string;
  clockIn: string;
  locationIn: string;
  clockOut: string;
  locationOut: string;
  status: AttendanceRecord;
  totalTime: string;
  overTime: string;
  action: AttendanceRecord;
}

const AttendanceTable = () => {
  // Store hooks
  const { userId } = useAuthenticationStore();
  const { setIsShowViewSidebar, setViewAttendanceId } = useMyTimesheetStore();

  // State
  const [tableData, setTableData] = useState<TableData[]>([]);
  const userFilter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };
  const [filter, setFilter] = useState<Partial<AttendanceRequestBody['filter']>>(userFilter);

  // Pagination
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

  // API call
  const { data, isFetching, refetch } = useGetAttendances(
    { page, limit, orderBy, orderDirection },
    { filter },
  );

  // Add mobile filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Table columns
  const columns: TableColumnsType<TableData> = [
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

  // Data transformation
  useEffect(() => {
    if (data?.items) {
      const transformedData = data.items.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          createdAt: item.createdAt,
          clockIn: item.startAt,
          locationIn: item?.geolocations[0]?.allowedArea?.title ?? '',
          clockOut: item.endAt,
          locationOut:
            item?.geolocations[item?.geolocations.length - 1]?.allowedArea?.title ?? '',
          status: item,
          totalTime: `${item.startAt && item.endAt ? `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs` : '-'} `,
          overTime: item.overTimeMinutes + ' min',
          action: item,
        };
      });
      setTableData(transformedData);
    }
  }, [data]);

  // Filter handler
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

  // Table change handler
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current ?? 1);
    setLimit(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-0.5">
          <div className="text-2xl font-bold text-gray-900">My Attendance</div>
          <Button
            type="text"
            size="small"
            icon={<AiOutlineReload size={14} className="text-gray-600" />}
            onClick={() => refetch()}
          />
        </div>
        
        <Button
          type="default"
          className="sm:hidden"
          icon={<LuSettings2 size={20} />}
          onClick={() => setIsFilterOpen(true)}
        />
      </div>
      
      {/* Desktop Filter */}
      <div className="hidden sm:block">
        <AttendanceTableFilter onChange={onFilterChange} />
      </div>

      {/* Mobile Pagination */}
      <div className="sm:hidden flex items-center justify-center gap-2 mb-4">
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page <= 1}
        >
          <span className="text-gray-600">&lt;</span>
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-900">{page}</span>
        </div>
        <button
          className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${page >= (data?.meta?.totalPages ?? 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          onClick={() => page < (data?.meta?.totalPages ?? 1) && setPage(page + 1)}
          disabled={page >= (data?.meta?.totalPages ?? 1)}
        >
          <span className="text-gray-600">&gt;</span>
        </button>
      </div>
      
      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        pagination={DefaultTablePagination(data?.meta?.totalItems)}
        onChange={handleTableChange}
        scroll={{ x: 'min-content' }}
      />

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter"
        placement="bottom"
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        height="auto"
        className="rounded-t-2xl"
        maskClosable={true}
        destroyOnClose={true}
      >
        <div className="p-4">
          <AttendanceTableFilter 
            onChange={onFilterChange}
            onClose={() => setIsFilterOpen(false)}
          />
        </div>
      </Drawer>
    </>
  );
};

export default AttendanceTable;
