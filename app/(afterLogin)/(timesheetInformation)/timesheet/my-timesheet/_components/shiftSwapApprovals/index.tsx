'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Popconfirm, Select, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  SWAP_STATUS_LABEL,
  SwapRequestStatus,
  SwapRequestView,
} from '@/types/timesheet/workSchedule';
import {
  useGetMockEmployees,
  useGetSwapRequests,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  useAdminRespondToSwap,
  usePeerRespondToSwap,
} from '@/store/server/features/timesheet/workSchedule/mutation';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';

const EMPTY_SWAPS: SwapRequestView[] = [];
const EMPTY_EMPLOYEES: NonNullable<
  ReturnType<typeof useGetMockEmployees>['data']
> = [];

const STATUS_OPTIONS: Array<{ label: string; value: SwapRequestStatus }> = [
  { label: 'Pending peer', value: 'PENDING_PEER' },
  { label: 'Pending admin', value: 'PENDING_ADMIN' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected by peer', value: 'REJECTED_PEER' },
  { label: 'Rejected by admin', value: 'REJECTED_ADMIN' },
];

const statusColor = (status: SwapRequestStatus) => {
  switch (status) {
    case 'PENDING_PEER':
    case 'PENDING_ADMIN':
      return 'processing';
    case 'APPROVED':
      return 'success';
    case 'REJECTED_PEER':
    case 'REJECTED_ADMIN':
      return 'error';
    default:
      return 'default';
  }
};

const ShiftSwapApprovals = () => {
  const { demoPersonaId } = useWorkScheduleUiStore();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchEmployee, setSearchEmployee] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: swapsData, isLoading } = useGetSwapRequests({});
  const swaps = swapsData ?? EMPTY_SWAPS;
  const { data: employeesData } = useGetMockEmployees();
  const employees = employeesData ?? EMPTY_EMPLOYEES;
  const { mutate: peerRespond, isLoading: isPeerLoading } =
    usePeerRespondToSwap();
  const { mutate: adminRespond, isLoading: isAdminLoading } =
    useAdminRespondToSwap();

  const employeeOptions = useMemo(
    () =>
      employees.map((item) => ({
        value: item.id,
        label: getEmployeeDisplayName(item),
      })),
    [employees],
  );

  const filtered = useMemo(() => {
    return swaps.filter((swap) => {
      if (filterStatus && swap.status !== filterStatus) return false;
      if (
        searchEmployee &&
        swap.requesterId !== searchEmployee &&
        swap.targetUserId !== searchEmployee
      ) {
        return false;
      }
      return true;
    });
  }, [swaps, filterStatus, searchEmployee]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize).map((swap, index) => ({
      key: swap.id,
      index: start + index,
      ...swap,
    }));
  }, [filtered, page, pageSize]);

  const columns = [
    {
      title: 'Requester',
      key: 'requester',
      render: (unusedValue: unknown, record: SwapRequestView) =>
        getEmployeeDisplayName(record.requester),
    },
    {
      title: 'Their Shift',
      key: 'requesterShift',
      render: (unusedValue: unknown, record: SwapRequestView) => (
        <span
          className="text-sm text-[#4d4d4d]"
          data-cy={`time-attendance-swap-approval-requester-shift-${record.id}`}
        >
          {dayjs(record.requesterShift.date).format('MMM D')} ·{' '}
          {formatTimeRange(
            record.requesterShift.startTime,
            record.requesterShift.endTime,
          )}
        </span>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      render: (unusedValue: unknown, record: SwapRequestView) =>
        getEmployeeDisplayName(record.target),
    },
    {
      title: 'Target Shift',
      key: 'targetShift',
      render: (unusedValue: unknown, record: SwapRequestView) => (
        <span
          className="text-sm text-[#4d4d4d]"
          data-cy={`time-attendance-swap-approval-target-shift-${record.id}`}
        >
          {dayjs(record.targetShift.date).format('MMM D')} ·{' '}
          {formatTimeRange(
            record.targetShift.startTime,
            record.targetShift.endTime,
          )}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: SwapRequestStatus) => (
        <Tag color={statusColor(status)} className="!m-0">
          {SWAP_STATUS_LABEL[status]}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (
        unusedValue: unknown,
        record: SwapRequestView & { index: number },
      ) => {
        const canPeerRespond =
          record.status === 'PENDING_PEER' &&
          record.targetUserId === demoPersonaId;
        const canAdminRespond = record.status === 'PENDING_ADMIN';

        if (!canPeerRespond && !canAdminRespond) {
          return (
            <span
              className="text-xs text-gray-400"
              data-cy={`time-attendance-swap-approval-no-action-${record.id}`}
            >
              —
            </span>
          );
        }

        const onAccept = () => {
          if (canPeerRespond) {
            peerRespond({
              id: record.id,
              accept: true,
              actorUserId: demoPersonaId,
            });
            return;
          }
          adminRespond({ id: record.id, accept: true });
        };

        const onReject = () => {
          if (canPeerRespond) {
            peerRespond({
              id: record.id,
              accept: false,
              actorUserId: demoPersonaId,
            });
            return;
          }
          adminRespond({ id: record.id, accept: false });
        };

        return (
          <div
            className="flex gap-2"
            data-cy={`time-attendance-swap-approval-row-${record.index}-actions`}
          >
            <Popconfirm
              title="Approve swap"
              description="Approve this shift swap request?"
              okText="Approve"
              cancelText="Cancel"
              onConfirm={onAccept}
            >
              <Button
                type="primary"
                size="small"
                loading={isPeerLoading || isAdminLoading}
                data-cy={`time-attendance-swap-approval-row-${record.index}-approve`}
              >
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject swap"
              description="Reject this shift swap request?"
              okText="Reject"
              cancelText="Cancel"
              onConfirm={onReject}
            >
              <Button
                danger
                size="small"
                loading={isPeerLoading || isAdminLoading}
                data-cy={`time-attendance-swap-approval-row-${record.index}-reject`}
              >
                Reject
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <Card
      id="time-attendance-swap-approval-card"
      data-cy="time-attendance-swap-approval-card"
      className="border-gray-300"
      bodyStyle={{ padding: '0', paddingTop: 16 }}
    >
      <div
        className="mb-3 mx-3 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-center min-[400px]:justify-between"
        data-cy="time-attendance-swap-approval-toolbar"
      >
        <Select
          placeholder="Search Employee"
          showSearch
          allowClear
          options={employeeOptions}
          value={searchEmployee || undefined}
          onChange={(value) => {
            setSearchEmployee(value ?? '');
            setPage(1);
          }}
          filterOption={(input, option) =>
            (option?.label ?? '')
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          className="h-8 w-full min-w-0 min-[400px]:min-w-[88px] min-[400px]:flex-1 md:flex-none md:w-[280px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8"
          data-cy="time-attendance-swap-approval-search-employee"
        />
        <Select
          placeholder="Filter by status"
          allowClear
          options={STATUS_OPTIONS}
          value={filterStatus || undefined}
          onChange={(value) => {
            setFilterStatus(value ?? '');
            setPage(1);
          }}
          className="h-8 w-full min-w-0 min-[400px]:w-[180px] [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8"
          data-cy="time-attendance-swap-approval-filter-status"
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} />
      ) : (
        <Table
          columns={columns}
          dataSource={pageItems}
          pagination={false}
          scroll={{ x: 960 }}
          locale={{ emptyText: 'No shift swap approvals' }}
          className="mx-3 [&_.ant-table-thead>tr>th]:bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-thead>tr>th]:text-base [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_tr.my-timesheet-approval-table-row-even>td]:!bg-[#FAFAFA] [&_tr.my-timesheet-approval-table-row-odd>td]:!bg-white"
          rowClassName={(unusedRow, index) =>
            index % 2 === 1
              ? 'my-timesheet-approval-table-row-even'
              : 'my-timesheet-approval-table-row-odd'
          }
          data-cy="time-attendance-swap-approval-table"
        />
      )}

      <div className="mx-3" data-cy="time-attendance-swap-approval-pagination">
        <CustomPagination
          current={page}
          total={filtered.length}
          pageSize={pageSize}
          onChange={(nextPage) => setPage(nextPage)}
          onShowSizeChange={(nextSize) => {
            setPageSize(nextSize);
            setPage(1);
          }}
        />
      </div>
    </Card>
  );
};

export default ShiftSwapApprovals;
