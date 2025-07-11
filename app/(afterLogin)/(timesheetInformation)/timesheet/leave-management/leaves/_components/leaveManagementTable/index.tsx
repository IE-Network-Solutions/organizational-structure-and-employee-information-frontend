import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import LeaveManagementTableFilter from './tableFilter';
import { Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { TbFileDownload } from 'react-icons/tb';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { CommonObject } from '@/types/commons/commonObject';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import UserCard from '@/components/common/userCard/userCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { usePathname } from 'next/navigation';
import usePagination from '@/utils/usePagination';
import { Key } from 'react';

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
  const {
    setIsShowLeaveRequestManagementSidebar,
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
  } = useLeaveManagementStore();

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

    if (isLoading) return <div>...</div>;
    if (isError) return <>-</>;
    const fullName = `${employeeData?.firstName || '-'} ${employeeData?.middleName || '-'} ${employeeData?.lastName || '-'}`;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        <div className="mx-1 text-sm">
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>{' '}
        <div className="flex-1">
          <UserCard
            data={employeeData}
            name={fullName}
            email={employeeData?.email}
            profileImage={employeeData?.profileImage}
            size="small"
          />
        </div>
      </div>
    ) : (
      '-'
    );
  };
  const columns: TableColumnsType<any> = [
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'createdBy',
      sorter: true,
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'from',
      dataIndex: 'startAt',
      key: 'startAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'to',
      dataIndex: 'endAt',
      key: 'endAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'total request',
      dataIndex: 'days',
      key: 'days',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'total available',
      dataIndex: 'totalAvailable',
      key: 'totalAvailable',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Requested At',
      dataIndex: 'createdAt',
    },
    {
      title: 'Attachment',
      dataIndex: 'attachment',
      key: 'attachment',
      render: (link: string) =>
        link ? (
          <a
            href={link}
            target="_blank"
            className="flex justify-between align-middle text-gray-900"
          >
            <div>{formatLinkToUploadFile(link).name}</div>
            <TbFileDownload size={14} />
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: LeaveRequestStatus) => (
        <StatusBadge theme={LeaveRequestStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (item: LeaveRequest) => (
        <ActionButtons
          id={item?.id ?? null}
          onDetail={() => {
            setIsShowLeaveRequestManagementSidebar(true);
            setLeaveRequestId(item.id);
            setLeaveRequestWorkflowId(item.approvalWorkflowId);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
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
          attachment: item.justificationDocument,
          status: item.status,
          action: item,
        })),
      );
    }
  }, [data]);

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<LeaveRequestBody['filter']> = {};
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
    if (val.userIds) {
      nFilter['userIds'] = [val.userIds];
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

  return (
    <div className="mt-6">
      <LeaveManagementTableFilter onChange={onFilterChange} />
      <div>
        <div className="flex  overflow-x-auto scrollbar-none  w-full bg-[#fafafa]">
          <Table
            className="mt-6 w-full"
            rowClassName={() => 'h-[60px]'}
            scroll={{ x: 'max-content' }}
            columns={columns}
            dataSource={tableData}
            loading={isFetching}
            rowSelection={{
              checkStrictly: false,
              selectedRowKeys: getCurrentPageSelectedKeys(),
              onChange: handleRowSelection,
            }}
            pagination={false}
            onChange={handleTableChange}
          />
        </div>
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={data?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
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
          />
        )}
      </div>
    </div>
  );
};

export default LeaveManagementTable;
