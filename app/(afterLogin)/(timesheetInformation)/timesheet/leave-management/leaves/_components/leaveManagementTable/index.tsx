import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import LeaveManagementTableFilter from './tableFilter';
import { Skeleton, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import LeaveRequestStatusTag from '../LeaveRequestStatusTag';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import UserCard from '@/components/common/userCard/userCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';
import { Key } from 'react';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';

interface LeaveManagementTableProps {
  setBodyRequest: Dispatch<SetStateAction<LeaveRequestBody>>;
  selectedRowKeys?: Key[];
  setSelectedRowKeys?: (keys: Key[]) => void;
}

const LeaveManagementTable: FC<LeaveManagementTableProps> = ({
  setBodyRequest,
  selectedRowKeys,
  setSelectedRowKeys,
}) => {
  const { orderBy, orderDirection, setOrderBy, setOrderDirection } =
    usePagination(1, 10);
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = useMyTimesheetStore();

  const pathname = usePathname();
  const {
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
    setIsShowLeaveRequestManagementSidebar,
  } = useLeaveManagementStore();

  useEffect(() => {
    resetPagination();
  }, [pathname]);

  const handleTableChange = (pagination: any, sorter: any) => {
    setCurrentPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
    setOrderDirection(sorter['order']);
    setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
  };
  const [tableData, setTableData] = useState<any[]>([]);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const [filter, setFilter] = useState<Partial<LeaveRequestBody['filter']>>({});
  const { data, isFetching } = useGetLeaveRequest(
    { page: currentPage, limit: pageSize, orderBy, orderDirection },
    { filter },
  );

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
          id={`time-attendance-leave-management-row-employee-loading-${userId}`}
          data-cy={`time-attendance-leave-management-row-employee-loading-${userId}`}
        >
          ...
        </div>
      );
    if (isError) return <>-</>;
    const fullName = `${employeeData?.firstName || '-'} ${employeeData?.middleName || '-'} ${employeeData?.lastName || '-'}`;

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        id={`time-attendance-leave-management-row-employee-${userId}`}
        data-cy={`time-attendance-leave-management-row-employee-${userId}`}
      >
        <div
          className="flex-1"
          id={`time-attendance-leave-management-row-employee-${userId}-card`}
          data-cy={`time-attendance-leave-management-row-employee-${userId}-card`}
        >
          <UserCard
            data-cy="time-attendance-leave-management-row-employee-card"
            data={employeeData}
            name={fullName}
            profileImage={employeeData?.profileImage}
            size="small"
            nameClassName="text-sm text-gray-700"
          />
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
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-employee-name"
        >
          Employee Name
        </span>
      ),
      dataIndex: 'userId',
      key: 'createdBy',
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          data-cy="time-attendance-leave-management-cell-employee"
        >
          <EmpRender userId={text} />
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-type"
        >
          Type
        </span>
      ),
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          id={`time-attendance-leave-management-row-type-${text || 'unknown'}`}
          data-cy={`time-attendance-leave-management-row-type-${text || 'unknown'}`}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-from"
        >
          From
        </span>
      ),
      dataIndex: 'startAt',
      key: 'startAt',
      render: (date: string) => (
        <div
          className="text-sm text-gray-700"
          id={`time-attendance-leave-management-row-start-${date}`}
          data-cy={`time-attendance-leave-management-row-start-${date}`}
        >
          {date ? dayjs(date).format(DATE_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-to"
        >
          To
        </span>
      ),
      dataIndex: 'endAt',
      key: 'endAt',
      render: (date: string) => (
        <div
          className="text-sm text-gray-700"
          id={`time-attendance-leave-management-row-end-${date}`}
          data-cy={`time-attendance-leave-management-row-end-${date}`}
        >
          {date ? dayjs(date).format(DATE_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-total-days"
        >
          Total Days
        </span>
      ),
      dataIndex: 'days',
      key: 'days',
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          id={`time-attendance-leave-management-row-days-${text}`}
          data-cy={`time-attendance-leave-management-row-days-${text}`}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-status"
        >
          Status
        </span>
      ),
      dataIndex: 'status',
      key: 'status',
      className: 'text-base',
      render: (text: LeaveRequestStatus) => (
        <div
          className="text-sm text-gray-700"
          id={`time-attendance-leave-management-row-status-${text}`}
          data-cy={`time-attendance-leave-management-row-status-${text}`}
        >
          <LeaveRequestStatusTag
            status={text}
            dataCy="time-attendance-leave-management-row-status-badge"
          />
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-available"
        >
          Available
        </span>
      ),
      dataIndex: 'totalAvailable',
      key: 'totalAvailable',
      className: 'text-base',
      render: (text: string) => (
        <div
          className="text-base"
          id={`time-attendance-leave-management-row-total-available-${text}`}
          data-cy={`time-attendance-leave-management-row-total-available-${text}`}
        >
          {text}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="time-attendance-leave-management-column-title-requested-at"
        >
          Requested At
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-base',
      render: (date: string) => (
        <div
          className="text-base"
          data-cy="time-attendance-leave-management-cell-requested-at"
        >
          {date ? dayjs(date).format(DATE_FORMAT) : '-'}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
          id: item.id,
          approvalWorkflowId: item.approvalWorkflowId ?? null,
          userId: item.userId,
          createdBy: item.createdBy,
          startAt: item.startAt,
          endAt: item.endAt,
          days: item.days,
          createdAt: item?.createdAt
            ? dayjs(item?.createdAt)?.format('YYYY-MM-DD')
            : '-',

          leaveType: item.leaveType
            ? typeof item.leaveType === 'string'
              ? ''
              : item.leaveType.title
            : '-',
          totalAvailable: item.leaveType?.leaveBalance?.[0]?.balance || '-',
          status: item.status,
        })),
      );
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<LeaveRequestBody['filter']> = {};
    const dateFrom = val.dateRange?.[0] ?? val.dateFrom;
    const dateTo = val.dateRange?.[1] ?? val.dateTo;
    if (dateFrom || dateTo) {
      nFilter['date'] = {
        from: dateFrom ?? dateTo,
        to: dateTo ?? dateFrom,
      };
    }

    if (val.type) {
      nFilter['leaveTypeIds'] = [val.type];
    }

    if (val.status) {
      nFilter['status'] = val.status;
    }
    const userIdsFilter = val.searchEmployee ?? val.userIds;
    if (userIdsFilter) {
      nFilter['userIds'] = Array.isArray(userIdsFilter)
        ? userIdsFilter
        : [userIdsFilter];
    }

    setFilter(nFilter);

    setBodyRequest((prev) => ({
      ...prev,
      filter: nFilter,
    }));
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

  const skeletonRowCount = pageSize > 0 ? Math.min(pageSize, 8) : 6;
  const tableDataSource = isFetching
    ? Array.from({ length: skeletonRowCount }).map((notUsed, index) => ({
        key: `skeleton-${index}`,
      }))
    : tableData;

  const tableColumns = isFetching
    ? (columns.map((column: any) => ({
        ...column,
        sorter: false,
        render: () => <Skeleton.Input active className="!h-5 !w-full" />,
      })) as any)
    : columns;

  return (
    <div
      className="mt-6 bg-white rounded-lg border border-gray-100 overflow-hidden"
      id="time-attendance-leave-management-table-wrapper"
      data-cy="time-attendance-leave-management-table-wrapper"
    >
      <div
        className="px-4 py-4 border-b border-gray-100 bg-white"
        id="time-attendance-leave-management-table-toolbar"
        data-cy="time-attendance-leave-management-table-toolbar"
      >
        <LeaveManagementTableFilter
          data-cy="time-attendance-leave-management-table-filter"
          onChange={onFilterChange}
        />
      </div>
      <div
        className="px-4 pb-4"
        id="time-attendance-leave-management-table-container"
        data-cy="time-attendance-leave-management-table-container"
      >
        <div
          className="leave-management-table flex overflow-x-auto scrollbar-none w-full bg-white rounded-b-lg"
          id="time-attendance-leave-management-table-scroll-wrapper"
          data-cy="time-attendance-leave-management-table-scroll-wrapper"
        >
          <Table
            className="w-full [&_.ant-table-thead_.ant-table-cell]:font-semibold"
            rowClassName={() =>
              isFetching ? 'h-[60px]' : 'h-[60px] cursor-pointer'
            }
            scroll={{ x: 'max-content' }}
            columns={tableColumns}
            dataSource={tableDataSource}
            onRow={
              isFetching
                ? undefined
                : (record) => ({
                    onClick: (e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('.ant-checkbox-wrapper')) return;
                      if (record.id && record.approvalWorkflowId) {
                        setLeaveRequestId(record.id);
                        setLeaveRequestWorkflowId(record.approvalWorkflowId);
                        setIsShowLeaveRequestManagementSidebar(true);
                      }
                    },
                  })
            }
            rowSelection={
              isFetching
                ? undefined
                : {
                    checkStrictly: false,
                    selectedRowKeys: getCurrentPageSelectedKeys(),
                    onChange: handleRowSelection,
                  }
            }
            pagination={false}
            onChange={handleTableChange}
            id="time-attendance-leave-management-table"
            data-cy="time-attendance-leave-management-table"
          />
        </div>
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="time-attendance-leave-management-table-mobile-pagination"
            totalResults={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="time-attendance-leave-management-table-pagination"
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

export default LeaveManagementTable;
