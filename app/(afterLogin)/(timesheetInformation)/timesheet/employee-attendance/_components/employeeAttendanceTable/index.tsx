import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Dropdown, Table } from 'antd';
import TableFilter from './tableFilter';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import {
  calculateAttendanceRecordToTotalWorkTime,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from '@/utils/constants';
import {
  AttendanceBreak,
  AttendanceCheckInSource,
  AttendanceCheckOutSource,
  AttendanceRecord,
} from '@/types/timesheet/attendance';
import {
  formatBreakTypeToStatus,
  formatToAttendanceStatuses,
} from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import EmployeeAttendanceNameCell from '../employeeAttendanceNameCell';
import AttendanceTimeWithImagePopover from '../attendanceTimeWithImagePopover';
import {
  getBreakClockInInfo,
  getBreakClockOutInfo,
  getClockInInfo,
  getClockOutInfo,
} from '../attendanceImageHelpers';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { EmployeeAttendance } from '@/types/timesheet/employeeAttendance';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';
import { Key } from 'react';
import EmployeeAttendanceSideBar from '../sideBar';
import statusType from '../statusType';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import {
  formatAttendanceWallClockTime,
  formatAttendanceWallClockTimeOrDash,
} from '@/helpers/attendanceTimeHelper';

const formatAttendanceTimeLabel = (date?: string | null): string | null =>
  formatAttendanceWallClockTime(date, TIME_FORMAT);

const formatAttendanceCellTime = (date?: string | null): string =>
  formatAttendanceWallClockTimeOrDash(date, TIME_FORMAT);

/** Row uses API `startAt` / `endAt` mapped to `clockIn` / `clockOut`. */
const hasAttendanceTimestamp = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const getFilteredAttendanceBreak = (
  attendanceRecord: AttendanceRecord | null | undefined,
  breakTypeId?: string,
): AttendanceBreak | undefined => {
  if (!attendanceRecord?.attendanceBreaks?.length) return undefined;
  if (breakTypeId) {
    return attendanceRecord.attendanceBreaks.find(
      (b) => b.breakTypeId === breakTypeId,
    );
  }
  return attendanceRecord.attendanceBreaks[0];
};

const MISSED_BREAK_BADGE_CLASS =
  'min-h-6 max-w-full py-1 px-3 flex items-center justify-center rounded-lg font-bold text-[10px] whitespace-normal text-center bg-red-100 text-red-600';

interface EmployeeAttendanceTableProps {
  setBodyRequest: Dispatch<SetStateAction<AttendanceRequestBody>>;
  isImport: boolean;
  selectedRowKeys?: Key[];
  setSelectedRowKeys?: (keys: Key[]) => void;
}

const EmployeeAttendanceTable: FC<EmployeeAttendanceTableProps> = ({
  setBodyRequest,
  isImport,
  selectedRowKeys,
  setSelectedRowKeys,
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const pathname = usePathname();
  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
    usePagination(1, 10);

  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = useMyTimesheetStore();

  useEffect(() => {
    resetPagination();
  }, [pathname]);

  const {
    setEmployeeId,
    setIsShowEmployeeAttendanceSidebar,
    setEmployeeAttendanceId,
    setAttendanceRecordDate,
  } = useEmployeeAttendanceStore();
  const { filter, setFilter } = useEmployeeAttendanceStore();
  const { data: breakTypeData } = useGetBreakTypes();
  const hasBreakTypeFilter = !!filter?.breakTypeId;
  const selectedBreakType = breakTypeData?.items?.find(
    (bt) => bt.id === filter?.breakTypeId,
  );
  const { data, isFetching, refetch } = useGetAttendances(
    { page: currentPage, limit: pageSize, orderBy, orderDirection },
    { filter },
  );
  const importWarnings: Array<{
    line?: number;
    warning?: string;
    userId?: string;
  }> = (data as any)?.summary?.importWarnings ?? [];
  const lastWarningSignatureRef = useRef<string>('');

  useEffect(() => {
    if (importWarnings.length === 0) return;

    const warningSignature = importWarnings
      .map(
        (warning) =>
          `${warning?.line ?? ''}|${warning?.userId ?? ''}|${warning?.warning ?? ''}`,
      )
      .join('||');

    if (warningSignature === lastWarningSignatureRef.current) return;

    lastWarningSignatureRef.current = warningSignature;

    const warningLines = importWarnings
      .slice(0, 5)
      .map((warning) => {
        const lineText = `Line ${warning?.line ?? '-'}`;
        const warningText = warning?.warning || 'Warning';
        const userText = warning?.userId ? ` (User: ${warning.userId})` : '';
        return `${lineText} - ${warningText}${userText}`;
      })
      .join('\n');

    const remainingCount = importWarnings.length - 5;
    const remainingText =
      remainingCount > 0 ? `\n...and ${remainingCount} more warning(s)` : '';

    NotificationMessage.warning({
      message: `Import Warnings (${importWarnings.length})`,
      description: `${warningLines}${remainingText}`,
    });
  }, [importWarnings]);

  const { isMobile, isTablet } = useIsMobile();

  const columns: TableColumnsType<any> = [
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-employee-name-span"
          data-cy="time-attendance-employee-attendance-table-employee-name-span"
        >
          Employee Name
        </span>
      ),
      dataIndex: 'userId',
      key: 'createdBy',
      render: (text: string) => <EmployeeAttendanceNameCell userId={text} />,
      width: 280,
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-date-span"
          data-cy="time-attendance-employee-attendance-table-date-span"
        >
          Date
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div
          className="text-sm font-normal text-[#4d4d4d]"
          data-cy="employee-attendance-components-employeeattendancetable-index-tsx-index-div-161"
        >
          {dayjs(date).format(DATE_FORMAT)}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-clock-in-span"
          data-cy="time-attendance-employee-attendance-table-clock-in-span"
        >
          Clock In
        </span>
      ),
      dataIndex: 'clockIn',
      key: 'clockIn',
      width: hasBreakTypeFilter ? 200 : undefined,
      render: (date: string, record: any) => {
        const attendanceRecord = record.status as AttendanceRecord;
        const attendanceBreak = getFilteredAttendanceBreak(
          attendanceRecord,
          filter?.breakTypeId,
        );
        const isFilteringByBreak = Boolean(filter?.breakTypeId);
        const showBreakTimes = isFilteringByBreak
          ? attendanceBreak != null
          : false;
        const noMatchingBreak = isFilteringByBreak && attendanceBreak == null;

        const { imageUrl, allowedAreaName } = noMatchingBreak
          ? { imageUrl: null, allowedAreaName: null }
          : showBreakTimes
            ? getBreakClockInInfo(attendanceBreak)
            : getClockInInfo(record.geolocations);

        const clockInDate = noMatchingBreak
          ? null
          : showBreakTimes
            ? attendanceBreak?.endAt
            : date;
        const clockInEventLabel = isFilteringByBreak
          ? 'Break check in'
          : 'Check in';
        const clockInTimeLabel = formatAttendanceTimeLabel(clockInDate);

        const timeContent = noMatchingBreak ? (
          <div
            id={`time-attendance-employee-attendance-row-clock-in-div-${record.key}-no-matching-break`}
            data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.key}-no-matching-break`}
            className={MISSED_BREAK_BADGE_CLASS}
          >
            Missed Break Clock In
          </div>
        ) : showBreakTimes ? (
          attendanceBreak?.endAt ? (
            formatAttendanceCellTime(attendanceBreak.endAt)
          ) : (
            <div
              id={`time-attendance-employee-attendance-row-clock-in-div-${record.key}-missed-break-clock-in`}
              data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.key}-missed-break-clock-in`}
              className={MISSED_BREAK_BADGE_CLASS}
            >
              Missed Break Clock In
            </div>
          )
        ) : (
          formatAttendanceCellTime(date)
        );

        return (
          <div
            id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}`}
            data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}`}
            className="text-sm font-normal text-[#4d4d4d]"
          >
            <AttendanceTimeWithImagePopover
              imageUrl={imageUrl}
              allowedAreaName={allowedAreaName}
              eventLabel={clockInEventLabel}
              timeLabel={clockInTimeLabel}
              dataCy={`time-attendance-employee-attendance-row-clock-in-${record.key}`}
            >
              {timeContent}
            </AttendanceTimeWithImagePopover>
          </div>
        );
      },
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-clock-out-span"
          data-cy="time-attendance-employee-attendance-table-clock-out-span"
        >
          Clock Out
        </span>
      ),
      dataIndex: 'clockOut',
      key: 'clockOut',
      width: hasBreakTypeFilter ? 200 : undefined,
      render: (date: string, record: any) => {
        const attendanceRecord = record.status as AttendanceRecord;
        const attendanceBreak = getFilteredAttendanceBreak(
          attendanceRecord,
          filter?.breakTypeId,
        );
        const isFilteringByBreak = Boolean(filter?.breakTypeId);
        const showBreakTimes = isFilteringByBreak
          ? attendanceBreak != null
          : false;
        const noMatchingBreak = isFilteringByBreak && attendanceBreak == null;

        const { imageUrl, allowedAreaName } = noMatchingBreak
          ? { imageUrl: null, allowedAreaName: null }
          : showBreakTimes
            ? getBreakClockOutInfo(attendanceBreak)
            : getClockOutInfo(record.geolocations);

        const clockOutDate = noMatchingBreak
          ? null
          : showBreakTimes
            ? attendanceBreak?.startAt
            : date;
        const clockOutEventLabel = isFilteringByBreak
          ? 'Break check out'
          : 'Check out';
        const clockOutTimeLabel = formatAttendanceTimeLabel(clockOutDate);

        const timeContent = noMatchingBreak ? (
          <div
            id={`time-attendance-employee-attendance-row-clock-out-div-${record.key}-no-matching-break`}
            data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.key}-no-matching-break`}
            className={MISSED_BREAK_BADGE_CLASS}
          >
            Missed Break Clock Out
          </div>
        ) : showBreakTimes ? (
          attendanceBreak?.startAt ? (
            formatAttendanceCellTime(attendanceBreak.startAt)
          ) : (
            <div
              id={`time-attendance-employee-attendance-row-clock-out-div-${record.key}-missed-break-clock-out`}
              data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.key}-missed-break-clock-out`}
              className={MISSED_BREAK_BADGE_CLASS}
            >
              Missed Break Clock Out
            </div>
          )
        ) : (
          formatAttendanceCellTime(date)
        );

        return (
          <div
            id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}`}
            data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}`}
            className="text-sm font-normal text-[#4d4d4d]"
          >
            <AttendanceTimeWithImagePopover
              imageUrl={imageUrl}
              allowedAreaName={allowedAreaName}
              eventLabel={clockOutEventLabel}
              timeLabel={clockOutTimeLabel}
              dataCy={`time-attendance-employee-attendance-row-clock-out-${record.key}`}
            >
              {timeContent}
            </AttendanceTimeWithImagePopover>
          </div>
        );
      },
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-status-span"
          data-cy="time-attendance-employee-attendance-table-status-span"
        >
          Status
        </span>
      ),
      dataIndex: 'status',
      key: 'status',
      width: hasBreakTypeFilter ? 220 : undefined,
      render: (attendanceRecord: AttendanceRecord) => {
        if (hasBreakTypeFilter) {
          const breakTypeForStatus =
            selectedBreakType ??
            getFilteredAttendanceBreak(attendanceRecord, filter?.breakTypeId)
              ?.breakType;

          if (!breakTypeForStatus) {
            return (
              <span
                className="text-sm font-normal text-[#4d4d4d]"
                data-cy="time-attendance-employee-attendance-row-status-empty"
              >
                -
              </span>
            );
          }

          const breakStatus = formatBreakTypeToStatus(
            breakTypeForStatus,
            attendanceRecord,
          );
          const statusKey = breakStatus.status.text.replace(/\s+/g, '-');
          return (
            <div
              id={`time-attendance-employee-attendance-row-status-badge-${statusKey}-div`}
              data-cy={`time-attendance-employee-attendance-row-status-badge-${statusKey}-div`}
              className="min-w-0 max-w-full"
            >
              <StatusBadge theme={breakStatus.status.theme}>
                {breakStatus.status.text}
              </StatusBadge>
            </div>
          );
        }

        const statuses = formatToAttendanceStatuses(attendanceRecord);
        return (
          <div data-cy="time-attendance-employee-attendance-row-status-badge-div">
            {statuses.map((status) => (
              <div
                key={status.status}
                id={`time-attendance-employee-attendance-row-status-badge-${status.status}-status-div`}
                data-cy={`time-attendance-employee-attendance-row-status-badge-${status.status}-status-div`}
              >
                {statusType(status.status)}
              </div>
            ))}
          </div>
        );
      },
    },

    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-over-time-span"
          data-cy="time-attendance-employee-attendance-table-over-time-span"
        >
          Over-time
        </span>
      ),
      dataIndex: 'overTime',
      key: 'overTime',
      render: (text: string) => (
        <div
          id={`time-attendance-employee-attendance-row-over-time-div-${text}`}
          data-cy={`time-attendance-employee-attendance-row-over-time-div-${text}`}
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-total-time-span"
          data-cy="time-attendance-employee-attendance-table-total-time-span"
        >
          Total time
        </span>
      ),
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text: string) => (
        <div
          id={`time-attendance-employee-attendance-row-total-time-div-${text}`}
          data-cy={`time-attendance-employee-attendance-row-total-time-div-${text}`}
          className="text-sm font-normal text-[#4d4d4d]"
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-remote-check-in-span"
          data-cy="time-attendance-employee-attendance-table-remote-check-in-span"
        >
          Clock-in Method
        </span>
      ),
      dataIndex: 'checkInSource',
      key: 'checkInSource',
      width: 120,
      render: (val: AttendanceCheckInSource | undefined, record: any) => {
        if (!hasAttendanceTimestamp(record.clockIn)) {
          return (
            <div
              id={`time-attendance-employee-attendance-row-remote-check-in-div-${record.key}`}
              data-cy={`time-attendance-employee-attendance-row-remote-check-in-div-${record.key}`}
              className="text-center text-sm font-normal text-[#4d4d4d]"
            >
              -
            </div>
          );
        }
        return (
          <div
            id={`time-attendance-employee-attendance-row-remote-check-in-div-${record.key}`}
            data-cy={`time-attendance-employee-attendance-row-remote-check-in-div-${record.key}`}
            className="text-center"
          >
            <div
              id={`time-attendance-employee-attendance-row-remote-check-in-badge-${record.key}`}
              data-cy="time-attendance-employee-attendance-row-remote-check-in-badge-div"
            >
              {val ? (
                statusType(val)
              ) : (
                <span
                  className="text-sm font-normal text-[#4d4d4d]"
                  data-cy={`time-attendance-employee-attendance-row-remote-check-in-source-dash-${record.key}`}
                >
                  -
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-remote-check-out-span"
          data-cy="time-attendance-employee-attendance-table-remote-check-out-span"
        >
          Clock-out Method
        </span>
      ),
      dataIndex: 'checkOutSource',
      key: 'checkOutSource',
      width: 120,
      render: (val: AttendanceCheckOutSource | undefined, record: any) => {
        if (!hasAttendanceTimestamp(record.clockOut)) {
          return (
            <div
              id={`time-attendance-employee-attendance-row-remote-check-out-div-${record.key}`}
              data-cy={`time-attendance-employee-attendance-row-remote-check-out-div-${record.key}`}
              className="text-center text-sm font-normal text-[#4d4d4d]"
            >
              -
            </div>
          );
        }
        return (
          <div
            id={`time-attendance-employee-attendance-row-remote-check-out-div-${record.key}`}
            data-cy={`time-attendance-employee-attendance-row-remote-check-out-div-${record.key}`}
            className="text-center"
          >
            <div
              id={`time-attendance-employee-attendance-row-remote-check-out-badge-${record.key}`}
              data-cy="time-attendance-employee-attendance-row-remote-check-out-badge-div"
            >
              {val ? (
                statusType(val)
              ) : (
                <span
                  className="text-sm font-normal text-[#4d4d4d]"
                  data-cy={`time-attendance-employee-attendance-row-remote-check-out-source-dash-${record.key}`}
                >
                  -
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span
          className="font-bold text-base text-[#4b4b4b]"
          id="time-attendance-employee-attendance-table-action-span"
          data-cy="time-attendance-employee-attendance-table-action-span"
        >
          Action
        </span>
      ),
      dataIndex: 'action',
      key: 'action',
      render: (item: EmployeeAttendance) => {
        return (
          <Dropdown
            trigger={['click']}
            overlay={
              <EmployeeAttendanceSideBar data-cy="time-attendance-employee-attendance-table-edit-button-dropdown" />
            }
            data-cy="time-attendance-employee-attendance-table-edit-button-dropdown"
          >
            <Button
              type="text"
              className="border-none hover:bg-transparent"
              id={`${item?.id}buttonPopOverActionForOnEditActionId`}
              onClick={() => {
                setEmployeeId(item?.userId);
                setEmployeeAttendanceId(item?.id);
                setAttendanceRecordDate(item?.createdAt ?? '');
                setIsShowEmployeeAttendanceSidebar(true);
              }}
              data-cy={`time-attendance-employee-attendance-row-${item?.id}-edit-button`}
            >
              <span
                className="text-[#1e40af] text-sm font-normal"
                id="time-attendance-employee-attendance-table-edit-button-span"
                data-cy="time-attendance-employee-attendance-table-edit-button-span"
              >
                Edit
              </span>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    if (isImport) {
      refetch();
    }
  }, [isImport]);

  useEffect(() => {
    if (data && data.items) {
      const sortedItems = [...data.items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const nData = sortedItems.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          userId: item.userId,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          clockIn: item?.startAt,
          checkInSource: item?.checkInSource,
          checkOutSource: item?.checkOutSource,
          clockOut: item?.endAt,
          status: item,
          totalTime:
            item?.startAt &&
            item.endAt &&
            `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`,
          overTime: `${timeToHour(item.overTimeMinutes)}:${timeToLastMinute(item.overTimeMinutes)} hrs`,
          action: item,
          attendanceBreaks: item.attendanceBreaks,
          geolocations: item.geolocations,
        };
      });

      setTableData(nData);
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = {};
    if (val.date) {
      nFilter['date'] = {
        from: val.date[0]
          ? dayjs(val.date[0]).format('YYYY-MM-DD')
          : val.date[0],
        to: val.date[1] ? dayjs(val.date[1]).format('YYYY-MM-DD') : val.date[1],
      };
    }

    if (val.type) {
      nFilter['type'] = val.type;
    }

    if (val.type === 'clockedOut') {
      nFilter['type'] = null as any;
      nFilter.clockedOut = false;
    }

    if (val.breakTypeId) {
      nFilter['breakTypeId'] = val.breakTypeId;
    }

    if (val.checkInSource) {
      nFilter['checkInSource'] = val.checkInSource;
    }

    if (val.checkOutSource) {
      nFilter['checkOutSource'] = val.checkOutSource;
    }

    if (val.employeeId) {
      nFilter['userIds'] = Array.isArray(val.employeeId)
        ? val.employeeId
        : [val.employeeId];
    }

    setCurrentPage(1);
    setFilter(nFilter);
    setBodyRequest((prev) => ({
      ...prev,
      filter: nFilter,
    }));
  };

  const handleTableChange = (pagination: any, sorter: any) => {
    setCurrentPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowSelection = (selectedKeys: Key[]) => {
    const currentPageKeys = tableData.map((row) => row.key);

    const previousSelectedKeys =
      selectedRowKeys?.filter((key) => !currentPageKeys.includes(key)) || [];

    const allSelectedKeys = [...previousSelectedKeys, ...selectedKeys];

    setSelectedRowKeys?.(allSelectedKeys);
  };
  const getCurrentPageSelectedKeys = () => {
    const currentPageKeys = tableData.map((row) => row.key);
    return (
      selectedRowKeys?.filter((key) => currentPageKeys.includes(key)) || []
    );
  };

  return (
    <div
      id="time-attendance-employee-attendance-table-card"
      data-cy="time-attendance-employee-attendance-table-card"
      className="border-[1px] border-[#D9D9D9] rounded-lg"
    >
      <div
        id="time-attendance-employee-attendance-table-filter-section"
        data-cy="time-attendance-employee-attendance-table-filter-section"
        className="mb-4 px-2 sm:px-5 pt-4"
      >
        <TableFilter
          data-cy="time-attendance-employee-attendance-table-filter"
          onChange={onFilterChange}
        />
      </div>
      <div
        id="time-attendance-employee-attendance-table-container"
        data-cy="time-attendance-employee-attendance-table-container"
      >
        <div
          className="flex min-w-0 w-full overflow-x-auto scrollbar-none"
          id="time-attendance-employee-attendance-table-scroll-wrapper"
          data-cy="time-attendance-employee-attendance-table-scroll-wrapper"
        >
          {isFetching ? (
            <TableSkeleton
              columns={columns}
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table]:w-full"
              data-cy="time-attendance-employee-attendance-table-skeleton-wrapper"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={tableData}
              tableLayout={hasBreakTypeFilter ? 'fixed' : 'auto'}
              rowSelection={{
                checkStrictly: false,
                selectedRowKeys: getCurrentPageSelectedKeys(),
                onChange: handleRowSelection,
              }}
              pagination={false}
              scroll={{ x: 'max-content' }}
              className="w-full [&_.ant-table-tbody>tr.ant-table-row:nth-child(odd):hover>td]:!bg-[#FAFAFA] [&_.ant-table-tbody>tr.ant-table-row:nth-child(even):hover>td]:!bg-white"
              onChange={handleTableChange}
              id="time-attendance-employee-attendance-table"
              data-cy="time-attendance-employee-attendance-table"
              rowClassName={(record, index) => {
                const base = index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]';
                const selected = getCurrentPageSelectedKeys().includes(
                  record.key,
                );
                return selected ? `${base} [&>td]:!bg-white` : base;
              }}
            />
          )}
        </div>
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="time-attendance-employee-attendance-mobile-pagination"
            totalResults={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="time-attendance-employee-attendance-desktop-pagination"
            current={currentPage}
            total={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => {
              setPageSize(pageSize);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceTable;
