import React, { useEffect } from 'react';
import { Button, Dropdown, message, Space, Table, Tag } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { GoLocation } from 'react-icons/go';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import MyTimesheetAttendancePagination from '../attendance/MyTimesheetAttendancePagination';

// Types
import { TableColumnsType } from '@/types/table/table';
import { CommonObject } from '@/types/commons/commonObject';
import { AttendanceRecord } from '@/types/timesheet/attendance';

// Components
import AttendanceTableFilter from './tableFilter/index';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

// Store
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
// Utils
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import {
  AttendanceRecordType,
  AttendanceRecordTypeBadgeTheme,
} from '@/types/timesheet/attendance';
import {
  calculateAttendanceRecordToTotalWorkTime,
  calculateAttendanceRecordToTotalBreakTimeMs,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';
import type { MenuProps } from 'antd';
import { UseExportAttendanceData } from '@/store/server/features/timesheet/attendance/queries';
import { PiExportLight } from 'react-icons/pi';

export type AttendanceTableVariant = 'default' | 'myTimesheet';

const ATTENDANCE_STATUS_TAG_COLOR: Record<AttendanceRecordType, string> = {
  [AttendanceRecordType.PRESENT]: 'blue',
  [AttendanceRecordType.LATE]: 'warning',
  [AttendanceRecordType.EARLY]: 'warning',
  [AttendanceRecordType.ABSENT]: 'error',
};

interface AttendanceTableProps {
  variant?: AttendanceTableVariant;
}

const AttendanceTable = ({ variant = 'default' }: AttendanceTableProps) => {
  // Store hooks
  const { userId } = useAuthenticationStore();

  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
    usePagination(1, 10);

  const {
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
  const { mutate: exportAttendanceData } = UseExportAttendanceData();

  const handleExport = (exportType: 'PDF' | 'EXCEL') => {
    exportAttendanceData(
      {
        exportType,
        filter: { ...userFilter, ...filter },
      },
      {
        onSuccess: () => message.success('Download completed successfully!'),
        onError: () => message.error('Failed to export. Please try again.'),
      },
    );
  };

  const exportMenuItems: MenuProps['items'] = [
    { key: 'pdf', label: 'Export as PDF', onClick: () => handleExport('PDF') },
    { key: 'excel', label: 'Export as Excel', onClick: () => handleExport('EXCEL') },
  ];

  // Table columns (default: full set including Location, Over-time)
  const defaultColumns: TableColumnsType<AttendanceRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <div
          id="time-attendance-attendance-table-row-date-div"
          data-cy="time-attendance-attendance-table-row-date-div"
          className="text-sm text-gray-900 py-4 whitespace-nowrap"
        >
          {dayjs(date).format(DATE_FORMAT)}
        </div>
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: string) => (
        <div
          id="time-attendance-attendance-table-row-clock-in-div"
          data-cy="time-attendance-attendance-table-row-clock-in-div"
          className="text-sm text-gray-900 py-4"
        >
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-in',
      dataIndex: 'geolocations',
      key: 'locationIn',
      render: (geolocations: any[]) => (
        <div
          id="time-attendance-attendance-table-row-location-in-div"
          data-cy="time-attendance-attendance-table-row-location-in-div"
          className="text-sm text-gray-900 py-4 flex items-center justify-between"
        >
          {geolocations?.[0]?.allowedArea?.title ?? ''} <GoLocation />
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div
          id="time-attendance-attendance-table-row-clock-out-div"
          data-cy="time-attendance-attendance-table-row-clock-out-div"
          className="text-sm text-gray-900 py-4"
        >
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Location-Out',
      dataIndex: 'geolocations',
      key: 'locationOut',
      render: (geolocations: any[]) => (
        <div
          id="time-attendance-attendance-table-row-location-out-div"
          data-cy="time-attendance-attendance-table-row-location-out-div"
          className="text-sm text-gray-900 py-4 flex items-center justify-between"
        >
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
          <div
            id="time-attendance-attendance-table-row-status-container"
            data-cy="time-attendance-attendance-table-row-status-container"
            className="py-4"
          >
            <Space
              id="time-attendance-attendance-table-row-status-space"
              data-cy="time-attendance-attendance-table-row-status-space"
            >
              {statuses.map((status) => (
                <StatusBadge
                  theme={AttendanceRecordTypeBadgeTheme[status.status]}
                  key={status.status}
                  data-cy={`time-attendance-attendance-table-row-status-badge-${status.status}`}
                >
                  <div
                    id={`time-attendance-attendance-table-row-status-badge-div-${status.status}`}
                    data-cy={`time-attendance-attendance-table-row-status-badge-div-${status.status}`}
                    className="text-center"
                  >
                    <div
                      id={`time-attendance-attendance-table-row-status-badge-status-div-${status.status}`}
                      data-cy={`time-attendance-attendance-table-row-status-badge-status-div-${status.status}`}
                    >
                      {status.status}
                    </div>
                    {status.text && (
                      <div
                        id={`time-attendance-attendance-table-row-status-badge-text-div-${status.status}`}
                        data-cy={`time-attendance-attendance-table-row-status-badge-text-div-${status.status}`}
                        className="font-normal"
                      >
                        {status.text}
                      </div>
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
          <div
            id="time-attendance-attendance-table-row-total-time-div"
            data-cy="time-attendance-attendance-table-row-total-time-div"
            className="text-sm text-gray-900 py-4"
          >
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
        <div
          id="time-attendance-attendance-table-row-over-time-div"
          data-cy="time-attendance-attendance-table-row-over-time-div"
          className="text-sm text-gray-900 py-4"
        >
          {minutes} min
        </div>
      ),
    },
  ];

  // My Timesheet variant: Date, Check In, Check Out, Total Hours, Total Break, Status, Action (no Location, no Over-time)
  const myTimesheetColumns: TableColumnsType<AttendanceRecord> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <div
          className="text-sm text-gray-900 py-4 whitespace-nowrap"
          data-cy="time-attendance-attendance-table-row-date-div"
        >
          {dayjs(date).format(DATE_FORMAT)}
        </div>
      ),
    },
    {
      title: 'Check In',
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4" data-cy="time-attendance-attendance-table-row-clock-in-div">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Check Out',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4" data-cy="time-attendance-attendance-table-row-clock-out-div">
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (_: unknown, record: AttendanceRecord) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(record);
        return (
          <div className="text-sm text-gray-900 py-4" data-cy="time-attendance-attendance-table-row-total-time-div">
            {record.startAt && record.endAt
              ? `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)}`
              : '-'}
          </div>
        );
      },
    },
    {
      title: 'Total Break',
      key: 'totalBreak',
      render: (_: unknown, record: AttendanceRecord) => {
        const breakMs = calculateAttendanceRecordToTotalBreakTimeMs(record);
        return (
          <div className="text-sm text-gray-900 py-4" data-cy="time-attendance-attendance-table-row-total-break-div">
            {breakMs > 0
              ? `${timeToHour(breakMs)}:${timeToLastMinute(breakMs)}`
              : '-'}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: unknown, record: AttendanceRecord) => {
        const statuses = formatToAttendanceStatuses(record);
        return (
          <div className="py-4" data-cy="time-attendance-attendance-table-row-status-container">
            <Space wrap data-cy="time-attendance-attendance-table-row-status-space">
              {statuses.map((status) => (
                <Tag
                  color={ATTENDANCE_STATUS_TAG_COLOR[status.status]}
                  key={status.status}
                  data-cy={`time-attendance-attendance-table-row-status-badge-${status.status}`}
                >
                  {status.status}
                  {status.text ? ` ${status.text}` : ''}
                </Tag>
              ))}
            </Space>
          </div>
        );
      },
    },
  ];

  const columns = variant === 'myTimesheet' ? myTimesheetColumns : defaultColumns;

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
      className="bg-white border border-gray-100 rounded"
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
          {variant === 'default' && (
            <>
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
            </>
          )}
        </div>
        {/* Mobile Filter */}
        <div
          className="sm:hidden flex items-center w-full"
          id="time-attendance-attendance-table-mobile-filter-container"
          data-cy="time-attendance-attendance-table-mobile-filter-container"
        >
          <div
            data-cy="my-timesheet-components-attendancetable-index-tsx-index-div-333"
            className="h-10 flex w-full"
          >
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
        <div
          className="flex flex-wrap items-center gap-4 justify-between mx-2"
          data-cy="time-attendance-attendance-table-desktop-filter-row"
        >
          <AttendanceTableFilter
            onChange={onFilterChange}
            data-cy="time-attendance-attendance-table-desktop-filter"
          />
          {variant === 'myTimesheet' && (
            <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
              <Button
                type="primary"
                ghost={true}
                icon={<PiExportLight  size={16} />}
                data-cy="my-timesheet-attendance-export-button"
                id="my-timesheet-attendance-export-button"
                className='border-gray-300 text-gray-500 font-medium hover:text-primary hover:border-primary'
              >
                Export
              </Button>
            </Dropdown>
          )}
        </div>
      </div>

      <div
        id="time-attendance-attendance-table-content"
        data-cy="time-attendance-attendance-table-content"
      >
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
        <div
          className="mx-1"
          data-cy="time-attendance-attendance-table-pagination-wrapper"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={data?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              data-cy="time-attendance-attendance-table-mobile-pagination"
            />
          ) : variant === 'myTimesheet' ? (
            <MyTimesheetAttendancePagination
              current={currentPage}
              total={data?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(size: number) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              data-cy="time-attendance-attendance-table-pagination"
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={data?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(size: number) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              data-cy="time-attendance-attendance-table-pagination"
            />
          )}
        </div>
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
