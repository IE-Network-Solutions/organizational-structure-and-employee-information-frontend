import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { Avatar, Button, Space, Table } from 'antd';

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
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import dayjs from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from '@/utils/constants';
import {
  AttendanceRecord,
  AttendanceRecordTypeBadgeTheme,
} from '@/types/timesheet/attendance';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { CommonObject } from '@/types/commons/commonObject';
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { FiEdit2 } from 'react-icons/fi';
import { EmployeeAttendance } from '@/types/timesheet/employeeAttendance';

interface EmployeeAttendanceTableProps {
  setBodyRequest: Dispatch<SetStateAction<AttendanceRequestBody>>;
  isImport: boolean;
}

const EmployeeAttendanceTable: FC<EmployeeAttendanceTableProps> = ({
  setBodyRequest,
  isImport,
}) => {
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
  const {
    setEmployeeId,
    setIsShowEmployeeAttendanceSidebar,
    setEmployeeAttendanceId,
  } = useEmployeeAttendanceStore();
  const [filter, setFilter] =
    useState<Partial<AttendanceRequestBody['filter']>>();
  const { data, isFetching, refetch } = useGetAttendances(
    { page, limit, orderBy, orderDirection },
    { filter },
  );
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading) return <div>...</div>;
    if (isError) return <>-</>;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        <div className="mx-1 text-sm">
          {employeeData?.employeeInformation?.employeeAttendanceId}
        </div>
        <Avatar size={24} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="text-xs text-gray-900 flex gap-2">
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
          <div className="text-[10px] leading-4 text-gray-600">
            {employeeData?.email}
          </div>
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
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockIn',
      key: 'clockIn',
      render: (date: string) => (
        <div>
          {date ? dayjs(date, 'YYYY-MM-DD HH:mm').format(DATETIME_FORMAT) : '-'}
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOut',
      key: 'clockOut',
      render: (date: string) => (
        <div>
          {date ? dayjs(date, 'YYYY-MM-DD HH:mm').format(DATETIME_FORMAT) : '-'}
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
          <Space>
            {statuses.map((status) => (
              <StatusBadge
                theme={AttendanceRecordTypeBadgeTheme[status.status]}
                key={status.status}
              >
                <div className="text-center">
                  <div>{status.status}</div>
                  {status.text && (
                    <div className="font-normal">{status.text}</div>
                  )}
                </div>
              </StatusBadge>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Over-time',
      dataIndex: 'overTime',
      key: 'overTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Total time',
      dataIndex: 'totalTime',
      key: 'totalTime',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (item: EmployeeAttendance) => {
        return (
          <Button
            className="w-[30px] h-[30px]"
            icon={<FiEdit2 size={16} />}
            id={`${item?.id}buttonPopOverActionForOnEditActionId`}
            type="primary"
            onClick={() => {
              setEmployeeId(item?.userId), setEmployeeAttendanceId(item?.id);
              setIsShowEmployeeAttendanceSidebar(true);
            }}
          />
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
      const sortedItems = [...data.items].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      const nData = sortedItems.map((item) => {
        const calcTotal = calculateAttendanceRecordToTotalWorkTime(item);
        return {
          key: item.id,
          userId: item.userId,
          createdBy: item.createdBy,
          createdAt: item.createdAt,
          clockIn: item.startAt,
          clockOut: item.endAt,
          status: item,
          totalTime:
            item.startAt &&
            item.endAt &&
            `${timeToHour(calcTotal)}:${timeToLastMinute(calcTotal)} hrs`,
          overTime: `${timeToHour(item.overTimeMinutes)}:${timeToLastMinute(item.overTimeMinutes)} hrs`,
          action: item,
        };
      });
  
      setTableData(nData);
    }
  }, [data]);
  

  const onFilterChange = (val: CommonObject) => {
    const nFilter: Partial<AttendanceRequestBody['filter']> = {};
    if (val.date) {
      nFilter['date'] = {
        from: val.date[0],
        to: val.date[1],
      };
    }

    if (val.type) {
      nFilter['type'] = val.type;
    }

    setFilter(nFilter);
    setBodyRequest((prev) => ({
      ...prev,
      filter: nFilter,
    }));
  };

  return (
    <>
      <div className="mb-6">
        <TableFilter onChange={onFilterChange} />
      </div>
      <Table
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        rowSelection={{ checkStrictly: false }}
        pagination={defaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
      />
    </>
  );
};

export default EmployeeAttendanceTable;
