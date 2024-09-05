import React, { useEffect, useState } from 'react';
import HistoryTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Space, Table } from 'antd';
import { TbFileDownload } from 'react-icons/tb';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { CommonObject } from '@/types/commons/commonObject';
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { DATE_FORMAT, localUserID } from '@/utils/constants';
import dayjs from 'dayjs';
import { useDeleteLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { AiOutlineReload } from 'react-icons/ai';
import { LuPlus } from 'react-icons/lu';

const HistoryTable = () => {
  const userFilter: Partial<LeaveRequestBody['filter']> = {
    userIds: [localUserID ?? ''],
  };
  const { setIsShowLeaveRequestSidebar: isShow, setLeaveRequestSidebarData } =
    useMyTimesheetStore();
  const [tableData, setTableData] = useState<any[]>([]);
  // const [page, setPage] = useState('1');
  const page = '1';
  const [filter, setFilter] =
    useState<Partial<LeaveRequestBody['filter']>>(userFilter);
  const { data, isFetching, refetch } = useGetLeaveRequest(
    { page, limit: '20' },
    { filter },
  );
  const { mutate: deleteLeaveRequest } = useDeleteLeaveRequest();

  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
          from: item.startAt,
          to: item.endAt,
          total: item.days,
          type: typeof item.leaveType === 'string' ? '' : item.leaveType.title,
          attachment: item.justificationDocument,
          status: item.status,
          action: item,
        })),
      );
    }
  }, [data]);

  const columns: TableColumnsType<any> = [
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Attachment',
      dataIndex: 'attachment',
      key: 'attachment',
      render: (text: string) => (
        <div className="flex justify-between align-middle">
          <div>{text}</div>
          <TbFileDownload size={14} />
        </div>
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
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (item: LeaveRequest) =>
        item.status !== LeaveRequestStatus.APPROVED && (
          <Space size={10}>
            <Button
              className="w-[30px] h-[30px]"
              icon={<FiEdit2 size={16} />}
              type="primary"
              onClick={() => {
                isShow(true);
                setLeaveRequestSidebarData(item.id);
              }}
            />

            <Button
              className="w-[30px] h-[30px]"
              danger
              icon={<FiTrash2 size={16} />}
              type="primary"
              onClick={() => {
                deleteLeaveRequest(item.id);
              }}
            />
          </Space>
        ),
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
      nFilter['leaveTypesIds'] = [val.type];
    }

    if (val.status) {
      nFilter['status'] = val.status;
    }

    setFilter(nFilter);
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <div className="flex-1 flex items-center gap-0.5">
          <div className="text-2xl font-bold text-gray-900">Leave History</div>
          <Button
            type="text"
            size="small"
            icon={<AiOutlineReload size={14} className="text-gray-600" />}
            onClick={() => {
              refetch();
            }}
          ></Button>
        </div>

        <Button
          size="large"
          type="primary"
          icon={<LuPlus size={16} />}
          className="h-12"
          onClick={() => isShow(true)}
        >
          Add New Request
        </Button>
      </div>
      <HistoryTableFilter onChange={onFilterChange} />
      <Table
        className="mt-6"
        columns={columns}
        loading={isFetching}
        dataSource={tableData}
        pagination={{ position: ['none', 'bottomLeft'] }}
      />
    </>
  );
};

export default HistoryTable;
