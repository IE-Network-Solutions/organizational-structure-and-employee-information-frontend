import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import AttendanceTableFilter from './tableFilter';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import usePagination from '@/utils/usePagination';
import { Button } from 'antd';
import { IoLocationOutline } from 'react-icons/io5';
import { IoMdSwitch } from 'react-icons/io';

const AttendanceTable = () => {
  const { userId } = useAuthenticationStore();
  const { setIsShowViewAttendanceSidebar: isShow, setAttendanceData } = useMyTimesheetStore() as any;

  const [filter, setFilter] = useState<Partial<AttendanceRequestBody['filter']>>({
    userIds: [userId ?? ''],
  });

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

  const { data, isFetching } = useGetAttendances(
    { page, limit, orderBy, orderDirection },
    { filter },
  );

  const onFilterChange = (val: any) => {
    if (val) {
      setFilter((prev) => ({
        ...prev,
        date: {
          from: val[0],
          to: val[1],
        },
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        date: undefined,
      }));
    }
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {dayjs(date).format(DATE_FORMAT)}
        </div>
      ),
    },
    {
      title: 'Check In',
      dataIndex: 'startAt',
      key: 'startAt',
      sorter: true,
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm:ss') : '-'}
        </div>
      ),
    },
    {
      title: 'Check Out',
      dataIndex: 'endAt',
      key: 'endAt',
      sorter: true,
      render: (date: string) => (
        <div className="text-sm text-gray-900 py-4">
          {date ? dayjs(date).format('HH:mm:ss') : '-'}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <div className="py-4">
        <Button
            type="link"
          onClick={() => {
              setAttendanceData(record);
              isShow(true);
          }}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const mobilePaginationItemRender = (_: any, type: string, originalElement: React.ReactNode) => {
    if (type === 'prev') {
      return <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50">
        <span className="text-gray-600">&lt;</span>
      </button>;
    }
    if (type === 'next') {
      return <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50">
        <span className="text-gray-600">&gt;</span>
      </button>;
    }
    if (type === 'page') {
      return <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-900">{originalElement}</span>
      </button>;
    }
    return originalElement;
  };

  const CustomPagination = ({ current, total }: { current: number; total: number }) => {
    const totalPages = Math.ceil(total / limit);
    
    const handlePrevPage = () => {
      if (current > 1) {
        setPage(current - 1);
      }
    };

    const handleNextPage = () => {
      if (current < totalPages) {
        setPage(current + 1);
      }
    };

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${current > 1 ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
            onClick={handlePrevPage}
            disabled={current <= 1}
          >
            <span className="text-gray-600">&lt;</span>
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-900">{current}</span>
          </div>
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 ${current < totalPages ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
            onClick={handleNextPage}
            disabled={current >= totalPages}
          >
            <span className="text-gray-600">&gt;</span>
          </button>
        </div>
        <div className="text-sm text-gray-600">{total} Result</div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3 pr-2 bg-white rounded-lg p-2 mx-2">
        <div className="text-lg font-semibold text-gray-900">Leave History</div>
        <div className="flex items-center gap-2">
          <Button
            type="default"
            className="ant-btn css-dev-only-do-not-override-kwtqki ant-btn-default ant-btn-color-default ant-btn-variant-outlined ant-btn-icon-only flex items-center justify-center w-12 h-12 hover:bg-gray-50 border-gray-200"
            icon={<IoMdSwitch size={24} />}
          />
          <AttendanceTableFilter onChange={onFilterChange} />
        </div>
      </div>
      <div className="bg-white rounded-lg p-2 mx-2">
        <Table
          className="mt-0"
          columns={columns}
          loading={isFetching}
          dataSource={data?.items}
          pagination={{
            ...DefaultTablePagination(data?.meta?.totalItems),
            className: "hidden sm:flex items-center justify-start mt-3",
            showSizeChanger: false,
            showTotal: (total: number) => null,
            itemRender: mobilePaginationItemRender,
            simple: true,
            size: "small",
            current: page
          }}
          onChange={(pagination, filters, sorter: any) => {
            setPage(pagination.current ?? 1);
            setLimit(pagination.pageSize ?? 10);
            setOrderDirection(sorter['order']);
            setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
          }}
          scroll={{ x: 'max-content' }}
          size="small"
        />
        <div className="px-4 py-3 sm:hidden">
          <CustomPagination 
            current={page} 
            total={data?.meta?.totalItems ?? 0} 
          />
        </div>
      </div>
    </>
  );
};

export default AttendanceTable;
