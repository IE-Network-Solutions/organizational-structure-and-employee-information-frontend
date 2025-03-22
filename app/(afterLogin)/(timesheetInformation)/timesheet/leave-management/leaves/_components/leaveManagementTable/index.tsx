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
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useDeleteLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import UserCard from '@/components/common/userCard/userCard';

interface LeaveManagementTableProps {
  setBodyRequest: Dispatch<SetStateAction<LeaveRequestBody>>;
}

const LeaveManagementTable: FC<LeaveManagementTableProps> = ({
  setBodyRequest,
}) => {
  const {
    setIsShowLeaveRequestManagementSidebar,
    setLeaveRequestId,
    setLeaveRequestWorkflowId,
  } = useLeaveManagementStore();
  const { setIsShowLeaveRequestSidebar: isShow, setLeaveRequestSidebarData } =
    useMyTimesheetStore();
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
  const [filter, setFilter] = useState<Partial<LeaveRequestBody['filter']>>({});
  const { data, isFetching } = useGetLeaveRequest(
    { page, limit, orderBy, orderDirection },
    { filter },
  );
  const { mutate: deleteLeaveRequest } = useDeleteLeaveRequest();

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
          {/* <div className="text-[10px] leading-4 text-gray-600">
            {employeeData?.email}
          </div> */}
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
      title: 'total',
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
          disableDelete={
            item.status === LeaveRequestStatus.APPROVED ||
            item.status === LeaveRequestStatus.DECLINED
          }
          disableEdit={
            item.status === LeaveRequestStatus.APPROVED ||
            item.status === LeaveRequestStatus.DECLINED
          }
          onEdit={() => {
            isShow(true);
            setLeaveRequestSidebarData(item.id);
          }}
          onDelete={() => {
            deleteLeaveRequest(item.id);
          }}
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
          leaveType: item.leaveType
            ? typeof item.leaveType === 'string'
              ? ''
              : item.leaveType.title
            : '-',
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

  return (
    <div className="mt-6">
      <LeaveManagementTableFilter onChange={onFilterChange} />

      <Table
        className="mt-6"
        columns={columns}
        dataSource={tableData}
        loading={isFetching}
        rowSelection={{ checkStrictly: false }}
        pagination={defaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
      />
    </div>
  );
};

export default LeaveManagementTable;
