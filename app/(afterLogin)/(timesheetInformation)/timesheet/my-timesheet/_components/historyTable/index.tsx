import React, { useEffect, useState } from 'react';
import HistoryTableFilter from './tableFilter/inedx';
import { TableColumnsType } from '@/types/table/table';
import { Button, Table } from 'antd';
import { TbFileDownload } from 'react-icons/tb';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import {
  useGetLeaveRequest,
  useGetSingleApproval,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { CommonObject } from '@/types/commons/commonObject';
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveRequestStatusBadgeTheme,
} from '@/types/timesheet/settings';
import { DATE_FORMAT } from '@/utils/constants';
import dayjs from 'dayjs';
import { useDeleteLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { AiOutlineReload } from 'react-icons/ai';
import { LuPlus } from 'react-icons/lu';
import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import NotificationMessage from '@/components/common/notification/notificationMessage';

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
  const { data, isFetching, refetch } = useGetLeaveRequest(
    { page, limit, orderBy, orderDirection },
    { filter },
  );
  const { mutate: deleteLeaveRequest } = useDeleteLeaveRequest();
  const { data: approverLog } = useGetSingleApproval(
    leaveRequestSidebarData ?? '',
  );
  useEffect(() => {
    if (isLoading && approverLog) {
      if (approverLog?.items?.length > 0) {
        NotificationMessage.warning({
          message: `The Approval Process has been begin you can't continue to edit the leave request`,
        });
      } else {
        isShow(true);
      }
      setIsLoading(false);
    }
  }, [approverLog, isLoading, leaveRequestSidebarData]);
  useEffect(() => {
    if (data && data.items) {
      setTableData(() =>
        data.items.map((item) => ({
          key: item.id,
          startAt: item.startAt,
          endAt: item.endAt,
          days: item.days,
          leaveType: item.leaveType
            ? typeof item.leaveType === 'string'
              ? ''
              : item.leaveType.title
            : '-',
          justificationDocument: item.justificationDocument,
          status: item.status,
          action: item,
        })),
      );
    }
  }, [data]);

  const columns: TableColumnsType<any> = [
    {
      title: 'From',
      dataIndex: 'startAt',
      key: 'startAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'To',
      dataIndex: 'endAt',
      key: 'endAt',
      sorter: true,
      render: (date: string) => <div>{dayjs(date).format(DATE_FORMAT)}</div>,
    },
    {
      title: 'Total',
      dataIndex: 'days',
      key: 'days',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Attachment',
      dataIndex: 'justificationDocument',
      key: 'justificationDocument',
      sorter: true,
      render: (link: string) =>
        link ? (
          <a
            href={link}
            target="_blank"
            className="flex justify-between items-center text-gray-900"
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
        // <AccessGuard
        //   permissions={[
        //     Permissions.UpdateLeaveRequest,
        //     Permissions.DeleteLeaveRequest,
        //   ]}
        // >
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
            setLeaveRequestSidebarData(item.id);
            setIsLoading(true);
          }}
          onDelete={() => {
            deleteLeaveRequest(item.id);
          }}
          onDetail={() => {
            isShowDetail(true);
            setLeaveRequestSidebarData(item.id);
            setLeaveRequestSidebarWorkflowData(item.approvalWorkflowId);
          }}
        />
        // </AccessGuard>
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
      nFilter['leaveTypeIds'] = [val.type];
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
          <div className="text-2xl font-bold text-gray-900">My Leave</div>
          <Button
            type="text"
            size="small"
            icon={<AiOutlineReload size={14} className="text-gray-600" />}
            onClick={() => {
              refetch();
            }}
          ></Button>
        </div>
        <AccessGuard permissions={[Permissions.SubmitLeaveRequest]}>
          <Button
            size="large"
            type="primary"
            icon={<LuPlus size={16} />}
            className="h-12"
            onClick={() => isShow(true)}
          >
            Add New Request
          </Button>
        </AccessGuard>
      </div>
      <HistoryTableFilter onChange={onFilterChange} />
      <Table
        className="mt-6"
        columns={columns}
        loading={isFetching}
        dataSource={tableData}
        pagination={DefaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
        scroll={{ x: 'min-content' }}
      />
    </>
  );
};

export default HistoryTable;
