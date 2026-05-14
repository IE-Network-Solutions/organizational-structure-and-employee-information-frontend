import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Avatar, Button, Dropdown, Table } from 'antd';
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
import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from '@/utils/constants';
import {
  AttendanceCheckInSource,
  AttendanceCheckOutSource,
  AttendanceRecord,
} from '@/types/timesheet/attendance';
import {
  formatBreakTypeToStatus,
  formatToAttendanceStatuses,
} from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
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
import NotificationMessage from '@/components/common/notification/notificationMessage';

/** Row uses API `startAt` / `endAt` mapped to `clockIn` / `clockOut`. */
const hasAttendanceTimestamp = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

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
  } = useEmployeeAttendanceStore();
  const { filter, setFilter } = useEmployeeAttendanceStore();
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
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading)
      return (
        <div
          id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-loading-div`}
          data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-loading-div`}
        >
          ...
        </div>
      );
    if (isError) return <>-</>;

    return employeeData ? (
      <div
        id={`time-attendance-employee-attendance-row-employee-name-div-${userId}`}
        data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}`}
        className="flex items-center gap-1.5"
      >
        <Avatar
          data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-avatar`}
          size={24}
          icon={<UserOutlined />}
        />
        <div
          id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-div`}
          data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-div`}
          className="flex-1"
        >
          <div
            id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-text-div`}
            data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-text-div`}
            className="text-sm font-normal text-[#4d4d4d] flex gap-2"
          >
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };

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
      render: (text: string) => <EmpRender userId={text} />,
      width: 250,
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
      render: (date: string, record: any) => {
        const attendanceBreak = record.attendanceBreaks?.[0];
        const hasBreakTypeFilter = filter?.breakTypeId; // Only show breaks when break type filter is selected
        return (
          <div
            id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}`}
            data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}`}
          >
            {hasBreakTypeFilter &&
            attendanceBreak &&
            attendanceBreak?.breakType ? (
              <div
                id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div`}
                data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div`}
                className="text-sm font-normal text-[#4d4d4d]"
              >
                <div
                  id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div-inner`}
                  data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div-inner`}
                  className="text-sm font-normal text-[#4d4d4d]"
                >
                  {attendanceBreak?.endAt ? (
                    dayjs(attendanceBreak?.endAt, 'YYYY-MM-DD HH:mm').format(
                      DATETIME_FORMAT,
                    )
                  ) : (
                    <div
                      id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div-inner-missed-break-clock-in-div`}
                      data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-break-type-div-inner-missed-break-clock-in-div`}
                      className="min-h-6 py-1 px-4 flex items-center justify-center rounded-lg font-bold text-[10px] w-max bg-red-100 text-red-600"
                    >
                      Missed Break Clock In
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                id={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-date-div`}
                data-cy={`time-attendance-employee-attendance-row-clock-in-div-${record.id}-date-div`}
                className="text-sm font-normal text-[#4d4d4d]"
              >
                {date
                  ? dayjs(date, 'YYYY-MM-DD HH:mm').format(DATETIME_FORMAT)
                  : '-'}
              </div>
            )}
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
      render: (date: string, record: any) => {
        const attendanceBreak = record.attendanceBreaks?.[0];
        const hasBreakTypeFilter = filter?.breakTypeId; // Only show breaks when break type filter is selected
        return (
          <div
            id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}`}
            data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}`}
          >
            {hasBreakTypeFilter &&
            attendanceBreak &&
            attendanceBreak?.breakType ? (
              <div
                id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div`}
                data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div`}
                className="text-sm font-normal text-[#4d4d4d]"
              >
                <div
                  id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div-inner`}
                  data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div-inner`}
                  className="text-sm font-normal text-[#4d4d4d]"
                >
                  {attendanceBreak?.startAt ? (
                    dayjs(attendanceBreak?.startAt, 'YYYY-MM-DD HH:mm').format(
                      DATETIME_FORMAT,
                    )
                  ) : (
                    <div
                      id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div-inner-missed-break-clock-out-div`}
                      data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-break-type-div-inner-missed-break-clock-out-div`}
                      className="min-h-6 py-1 px-4 flex items-center justify-center rounded-lg font-bold text-[10px] w-max bg-red-100 text-red-600"
                    >
                      Missed Break Clock Out
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                id={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-date-div`}
                data-cy={`time-attendance-employee-attendance-row-clock-out-div-${record.id}-date-div`}
                className="text-sm font-normal text-[#4d4d4d]"
              >
                {date
                  ? dayjs(date, 'YYYY-MM-DD HH:mm').format(DATETIME_FORMAT)
                  : '-'}
              </div>
            )}
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
      render: (record: AttendanceRecord) => {
        const attendanceBreak = record.attendanceBreaks?.[0];
        const hasBreakTypeFilter = filter?.breakTypeId;

        if (hasBreakTypeFilter) {
          const breakStatus = formatBreakTypeToStatus(
            attendanceBreak?.breakType,
            record,
          );
          return (
            <div
              id={`time-attendance-employee-attendance-row-status-badge-${breakStatus.status.text}-div`}
              data-cy={`time-attendance-employee-attendance-row-status-badge-${breakStatus.status.text}-div`}
              className="text-center"
            >
              <div
                id={`time-attendance-employee-attendance-row-status-badge-${breakStatus.status.text}-text-div`}
                data-cy={`time-attendance-employee-attendance-row-status-badge-${breakStatus.status.text}-text-div`}
              >
                {statusType(breakStatus.status.text)}
              </div>
            </div>
          );
        } else {
          const statuses = formatToAttendanceStatuses(record);
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
        }
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
                (setEmployeeId(item?.userId),
                  setEmployeeAttendanceId(item?.id));
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
          attendanceBreaks: item.attendanceBreaks, // Pass through attendance breaks data
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
        className="mb-4 px-5 pt-4"
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
