import React, { useEffect, useState } from 'react';
import HistoryTableFilter from './tableFilter';
import { TableColumnsType } from '@/types/table/table';
import { Button, Table, Tag } from 'antd';
import {
  useGetLeaveRequest,
  useGetSingleApproval,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { CommonObject } from '@/types/commons/commonObject';
import { LeaveRequest, LeaveRequestStatus } from '@/types/timesheet/settings';
import dayjs, { type Dayjs } from 'dayjs';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import usePagination from '@/utils/usePagination';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { FaPlus } from 'react-icons/fa';
import MyTimesheetAttendancePagination from '../attendance/MyTimesheetAttendancePagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const HistoryTable = () => {
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const userFilter: Partial<LeaveRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };
  const {
    setIsShowLeaveRequestDetail: isShowDetail,
    setIsShowLeaveRequestSidebar: isShow,
    setLeaveRequestSidebarWorkflowData,
    leaveRequestSidebarData,
    setLeaveRequestSidebarData,
    isLoading,
    setIsLoading,
  } = useMyTimesheetStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const { page, limit, orderBy, orderDirection, setPage, setLimit } =
    usePagination(1, 5);
  const [filter, setFilter] =
    useState<Partial<LeaveRequestBody['filter']>>(userFilter);
  const { data, isFetching } = useGetLeaveRequest(
    { page, limit, orderBy, orderDirection },
    { filter },
  );
  const { data: approverLog } = useGetSingleApproval(
    leaveRequestSidebarData ?? '',
  );
  useEffect(() => {
    if (isLoading && approverLog) {
      if (approverLog?.items?.length > 0) {
        NotificationMessage.warning({
          message: `The Approval Process has been begin you can't continue to edit the leave request`,
        });
        // Clear sidebar state to prevent stale data in add drawer
        setLeaveRequestSidebarData(null);
        // Optionally, if you have access to setLeaveRequest and form, also call:
        // setLeaveRequest(undefined);
        // form.resetFields();
      } else {
        isShow(true);
      }
      setIsLoading(false);
    }
  }, [approverLog, isLoading, leaveRequestSidebarData]);
  const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';

  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
          startAt: item.startAt,
          endAt: item.endAt,
          days: item.days,
          createdAt: item?.createdAt
            ? dayjs(item?.createdAt).format('YYYY-MM-DD')
            : '-',
          leaveType: item.leaveType
            ? typeof item.leaveType === 'string'
              ? ''
              : item.leaveType.title
            : '-',
          reason: item.justificationNote ?? '-',
          justificationDocument: item.justificationDocument,
          status: item.status,
          action: item,
        })),
      );
    }
  }, [data]);

  const statusTagConfig: Record<
    LeaveRequestStatus,
    { color: string; label: string }
  > = {
    [LeaveRequestStatus.PENDING]: { color: 'orange', label: 'Pending' },
    [LeaveRequestStatus.APPROVED]: { color: 'blue', label: 'Approved' },
    [LeaveRequestStatus.DECLINED]: { color: 'red', label: 'Rejected' },
  };

  const openDetail = (item: LeaveRequest) => {
    isShowDetail(true);
    setLeaveRequestSidebarData(item.id);
    setLeaveRequestSidebarWorkflowData(item.approvalWorkflowId ?? null);
  };

  const rowCellClass = 'text-sm py-2';
  const cellStyle = { paddingTop: 8, paddingBottom: 8 };

  /** Min widths keep cells readable; wrapper scrolls horizontally on narrow viewports. */
  const LEAVE_TABLE_SCROLL_X = 920;

  const columns: TableColumnsType<any> = [
    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 200,
      ellipsis: true,
      onCell: () => ({ style: cellStyle }),
      render: (text: string, record: { action?: LeaveRequest }) => (
        <button
          type="button"
          onClick={() => record.action && openDetail(record.action)}
          className={`${rowCellClass} block max-w-[200px] truncate text-left text-gray-600 hover:text-gray-900 hover:underline cursor-pointer`}
          title={text}
          data-cy="time-attendance-leave-requests-table-type"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startAt',
      key: 'startAt',
      width: 128,
      onCell: () => ({ style: cellStyle }),
      render: (date: string) => (
        <div
          className={`${rowCellClass} whitespace-nowrap text-gray-900`}
          data-cy="time-attendance-leave-requests-table-start-date"
        >
          {date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'endAt',
      key: 'endAt',
      width: 128,
      onCell: () => ({ style: cellStyle }),
      render: (date: string) => (
        <div
          className={`${rowCellClass} whitespace-nowrap text-gray-900`}
          data-cy="time-attendance-leave-requests-table-end-date"
        >
          {date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      width: 72,
      onCell: () => ({ style: cellStyle }),
      render: (text: number) => (
        <div
          className={`${rowCellClass} whitespace-nowrap text-gray-900`}
          data-cy="time-attendance-leave-requests-table-days"
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      onCell: () => ({ style: cellStyle }),
      render: (text: string) => (
        <div
          className={`${rowCellClass} max-w-[200px] truncate text-gray-900`}
          data-cy="time-attendance-leave-requests-table-reason"
          title={text}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      onCell: () => ({ style: cellStyle }),
      render: (text: LeaveRequestStatus) => {
        const config = statusTagConfig[text] ?? {
          color: 'default',
          label: text,
        };
        return (
          <div
            className={`${rowCellClass}`}
            data-cy="time-attendance-leave-requests-table-status"
          >
            <Tag
              color={config.color}
              data-cy="time-attendance-history-table-row-status-tag"
            >
              {config.label}
            </Tag>
          </div>
        );
      },
    },
  ];

  const safeHistoryLimit = limit > 0 ? limit : 1;
  const historyMetaTotalPages = data?.meta?.totalPages;
  const historyResolvedTotalPages = Math.max(
    1,
    typeof historyMetaTotalPages === 'number' &&
      !Number.isNaN(historyMetaTotalPages) &&
      historyMetaTotalPages >= 1
      ? historyMetaTotalPages
      : Math.ceil((data?.meta?.totalItems ?? 0) / safeHistoryLimit),
  );
  const historyWrapPaginationManyPages = historyResolvedTotalPages > 3;

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<LeaveRequestBody['filter']> = { ...userFilter };

    const mobileDate = val.date as [unknown, unknown] | undefined;
    const mobileStart = mobileDate?.[0];
    const mobileEnd = mobileDate?.[1];
    const dateRange = val.dateRange as [unknown, unknown] | undefined;

    if (mobileStart && mobileEnd) {
      nFilter['date'] = {
        from: dayjs(mobileStart as Dayjs).format('YYYY-MM-DD'),
        to: dayjs(mobileEnd as Dayjs).format('YYYY-MM-DD'),
      };
    } else if (dateRange?.[0] && dateRange?.[1]) {
      nFilter['date'] = {
        from: dayjs(dateRange[0] as Dayjs).format('YYYY-MM-DD'),
        to: dayjs(dateRange[1] as Dayjs).format('YYYY-MM-DD'),
      };
    }

    if (val.type) {
      nFilter['leaveTypeIds'] = [val.type];
    }

    setFilter(nFilter);
  };

  return (
    <div
      className="bg-white rounded-lg"
      id="time-attendance-history-table-container"
      data-cy="time-attendance-history-table-container"
    >
      <div
        className="mb-4"
        id="time-attendance-history-table-header-container"
        data-cy="time-attendance-history-table-header-container"
      >
        <div
          className="text-sm sm:text-xl font-bold text-gray-900 mb-4"
          id="time-attendance-history-table-title"
          data-cy="time-attendance-history-table-title"
        >
          Leave Requests
        </div>
      </div>

      <div
        className="rounded-lg border border-gray-200 sm:overflow-hidden"
        id="time-attendance-history-table-bordered-wrapper"
        data-cy="time-attendance-history-table-bordered-wrapper"
      >
        {/* Filters + New Request: one filter form; desktop matches attendance (left group / right action + gap). */}
        <div
          className="pl-4 pr-0 py-3 sm:p-0"
          id="time-attendance-history-table-toolbar"
          data-cy="time-attendance-history-table-toolbar"
        >
          <div
            className="flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-8 sm:px-4 sm:pb-2 sm:pt-4 lg:gap-12 lg:px-5"
            data-cy="time-attendance-history-table-toolbar-inner"
          >
            <div
              className="min-w-0 w-full sm:w-auto sm:shrink"
              data-cy="time-attendance-history-table-filter-wrapper"
            >
              <HistoryTableFilter
                onChange={onFilterChange}
                data-cy="time-attendance-history-table-filter"
              />
            </div>
            <AccessGuard
              data-cy="time-attendance-history-table-add-button-access-guard"
              permissions={[Permissions.SubmitLeaveRequest]}
            >
              <div
                className="hidden shrink-0 sm:block sm:pl-4"
                data-cy="time-attendance-history-table-new-request-wrap"
              >
                <Button
                  size="large"
                  type="primary"
                  icon={<FaPlus />}
                  className="flex h-10 items-center justify-center"
                  onClick={() => isShow(true)}
                  id="time-attendance-history-table-new-request-button"
                  data-cy="time-attendance-history-table-new-request-button"
                >
                  <span
                    className="inline"
                    data-cy="time-attendance-history-table-new-request-button-label"
                  >
                    New Request
                  </span>
                </Button>
              </div>
            </AccessGuard>
          </div>
        </div>

        <div
          className="border-t border-gray-200 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          data-cy="time-attendance-history-table-container"
        >
          <Table
            className="leave-table [&_.ant-table]:min-w-[920px] [&_.ant-table-thead>tr>th]:whitespace-nowrap [&_.ant-table-tbody>tr>td]:whitespace-nowrap [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.leave-history-table-row-even>td]:!bg-[#FAFAFA] [&_tr.leave-history-table-row-odd>td]:!bg-white"
            columns={columns}
            loading={isFetching}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: LEAVE_TABLE_SCROLL_X }}
            rowClassName={(record, index) => {
              void record;
              return index % 2 === 1
                ? 'leave-history-table-row-even'
                : 'leave-history-table-row-odd';
            }}
            tableLayout="fixed"
            id="time-attendance-history-table"
            data-cy="time-attendance-history-table"
          />
          <div
            className={`mx-2 sm:mx-3 ${isMobile || isTablet ? 'mt-6' : ''}`}
            data-cy="time-attendance-history-table-pagination-wrapper"
          >
            {isMobile || isTablet ? (
              <div className="[&>div]:border-0 [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-0">
                <CustomMobilePagination
                  currentPage={page}
                  totalResults={data?.meta?.totalItems ?? 0}
                  totalPages={data?.meta?.totalPages}
                  pageSize={limit}
                  stackPagerAndGoTo={historyWrapPaginationManyPages}
                  onChange={(newPage, newPageSize) => {
                    setPage(newPage);
                    setLimit(newPageSize);
                  }}
                  id="time-attendance-leave-requests-mobile-pagination"
                  data-cy="time-attendance-leave-requests-mobile-pagination"
                />
              </div>
            ) : (
              <MyTimesheetAttendancePagination
                current={page}
                total={data?.meta?.totalItems ?? 0}
                totalPages={data?.meta?.totalPages}
                pageSize={limit}
                wrapLayout={historyWrapPaginationManyPages}
                onChange={(newPage, newPageSize) => {
                  setPage(newPage);
                  setLimit(newPageSize);
                }}
                onShowSizeChange={(newPageSize) => {
                  setLimit(newPageSize);
                  setPage(1);
                }}
                id="time-attendance-leave-requests-pagination"
                data-cy="time-attendance-leave-requests-pagination"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
