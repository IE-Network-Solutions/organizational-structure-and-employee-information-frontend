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
import dayjs from 'dayjs';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import usePagination from '@/utils/usePagination';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { FaPlus } from 'react-icons/fa';
import MyTimesheetAttendancePagination from '../attendance/MyTimesheetAttendancePagination';

const HistoryTable = () => {
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

  const columns: TableColumnsType<any> = [
    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      sorter: true,
      render: (text: string, record: { action?: LeaveRequest }) => (
        <button
          type="button"
          onClick={() => record.action && openDetail(record.action)}
          className="text-sm text-primary hover:underline py-4 text-left w-full cursor-pointer"
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
      sorter: true,
      render: (date: string) => (
        <div
          className="text-sm text-gray-900 py-4"
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
      sorter: true,
      render: (date: string) => (
        <div
          className="text-sm text-gray-900 py-4"
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
      sorter: true,
      render: (text: number) => (
        <div
          className="text-sm text-gray-900 py-4"
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
      render: (text: string) => (
        <div
          className="text-sm text-gray-900 py-4 max-w-[200px] truncate"
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
      render: (text: LeaveRequestStatus) => {
        const config = statusTagConfig[text] ?? {
          color: 'default',
          label: text,
        };
        return (
          <div
            className="py-4"
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

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<LeaveRequestBody['filter']> = { ...userFilter };
    if (val.dateRange) {
      nFilter['date'] = {
        from: val.dateRange[0],
        to: val.dateRange[1],
      };
    }

    if (val.type) {
      nFilter['leaveTypeIds'] = [val.type];
    }

    if (val.status) {
      nFilter['status'] = val.status;
    }

    setFilter(nFilter);
  };

  return (
    <div
      className="bg-white p-5 px-3 sm:p-6 rounded-lg"
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
        className="rounded-lg border border-gray-200 overflow-hidden"
        id="time-attendance-history-table-bordered-wrapper"
        data-cy="time-attendance-history-table-bordered-wrapper"
      >
        {/* Toolbar: Filter Type + Date range (all screens); New Request on desktop only (mobile: in layout header) */}
        <div
          className="flex flex-wrap items-center gap-3 p-3 sm:p-4"
          id="time-attendance-history-table-toolbar"
          data-cy="time-attendance-history-table-toolbar"
        >
          <div
            className="flex-1 min-w-0"
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
            <Button
              size="large"
              type="primary"
              icon={<FaPlus />}
              className="hidden sm:flex h-10 items-center justify-center shrink-0"
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
          </AccessGuard>
        </div>

        <div
          className="border-t border-gray-200"
          data-cy="time-attendance-history-table-container"
        >
          <Table
            className="leave-table"
            columns={columns}
            loading={isFetching}
            dataSource={tableData}
            pagination={false}
            onChange={(paginationUnused, filtersUnused, sorter: any) => {
              void paginationUnused;
              void filtersUnused;
              setOrderDirection(sorter['order']);
              setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
            }}
            scroll={{ x: 'max-content' }}
            id="time-attendance-history-table"
            data-cy="time-attendance-history-table"
          />
          <div
            className="mx-3"
            data-cy="time-attendance-history-table-pagination-wrapper"
          >
            <MyTimesheetAttendancePagination
              current={page}
              total={data?.meta?.totalItems ?? 0}
              pageSize={limit}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
