import React, { useEffect } from 'react';
import { Button, Space, Table } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { IoEyeOutline } from 'react-icons/io5';
import { GoLocation } from 'react-icons/go';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

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
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { AttendanceRecordTypeBadgeTheme } from '@/types/timesheet/attendance';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';

const AttendanceTable = () => {
  // Store hooks
  const { userId } = useAuthenticationStore();

  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
    usePagination(1, 10);

  const {
    setIsShowViewSidebarAttendance,
    setViewAttendanceId,
    filter,
    setFilter,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = useMyTimesheetStore();

  const pathname = usePathname();

  useEffect(() => {
    resetPagination();
  }, [pathname]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const userFilter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };

  // API call
  const { data, isFetching, refetch } = useGetAttendances(
    { page: currentPage, limit: pageSize, orderBy, orderDirection },

    { filter: { ...userFilter, ...filter } },
  );
  const { isMobile, isTablet } = useIsMobile();

  // Table columns
  const columns: TableColumnsType<AttendanceRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <div id="time-attendance-attendance-table-row-date-div" data-cy="time-attendance-attendance-table-row-date-div" className="text-sm text-gray-900 py-4 whitespace-nowrap">
          {dayjs(date).format(DATE_FORMAT)}
        </div>
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: string) => (
        <div id="time-attendance-attendance-table-row-clock-in-div" data-cy="time-attendance-attendance-table-row-clock-in-div" className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-in',
      dataIndex: 'geolocations',
      key: 'locationIn',
      render: (geolocations: any[]) => (
        <div id="time-attendance-attendance-table-row-location-in-div" data-cy="time-attendance-attendance-table-row-location-in-div" className="text-sm text-gray-900 py-4 flex items-center justify-between">
          {geolocations?.[0]?.allowedArea?.title ?? ''} <GoLocation />
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div id="time-attendance-attendance-table-row-clock-out-div" data-cy="time-attendance-attendance-table-row-clock-out-div" className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-Out',
      dataIndex: 'geolocations',
      key: 'locationOut',
      render: (geolocations: any[]) => (
        <div id="time-attendance-attendance-table-row-location-out-div" data-cy="time-attendance-attendance-table-row-location-out-div" className="text-sm text-gray-900 py-4 flex items-center justify-between">
          {geolocations?.[geolocations.length - 1]?.allowedArea?.title ?? ''}{' '}
          <GoLocation data-cy="time-attendance-attendance-table-row-location-out-icon" />
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
          <div id="time-attendance-attendance-table-row-status-container" data-cy="time-attendance-attendance-table-row-status-container" className="py-4">
            <Space id="time-attendance-attendance-table-row-status-space" data-cy="time-attendance-attendance-table-row-status-space">
              {statuses.map((status) => (
                <StatusBadge
                  theme={AttendanceRecordTypeBadgeTheme[status.status]}
                  key={status.status}
                  data-cy={`time-attendance-attendance-table-row-status-badge-${status.status}`}
                >
                  <div id={`time-attendance-attendance-table-row-status-badge-div-${status.status}`} data-cy={`time-attendance-attendance-table-row-status-badge-div-${status.status}`} className="text-center">
                    <div id={`time-attendance-attendance-table-row-status-badge-status-div-${status.status}`} data-cy={`time-attendance-attendance-table-row-status-badge-status-div-${status.status}`}>{status.status}</div>
                    {status.text && (
                      <div id={`time-attendance-attendance-table-row-status-badge-text-div-${status.status}`} data-cy={`time-attendance-attendance-table-row-status-badge-text-div-${status.status}`} className="font-normal">{status.text}</div>
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
          <div id="time-attendance-attendance-table-row-total-time-div" data-cy="time-attendance-attendance-table-row-total-time-div" className="text-sm text-gray-900 py-4">
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
        <div id="time-attendance-attendance-table-row-over-time-div" data-cy="time-attendance-attendance-table-row-over-time-div" className="text-sm text-gray-900 py-4">{minutes} min</div>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <div id="time-attendance-attendance-table-row-action-container" data-cy="time-attendance-attendance-table-row-action-container" className="py-4">
          <Button
            className="w-[30px] h-[30px]"
            icon={<IoEyeOutline data-cy="time-attendance-attendance-table-row-action-button-icon" size={16} />}
            type="primary"
            onClick={() => {
              setViewAttendanceId(record.id);
              setIsShowViewSidebarAttendance(true);
            }}
            id={`time-attendance-attendance-table-row-view-button-${record.id}`}
            data-cy={`time-attendance-attendance-table-row-action-button-${record.id}`}
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

  const handleTableChange = (pagination: any, sorter: any) => {
    setCurrentPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };

  return (
    <div
      className=" bg-white border border-gray-100 rounded p-5"
      id="time-attendance-attendance-table-container"
      data-cy="time-attendance-attendance-table-container"
    >
      <div
        className="flex items-center justify-between mb-6"
        id="time-attendance-attendance-table-header-container"
        data-cy="time-attendance-attendance-table-header-container"
      >
        <div
          className="flex items-center gap-0.5"
          id="time-attendance-attendance-table-title-container"
          data-cy="time-attendance-attendance-table-title-container"
        >
          <div
            className="text-sm sm:text-2xl font-bold text-gray-900"
            id="time-attendance-attendance-table-title"
            data-cy="time-attendance-attendance-table-title"
          >
            Attendance
          </div>

          <Button
            type="text"
            size="small"
            icon={<AiOutlineReload size={14} className="text-gray-600" />}
            onClick={() => refetch()}
            id="time-attendance-attendance-table-refresh-button"
            data-cy="time-attendance-attendance-table-refresh-button"
          />
        </div>
        {/* Mobile Filter */}
        <div
          className="sm:hidden flex items-center"
          id="time-attendance-attendance-table-mobile-filter-container"
          data-cy="time-attendance-attendance-table-mobile-filter-container"
        >
          <div className="h-10 flex ">
            <AttendanceTableFilter
              onChange={onFilterChange}
              data-cy="time-attendance-attendance-table-mobile-filter"
            />
          </div>
        </div>
      </div>

      {/* Desktop Filter */}
      <div
        className="hidden sm:block"
        id="time-attendance-attendance-table-desktop-filter-container"
        data-cy="time-attendance-attendance-table-desktop-filter-container"
      >
        <AttendanceTableFilter
          onChange={onFilterChange}
          data-cy="time-attendance-attendance-table-desktop-filter"
        />
      </div>

      <div id="time-attendance-attendance-table-content" data-cy="time-attendance-attendance-table-content">
        <Table<AttendanceRecord>
          className="mt-6"
          columns={columns}
          dataSource={data?.items}
          loading={isFetching}
          pagination={false}
          onChange={handleTableChange}
          scroll={{ x: 'min-content' }}
          id="time-attendance-attendance-table"
          data-cy="time-attendance-attendance-table"
        />
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="time-attendance-attendance-table-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={currentPage}
            total={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => {
              setPageSize(pageSize);
              setCurrentPage(1);
            }}
            data-cy="time-attendance-attendance-table-pagination"
          />
        )}
      </div>

      {/* View Attendance Sidebar */}

      {/* <Drawer
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
      </Drawer> */}
    </div>
  );
};

export default AttendanceTable;
