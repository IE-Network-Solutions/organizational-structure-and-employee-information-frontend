'use client';

import React, { useEffect, useState } from 'react';
import { Button, Table, Tag } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { TableColumnsType } from '@/types/table/table';
import { useGetWorkFromHomeRequest } from '@/store/server/features/timesheet/workFromHome/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import usePagination from '@/utils/usePagination';
import dayjs from 'dayjs';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import UserCard from '@/components/common/userCard/userCard';

const DATE_DISPLAY_FORMAT = 'MMM D, YYYY';
const LEAVE_TABLE_SCROLL_X = 1120;
const ALL_EMPLOYEES_TABLE_SCROLL_X = 1320;

const EmployeeNameCell = ({ userId }: { userId: string }) => {
  const {
    isLoading,
    data: employeeData,
    isError,
  } = useGetSimpleEmployee(userId);

  if (isLoading) {
    return (
      <span data-cy="time-attendance-wfh-my-requests-employee-loading">...</span>
    );
  }
  if (isError || !employeeData) {
    return (
      <span data-cy="time-attendance-wfh-my-requests-employee-error">-</span>
    );
  }

  const fullName = `${employeeData.firstName || '-'} ${employeeData.middleName || '-'} ${employeeData.lastName || '-'}`.trim();

  return (
    <div
      className="flex items-center gap-1.5"
      data-cy={`time-attendance-wfh-my-requests-employee-${userId}`}
    >
      <UserCard
        data={employeeData}
        name={fullName}
        profileImage={employeeData.profileImage}
        size="small"
        nameClassName="text-sm text-gray-700"
        data-cy="time-attendance-wfh-my-requests-employee-card"
      />
    </div>
  );
};

function extractWorkFromHomeRejectionReason(item: any): string {
  const approvalComments = item?.approvalComments;
  const firstApprovalComment = Array.isArray(approvalComments)
    ? approvalComments[0]
    : approvalComments;
  const fromApprovalComments =
    firstApprovalComment?.comment ??
    firstApprovalComment?.commentText ??
    firstApprovalComment?.content ??
    (typeof firstApprovalComment === 'string' ? firstApprovalComment : '') ??
    '';

  if (fromApprovalComments) return fromApprovalComments;

  return (
    item?.rejectedReason ??
    item?.rejectionReason ??
    item?.rejectionComment ??
    item?.rejectReason ??
    item?.comment ??
    ''
  );
}

const statusTagConfig: Record<
  LeaveRequestStatus,
  { color: string; label: string }
> = {
  [LeaveRequestStatus.PENDING]: { color: 'orange', label: 'Pending' },
  [LeaveRequestStatus.APPROVED]: { color: 'blue', label: 'Approved' },
  [LeaveRequestStatus.DECLINED]: { color: 'red', label: 'Rejected' },
};

function normalizeStatus(raw: unknown): LeaveRequestStatus {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === LeaveRequestStatus.APPROVED || s === 'approve') {
    return LeaveRequestStatus.APPROVED;
  }
  if (s === LeaveRequestStatus.DECLINED || s === 'rejected' || s === 'reject') {
    return LeaveRequestStatus.DECLINED;
  }
  return LeaveRequestStatus.PENDING;
}

type WorkFromHomeMyRequestsTableProps = {
  showAllEmployees?: boolean;
};

