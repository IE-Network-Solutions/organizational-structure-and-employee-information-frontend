import React, { useEffect } from 'react';
import { Button, Dropdown, message, Space, Table, Tag } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import { GoLocation } from 'react-icons/go';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';

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

  const safeAttendancePageSize = pageSize > 0 ? pageSize : 1;
  const attendanceMetaTotalPages = data?.meta?.totalPages;
  const attendanceResolvedTotalPages = Math.max(
    1,
    typeof attendanceMetaTotalPages === 'number' &&
      !Number.isNaN(attendanceMetaTotalPages) &&
      attendanceMetaTotalPages >= 1
      ? attendanceMetaTotalPages
      : Math.ceil((data?.meta?.totalItems ?? 0) / safeAttendancePageSize),
  );
  const attendanceWrapPaginationManyPages = attendanceResolvedTotalPages > 3;
  const { mutate: exportAttendanceData } = UseExportAttendanceData();

  const handleExport = (exportType: 'PDF' | 'EXCEL') => {
    exportAttendanceData(
      {
        exportType,
        filter: { ...userFilter, ...filter },
      },
      {
        onSuccess: () => {
          message.success('Download completed successfully!');
        },
        onError: () => {
          message.error('Failed to export. Please try again.');
        },
      },
    );
  };

  const exportMenuItems: MenuProps['items'] = [
    { key: 'pdf', label: 'Export as PDF', onClick: () => handleExport('PDF') },
    {
      key: 'excel',
      label: 'Export as Excel',
      onClick: () => handleExport('EXCEL'),
    },
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
          className="text-sm text-black py-2 whitespace-nowrap"
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
          className="text-sm text-black py-2"
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
          className="text-sm text-black py-2 flex items-center justify-between"
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
          className="text-sm text-black py-2"
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
          className="text-sm text-black py-2 flex items-center justify-between"
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
            className="py-2"
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
            className="text-sm text-black py-2"
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
          className="text-sm text-black py-2"
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
          className="text-sm text-black py-2 whitespace-nowrap"
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
        <div
          className="text-sm text-black py-2"
          data-cy="time-attendance-attendance-table-row-clock-in-div"
        >
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Check Out',
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div
          className="text-sm text-black py-2"
          data-cy="time-attendance-attendance-table-row-clock-out-div"
        >
          {date ? dayjs(date).format('HH:mm') : '-'}
        </div>
      ),
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (unused: unknown, record: AttendanceRecord) => {
        void unused;
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(record);
        return (
          <div
            className="text-sm text-black py-2"
            data-cy="time-attendance-attendance-table-row-total-time-div"
          >
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
      render: (unused: unknown, record: AttendanceRecord) => {
        void unused;
        const breakMs = calculateAttendanceRecordToTotalBreakTimeMs(record);
        return (
          <div
            className="text-sm text-black py-2"
            data-cy="time-attendance-attendance-table-row-total-break-div"
          >
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
      render: (unused: unknown, record: AttendanceRecord) => {
        void unused;
        const statuses = formatToAttendanceStatuses(record);
        return (
          <div
            className="py-2"
            data-cy="time-attendance-attendance-table-row-status-container"
          >
            <Space
              wrap
              data-cy="time-attendance-attendance-table-row-status-space"
            >
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

  const columns =
    variant === 'myTimesheet' ? myTimesheetColumns : defaultColumns;

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = { ...userFilter };

    const dateRange = val.date as [string, string] | null | undefined;
    if (dateRange?.[0] && dateRange?.[1]) {
      nFilter['date'] = {
        from: dateRange[0],
        to: dateRange[1],
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
      className="bg-white border border-gray-300 rounded-md"
      id="time-attendance-attendance-table-container"
      data-cy="time-attendance-attendance-table-container"
    >
      <div
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
        {/* Mobile: full-width inline filters (stacked); see tableFilter */}
        <div
          className="w-full sm:hidden"
          id="time-attendance-attendance-table-mobile-filter-container"
          data-cy="time-attendance-attendance-table-mobile-filter-container"
        >
          <AttendanceTableFilter
            onChange={onFilterChange}
            data-cy="time-attendance-attendance-table-mobile-filter"
          />
        </div>
      </div>

      {/* Desktop Filter — px matches card inset so Export is not flush to the border */}
      <div
        className="hidden sm:block px-3 pb-2 sm:px-4 lg:px-5"
        id="time-attendance-attendance-table-desktop-filter-container"
        data-cy="time-attendance-attendance-table-desktop-filter-container"
      >
        <div
          className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-8 lg:gap-12"
          data-cy="time-attendance-attendance-table-desktop-filter-row"
        >
          <div
            className="min-w-0 shrink"
            data-cy="time-attendance-attendance-table-desktop-filter-filters"
          >
            <AttendanceTableFilter
              onChange={onFilterChange}
              data-cy="time-attendance-attendance-table-desktop-filter"
            />
          </div>
          {variant === 'myTimesheet' && (
            <div
              className="shrink-0 pl-4"
              data-cy="time-attendance-attendance-table-desktop-export-wrap"
            >
              <Dropdown
                menu={{ items: exportMenuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="primary"
                  ghost={true}
                  icon={<PiExportLight size={16} />}
                  data-cy="my-timesheet-attendance-export-button"
                  id="my-timesheet-attendance-export-button"
                  className="h-8 border-gray-300 px-3 text-gray-500 font-medium hover:text-primary hover:border-primary"
                >
                  Export
                </Button>
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      <div
        id="time-attendance-attendance-table-content"
        data-cy="time-attendance-attendance-table-content"
      >
        {isFetching ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table<AttendanceRecord>
            className="mt-3 [&_.ant-table-thead>tr>th]:whitespace-nowrap [&_.ant-table-tbody>tr>td]:whitespace-nowrap [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.time-attendance-table-row-even>td]:!bg-[#FAFAFA] [&_tr.time-attendance-table-row-odd>td]:!bg-white"
            columns={columns}
            dataSource={data?.items}
            pagination={false}
            onChange={handleTableChange}
            scroll={{ x: 'min-content' }}
            id="time-attendance-attendance-table"
            data-cy="time-attendance-attendance-table"
            rowClassName={(record, index) => {
              void record;
              return index % 2 === 1
                ? 'time-attendance-table-row-even'
                : 'time-attendance-table-row-odd';
            }}
          />
        )}
        <div
          className={`mx-1 ${isMobile || isTablet ? 'mt-6' : ''}`}
          data-cy="time-attendance-attendance-table-pagination-wrapper"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              currentPage={currentPage}
              totalResults={data?.meta?.totalItems ?? 0}
              totalPages={data?.meta?.totalPages}
              pageSize={pageSize}
              stackPagerAndGoTo={attendanceWrapPaginationManyPages}
              onChange={(newPage) => onPageChange(newPage)}
              onShowSizeChange={onPageChange}
              data-cy="time-attendance-attendance-table-mobile-pagination"
            />
          ) : variant === 'myTimesheet' ? (
            <CustomPagination
              current={currentPage}
              total={data?.meta?.totalItems ?? 0}
              totalPages={data?.meta?.totalPages}
              pageSize={pageSize}
              wrapMainRow={attendanceWrapPaginationManyPages}
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
              totalPages={data?.meta?.totalPages}
              pageSize={pageSize}
              wrapMainRow={attendanceWrapPaginationManyPages}
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
        destroyOnHidden
      >
        <div className="p-4">
          <AttendanceTableFilter onChange={onFilterChange} />
        </div>
      </Drawer> */}
    </div>
  );
};

export default AttendanceTable;
