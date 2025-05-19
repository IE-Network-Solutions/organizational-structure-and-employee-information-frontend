import React from 'react';
import { Button, Space, Table, Drawer } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
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
import usePagination from '@/utils/usePagination';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { AttendanceRecordTypeBadgeTheme } from '@/types/timesheet/attendance';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';

const AttendanceTable = () => {
  // Store hooks
  const { userId } = useAuthenticationStore();

  const {
    setIsShowViewSidebar,
    setViewAttendanceId,
    isShowViewSidebar,
    filter,
    setFilter,
  } = useMyTimesheetStore();

  const userFilter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };

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

  const current = page;

  // API call
  const { data, isFetching, refetch } = useGetAttendances(
    { page, limit, orderBy, orderDirection },
    { filter },
  );

  // Table columns
  const columns: TableColumnsType<AttendanceRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {dayjs(date).format('DD MMM YYYY')}
        </div>
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-in',
      dataIndex: 'geolocations',
      key: 'locationIn',
      render: (geolocations: any[]) => (
        <div className="text-sm text-gray-900 py-4 flex items-center justify-between">
          {geolocations?.[0]?.allowedArea?.title ?? ''} <GoLocation />
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-Out',
      dataIndex: 'geolocations',
      key: 'locationOut',
      render: (geolocations: any[]) => (
        <div className="text-sm text-gray-900 py-4 flex items-center justify-between">
          {geolocations?.[geolocations.length - 1]?.allowedArea?.title ?? ''}{' '}
          <GoLocation />
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
          <div className="py-4">
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
          </div>
        );
      },
    },
    {
      title: 'Total time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text, record) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(record);
        return (
          <div className="text-sm text-gray-900 py-4">
            {record.startAt && record.endAt
              ? `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`
              : '-'}
          </div>
        );
      },
    },
    {
      title: 'Over-time',
      dataIndex: 'overTimeMinutes',
      key: 'overTime',
      render: (minutes: number) => (
        <div className="text-sm text-gray-900 py-4">{minutes} min</div>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <div className="py-4">
          <Button
            className="w-[30px] h-[30px]"
            icon={<IoEyeOutline size={16} />}
            type="primary"
            onClick={() => {
              setViewAttendanceId(record.id);
              setIsShowViewSidebar(true);
            }}
          />
        </div>
      ),
    },
  ];

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

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPage(pagination.current ?? 1);
    setLimit(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };

  return (
    <div className="border border-gray-100 rounded p-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-0.5">
          <div className="text-sm sm:text-2xl font-bold text-gray-900">
            Attendance
          </div>

          <Button
            type="text"
            size="small"
            icon={<AiOutlineReload size={14} className="text-gray-600" />}
            onClick={() => refetch()}
          />
        </div>
        {/* Mobile Filter */}
        <div className="sm:hidden flex items-center">
          <div className="h-10 flex ">
            <AttendanceTableFilter onChange={onFilterChange} />
          </div>
        </div>
      </div>

      {/* Desktop Filter */}
      <div className="hidden sm:block">
        <AttendanceTableFilter onChange={onFilterChange} />
      </div>

      <Table<AttendanceRecord>
        className="mt-6"
        columns={columns}
        dataSource={data?.items}
        loading={isFetching}
        pagination={{
          total: data?.meta?.totalItems,
          current: page,
          pageSize: limit,
          onChange: (page, pageSize) => {
            setPage(page);
            setLimit(pageSize);
          },
          showSizeChanger: true,
          onShowSizeChange: (current, size) => {
            setPage(current);
            setLimit(size);
          },
          position: ['bottomRight'],
          className: 'mt-4 flex items-center justify-between',
          showTotal: (total) => (
            <div className="text-gray-600">{total} results</div>
          ),
          showLessItems: true,
          hideOnSinglePage: true,
          itemRender: (page, type) => {
            if (type === 'prev') {
              return (
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  disabled={page <= 1}
                >
                  <span className="text-gray-600">&lt;</span>
                </button>
              );
            }
            if (type === 'next') {
              return (
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${page >= (data?.meta?.totalPages ?? 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  disabled={page >= (data?.meta?.totalPages ?? 1)}
                >
                  <span className="text-gray-600">&gt;</span>
                </button>
              );
            }
            if (type === 'page') {
              if (window.innerWidth < 640) {
                // Mobile view
                return page === current ? (
                  <div className="rounded-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-900">{page}</span>
                  </div>
                ) : null;
              } else {
                // Desktop view
                return page === current ? (
                  <div className="rounded-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-900">{page}</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">{page}</span>
                  </div>
                );
              }
            }
            return null;
          },
        }}
        onChange={handleTableChange}
        scroll={{ x: 'min-content' }}
      />

      <Drawer
        title="Filter"
        placement="bottom"
        onClose={() => setIsShowViewSidebar(false)}
        open={isShowViewSidebar}
        height="auto"
        className="rounded-t-2xl"
        maskClosable={true}
        destroyOnClose={true}
      >
        <div className="p-4">
          <AttendanceTableFilter onChange={onFilterChange} />
        </div>
      </Drawer>
    </div>
  );
};

export default AttendanceTable;