export default function WorkFromHomeMyRequestsTable({
  showAllEmployees = false,
}: WorkFromHomeMyRequestsTableProps) {
  const { userId } = useAuthenticationStore();
  const {
    setIsShowWorkFromHomeRequestSidebar,
    setIsShowWorkFromHomeRequestDetail,
    setWorkFromHomeRequestId,
    setWorkFromHomeRequestWorkflowId,
    setWorkFromHomeRequestDetail,
  } = useMyTimesheetStore();
  const { page, limit, setPage, setLimit } = usePagination(1, 10);
  const [tableData, setTableData] = useState<any[]>([]);

  const { data, isFetching } = useGetWorkFromHomeRequest(
    {
      page,
      limit,
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    },
    showAllEmployees ? {} : { filter: { userIds: userId ? [userId] : [] } },
    true,
    showAllEmployees ? true : !!userId,
  );

  useEffect(() => {
    if (data?.items) {
      setTableData(
        data.items.map((item: any) => {
          const status = normalizeStatus(item.status);
          const rejectedReason =
            status === LeaveRequestStatus.DECLINED
              ? extractWorkFromHomeRejectionReason(item)
              : '';

          return {
            key: item.id,
            id: item.id,
            userId: item.userId,
            approvalWorkflowId: item.approvalWorkflowId ?? null,
            startAt: item.startAt,
            endAt: item.endAt,
            days:
              item.days ??
              (item.startAt && item.endAt
                ? dayjs(item.endAt).diff(dayjs(item.startAt), 'day') + 1
                : '-'),
            reason: item.reason ?? item.justificationNote ?? '-',
            status,
            rejectedReason,
          };
        }),
      );
    } else {
      setTableData([]);
    }
  }, [data]);

  const rowCellClass = 'text-sm py-2';
  const cellStyle = { paddingTop: 8, paddingBottom: 8 };

  const openRequestDetail = (record: Record<string, unknown>) => {
    if (!record.id || !record.approvalWorkflowId) return;
    setWorkFromHomeRequestId(String(record.id));
    setWorkFromHomeRequestWorkflowId(String(record.approvalWorkflowId));
    setWorkFromHomeRequestDetail(record);
    setIsShowWorkFromHomeRequestDetail(true);
  };

  const columns: TableColumnsType<any> = [
    ...(showAllEmployees
      ? [
          {
            title: 'Employee Name',
            dataIndex: 'userId',
            key: 'userId',
            width: 200,
            ellipsis: true,
            onCell: () => ({ style: cellStyle }),
            render: (text: string) => (
              <div
                className="text-sm text-gray-700"
                data-cy="time-attendance-wfh-my-requests-cell-employee"
              >
                <EmployeeNameCell userId={text} />
              </div>
            ),
          },
        ]
      : []),
    {
      title: 'Start Date',
      dataIndex: 'startAt',
      key: 'startAt',
      width: 128,
      onCell: () => ({ style: cellStyle }),
      render: (date: string) => (
        <div
          className={`${rowCellClass} whitespace-nowrap text-gray-900`}
          data-cy="time-attendance-wfh-my-requests-cell-start-date"
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
          data-cy="time-attendance-wfh-my-requests-cell-end-date"
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
      render: (text: number | string) => (
        <div
          className={`${rowCellClass} whitespace-nowrap text-gray-900`}
          data-cy="time-attendance-wfh-my-requests-cell-days"
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
          data-cy="time-attendance-wfh-my-requests-cell-reason"
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
          <Tag
            color={config.color}
            data-cy={`time-attendance-wfh-my-requests-status-${text}`}
          >
            {config.label}
          </Tag>
        );
      },
    },
  ];

  const meta = data?.meta;
  const totalItems =
    meta?.totalItems ?? meta?.total ?? data?.totalItems ?? data?.total ?? 0;

  return (
    <div
      className="bg-white rounded-lg"
      data-cy="time-attendance-wfh-my-requests-container"
    >
      <div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        data-cy="time-attendance-wfh-my-requests-header-row"
      >
        <div
          className="text-sm font-bold text-gray-900 sm:text-xl"
          data-cy="time-attendance-wfh-my-requests-section-title"
        >
          {showAllEmployees ? 'All Employees Requests' : 'My Requests'}
        </div>
        {!showAllEmployees && (
          <Button
            size="large"
            type="primary"
            icon={<FaPlus />}
            className="flex h-10 w-full shrink-0 items-center justify-center sm:w-auto"
            onClick={() => setIsShowWorkFromHomeRequestSidebar(true)}
            data-cy="time-attendance-wfh-my-requests-new-button"
          >
            New Request
          </Button>
        )}
      </div>
      <div
        className="rounded-lg border border-gray-200 sm:overflow-hidden"
        data-cy="time-attendance-wfh-my-requests-table-card"
      >
        <div
          className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          data-cy="time-attendance-wfh-my-requests-table-scroll"
        >
          {isFetching ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              className="[&_.ant-table]:min-w-[920px] [&_.ant-table-thead>tr>th]:whitespace-nowrap [&_.ant-table-tbody>tr>td]:whitespace-nowrap [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.wfh-requests-row-even>td]:!bg-[#FAFAFA] [&_tr.wfh-requests-row-odd>td]:!bg-white"
              columns={columns}
              dataSource={tableData}
              pagination={false}
              scroll={{
                x: showAllEmployees
                  ? ALL_EMPLOYEES_TABLE_SCROLL_X
                  : LEAVE_TABLE_SCROLL_X,
              }}
              locale={{ emptyText: 'No work from home requests' }}
              rowClassName={(unusedRecord, rowIndex) =>
                `cursor-pointer ${
                  rowIndex % 2 === 1
                    ? 'wfh-requests-row-even'
                    : 'wfh-requests-row-odd'
                }`
              }
              onRow={(record) => ({
                onClick: () => openRequestDetail(record),
              })}
              data-cy="time-attendance-wfh-my-requests-table"
            />
          )}
        </div>
        <div
          className="px-4 py-3 border-t border-gray-200"
          data-cy="time-attendance-wfh-my-requests-pagination-row"
        >
          <CustomPagination
            current={page}
            total={totalItems}
            pageSize={limit}
            onChange={(p) => setPage(p)}
            onShowSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            data-cy="time-attendance-wfh-my-requests-pagination"
          />
        </div>
      </div>
    </div>
  );
}
