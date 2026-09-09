'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { FaPlus } from 'react-icons/fa';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetAllUsers,
  useGetEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetWorkSchedule, useGetWorkScheduleShifts, useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useAllApproval } from '@/store/server/features/approver/queries';
import {
  useGetMySchedule,
  useGetShiftSwapPeerPending,
  useGetShiftSwapRequests,
} from '@/store/server/features/timesheet/shiftSwap/queries';
import {
  useCancelShiftSwapRequest,
  useCreateShiftSwapRequest,
  usePeerApproveShiftSwap,
  usePeerRejectShiftSwap,
} from '@/store/server/features/timesheet/shiftSwap/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TableSkeleton } from '@/components/tableSkeleton';

dayjs.extend(isoWeek);

const STATUS_COLORS: Record<string, string> = {
  PENDING_PEER: 'orange',
  PEER_APPROVED: 'cyan',
  PENDING_APPROVAL: 'gold',
  APPROVED: 'blue',
  COMPLETED: 'green',
  PEER_REJECTED: 'red',
  APPROVAL_REJECTED: 'red',
  CANCELLED: 'default',
};

type SwapTabKey = 'pending' | 'approved' | 'rejected';

const PENDING_STATUSES = [
  'PENDING_PEER',
  'PEER_APPROVED',
  'PENDING_APPROVAL',
];
const APPROVED_STATUSES = ['APPROVED', 'COMPLETED'];
const REJECTED_STATUSES = [
  'PEER_REJECTED',
  'APPROVAL_REJECTED',
  'CANCELLED',
];

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  return `${start || '--'} - ${end || '--'}`;
}

function personName(user: any) {
  if (!user) return '';
  return [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(' ');
}

function isScheduleWorkingDay(detail: any[] | undefined, dayName: string) {
  if (!detail?.length) {
    // Without detail, do not invent weekend coverage from applyToAllDays.
    return false;
  }
  const day = detail.find(
    (d) =>
      String(d?.dayOfWeek ?? d?.day ?? '').toLowerCase() ===
      dayName.toLowerCase(),
  );
  if (!day) return false;
  if (typeof day.workDay === 'boolean') return day.workDay;
  if (typeof day.status === 'boolean') return day.status;
  return !!(day.startTime && day.endTime);
}

function unwrapShiftList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.shifts)) return data.shifts;
  if (data.item && typeof data.item === 'object') {
    const item = data.item as Record<string, unknown>;
    if (Array.isArray(item.shifts)) return item.shifts;
    if (Array.isArray(item.items)) return item.items;
  }
  return [];
}

function isShiftMarkedSwappable(shift: any): boolean {
  return (
    shift?.isSwappable === true ||
    shift?.isSwappable === 'true' ||
    shift?.isSwappable === 1
  );
}

export default function MySchedulePage() {
  const { userId } = useAuthenticationStore();
  const [weekStart, setWeekStart] = useState<Dayjs>(() =>
    dayjs().startOf('isoWeek'),
  );
  const [swapTab, setSwapTab] = useState<SwapTabKey>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const from = weekStart.format('YYYY-MM-DD');
  const to = weekStart.add(6, 'day').format('YYYY-MM-DD');
  const weekEnd = weekStart.add(6, 'day');

  const { data: employeeData } = useGetEmployee(userId ?? '');
  const { data: allUsers } = useGetAllUsers();
  const { data: workSchedules } = useGetWorkSchedules();
  const activeJob = employeeData?.employeeJobInformation?.find(
    (j: any) => j.isPositionActive,
  );
  const myScheduleId = activeJob?.workScheduleId;
  const { data: workScheduleById } = useGetWorkSchedule(myScheduleId ?? '');
  const { data: scheduleShiftsResponse } = useGetWorkScheduleShifts(
    myScheduleId ?? '',
  );
  const { data: scheduleData, isLoading: isScheduleLoading } = useGetMySchedule(
    userId ?? '',
    from,
    to,
  );

  const mySchedule =
    workScheduleById?.item ??
    workScheduleById ??
    workSchedules?.items?.find((s) => s.id === myScheduleId) ??
    activeJob?.workSchedule;

  const myAssignedShiftId =
    activeJob?.workScheduleShiftId ||
    activeJob?.workScheduleShift?.id ||
    null;

  // Prefer dedicated shifts API; fall back to nested schedule / job payload
  const scheduleShifts = (() => {
    const fromApi = unwrapShiftList(scheduleShiftsResponse);
    if (fromApi.length) return fromApi;
    const nested = unwrapShiftList(mySchedule?.shifts);
    if (nested.length) return nested;
    return unwrapShiftList(activeJob?.workSchedule?.shifts);
  })();

  // Target = shift to swap INTO (not the one you already have).
  // Show all other schedule shifts; backend still enforces isSwappable.
  const swappableShifts = scheduleShifts.filter(
    (s: any) => s?.id && s.id !== myAssignedShiftId,
  );

  const targetShiftPlaceholder = !scheduleShifts.length
    ? 'No shifts found on your schedule'
    : !swappableShifts.length
      ? 'No other shift to swap into on this schedule'
      : 'Select shift you want';

  const employeeDisplayName =
    personName(employeeData) ||
    [employeeData?.firstName, employeeData?.lastName].filter(Boolean).join(' ') ||
    'Employee';
  const employeeRole =
    activeJob?.position?.name ||
    activeJob?.jobPosition?.name ||
    activeJob?.employementType?.name ||
    '';

  const departmentId =
    activeJob?.departmentId ||
    employeeData?.employeeJobInformation?.[0]?.departmentId ||
    '';

  const { data: approvalDepartmentData, refetch: getDepartmentApproval } =
    useAllApproval(departmentId, 'ShiftSwap');
  const { data: approvalUserData, refetch: getUserApproval } = useAllApproval(
    userId || '',
    'ShiftSwap',
  );

  // useAllApproval is disabled by default; refetch like Leave/WFH request forms
  useEffect(() => {
    if (departmentId) {
      getDepartmentApproval();
    }
  }, [departmentId, getDepartmentApproval]);

  useEffect(() => {
    if (userId) {
      getUserApproval();
    }
  }, [userId, getUserApproval]);

  const { data: myRequests, isLoading: isRequestsLoading } =
    useGetShiftSwapRequests(
      { page: '1', limit: '100' },
      { filter: { userIds: userId ? [userId] : [] } },
      !!userId,
    );

  const { data: peerPending } = useGetShiftSwapPeerPending(
    userId ?? '',
    1,
    20,
    !!userId,
  );

  const { mutate: createRequest, isLoading: isCreating } =
    useCreateShiftSwapRequest();
  const { mutate: peerApprove, isLoading: isPeerApproving } =
    usePeerApproveShiftSwap();
  const { mutate: peerReject, isLoading: isPeerRejecting } =
    usePeerRejectShiftSwap();
  const { mutate: cancelRequest } = useCancelShiftSwapRequest();

  const peerOptions = useMemo(
    () =>
      (allUsers?.items ?? [])
        .filter((u: any) => u.id !== userId)
        .map((u: any) => ({
          value: u.id,
          label: personName(u),
        })),
    [allUsers?.items, userId],
  );

  const requestItems = (
    Array.isArray(myRequests?.items)
      ? myRequests.items
      : Array.isArray(myRequests?.data)
        ? myRequests.data
        : Array.isArray(myRequests)
          ? myRequests
          : []
  ).filter((r: any) => !!userId && r.requesterUserId === userId);
  const peerItems = Array.isArray(peerPending?.items)
    ? peerPending.items
    : Array.isArray(peerPending?.data)
      ? peerPending.data
      : Array.isArray(peerPending)
        ? peerPending
        : [];

  const pendingCount = requestItems.filter((r: any) =>
    PENDING_STATUSES.includes(r.status),
  ).length;
  const approvedCount = requestItems.filter((r: any) =>
    APPROVED_STATUSES.includes(r.status),
  ).length;
  const rejectedCount = requestItems.filter((r: any) =>
    REJECTED_STATUSES.includes(r.status),
  ).length;

  const filteredRequests = useMemo(() => {
    const statuses =
      swapTab === 'pending'
        ? PENDING_STATUSES
        : swapTab === 'approved'
          ? APPROVED_STATUSES
          : REJECTED_STATUSES;
    return requestItems.filter((r: any) => statuses.includes(r.status));
  }, [requestItems, swapTab]);

  const myAssignedShift =
    activeJob?.workScheduleShift ||
    scheduleShifts.find((s: any) => s.id === myAssignedShiftId) ||
    null;

  const days = useMemo(() => {
    const list = Array.isArray(scheduleData)
      ? scheduleData
      : Array.isArray((scheduleData as any)?.days)
        ? (scheduleData as any).days
        : Array.isArray((scheduleData as any)?.items)
          ? (scheduleData as any).items
          : [];
    const byDate = new Map(
      list.map((d: any) => [dayjs(d.date).format('YYYY-MM-DD'), d]),
    );
    const scheduleDetail = mySchedule?.detail ?? [];
    const hasScheduleDetail = scheduleDetail.length > 0;

    const shiftAppliesToWeekday = (shift: any, dayName: string) => {
      if (!shift) return false;
      if (shift.applyToAllDays !== false) return true;
      return (shift.days || []).some(
        (d: any) =>
          String(d?.dayOfWeek ?? d?.day ?? d).toLowerCase() ===
          dayName.toLowerCase(),
      );
    };

    return Array.from({ length: 7 }, (_, i) => {
      const date = weekStart.add(i, 'day');
      const key = date.format('YYYY-MM-DD');
      const entry = byDate.get(key) as any;
      const dayName = date.format('dddd');
      const isWorkingDay = hasScheduleDetail
        ? isScheduleWorkingDay(scheduleDetail, dayName)
        : !!(entry?.startTime || entry?.shiftName || entry?.isOverride);

      // Approved swap override wins on any day
      if (entry?.isOverride && (entry?.shiftName || entry?.startTime)) {
        return {
          date,
          entry,
          cards: [
            {
              name: entry.shiftName || 'Shift',
              startTime: entry.startTime,
              endTime: entry.endTime,
              isOverride: true,
            },
          ],
        };
      }

      if (!isWorkingDay) {
        return { date, entry, cards: [] };
      }

      // Prefer server-resolved effective shift (assigned / override)
      if (entry?.shiftName || entry?.startTime) {
        return {
          date,
          entry,
          cards: [
            {
              name: entry.shiftName || 'Shift',
              startTime: entry.startTime,
              endTime: entry.endTime,
              isOverride: !!entry.isOverride,
            },
          ],
        };
      }

      // Fallback: employee's assigned shift only (not every shift on the schedule)
      if (myAssignedShift && shiftAppliesToWeekday(myAssignedShift, dayName)) {
        return {
          date,
          entry,
          cards: [
            {
              name: myAssignedShift.name || 'Shift',
              startTime: myAssignedShift.startTime,
              endTime: myAssignedShift.endTime,
              isOverride: false,
            },
          ],
        };
      }

      // No assignment: show schedule shifts that apply to this weekday
      if (!myAssignedShiftId) {
        const templateShifts = scheduleShifts.filter((shift: any) =>
          shiftAppliesToWeekday(shift, dayName),
        );
        if (templateShifts.length > 0) {
          return {
            date,
            entry,
            cards: templateShifts.map((s: any) => ({
              name: s.name,
              startTime: s.startTime,
              endTime: s.endTime,
              isOverride: false,
            })),
          };
        }

        // Legacy schedules without shifts: use day window from detail
        const detailDay = scheduleDetail.find(
          (d: any) =>
            String(d?.dayOfWeek ?? d?.day ?? '').toLowerCase() ===
            dayName.toLowerCase(),
        );
        if (detailDay?.startTime && detailDay?.endTime) {
          return {
            date,
            entry,
            cards: [
              {
                name: mySchedule?.name || 'Work hours',
                startTime: detailDay.startTime,
                endTime: detailDay.endTime,
                isOverride: false,
              },
            ],
          };
        }
      }

      return { date, entry, cards: [] };
    });
  }, [
    scheduleData,
    weekStart,
    scheduleShifts,
    mySchedule?.detail,
    mySchedule?.name,
    myAssignedShift,
    myAssignedShiftId,
  ]);

  const weekOptions = useMemo(() => {
    const monthStart = weekStart.startOf('month');
    const options: { value: string; label: string }[] = [];
    let cursor = monthStart.startOf('isoWeek');
    // Cover weeks that touch this month
    for (let i = 0; i < 6; i++) {
      const start = cursor.add(i, 'week');
      const end = start.add(6, 'day');
      if (end.isBefore(monthStart) || start.isAfter(monthStart.endOf('month'))) {
        continue;
      }
      options.push({
        value: start.format('YYYY-MM-DD'),
        label: `Week ${start.isoWeek()} - ${start.format('MMM D')} - ${end.format('MMM D')}`,
      });
    }
    return options;
  }, [weekStart]);

  const hasNoApprover =
    (approvalUserData?.length ?? 0) < 1 &&
    (approvalDepartmentData?.length ?? 0) < 1;

  const onFinish = (values: any) => {
    if (hasNoApprover) return;
    const approvalWorkflowId =
      approvalUserData?.length > 0
        ? approvalUserData[0]?.id
        : approvalDepartmentData?.[0]?.id;

    createRequest(
      {
        item: {
          peerUserId: values.peerUserId,
          targetShiftId: values.targetShiftId,
          startDate: dayjs(values.dateRange[0]).format('YYYY-MM-DD'),
          endDate: dayjs(values.dateRange[1]).format('YYYY-MM-DD'),
          reason: values.reason,
          approvalType: 'ShiftSwap',
          approvalWorkflowId,
        },
        userId: userId || '',
      },
      {
        onSuccess: () => {
          form.resetFields();
          setIsModalOpen(false);
        },
      },
    );
  };

  const resolveUserLabel = (id: string) =>
    peerOptions.find((p) => p.value === id)?.label ||
    personName(allUsers?.items?.find((u: any) => u.id === id)) ||
    id ||
    '-';

  const requestColumns = [
    {
      title: 'Peer',
      dataIndex: 'peerUserId',
      key: 'peerUserId',
      render: (id: string) => resolveUserLabel(id),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_: any, row: any) =>
        `${dayjs(row.startDate).format('MMM D, YYYY')} – ${dayjs(row.endDate).format('MMM D, YYYY')}`,
    },
    {
      title: 'Target Shift',
      dataIndex: 'targetShiftId',
      key: 'targetShiftId',
      render: (id: string) => {
        const shift = scheduleShifts.find((s: any) => s.id === id);
        return shift
          ? `${shift.name} (${shift.startTime} – ${shift.endTime})`
          : id || '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {(status || '-').replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (v: string) => v || '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, row: any) =>
        row.requesterUserId === userId &&
        (row.status === 'PENDING_PEER' ||
          row.status === 'PENDING_APPROVAL') ? (
          <Button
            type="link"
            danger
            size="small"
            onClick={() => cancelRequest(row.id)}
            data-cy={`shift-swap-cancel-${row.id}`}
          >
            Cancel
          </Button>
        ) : null,
    },
  ];

  const peerColumns = [
    {
      title: 'Requester',
      dataIndex: 'requesterUserId',
      key: 'requesterUserId',
      render: (id: string) => resolveUserLabel(id),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_: any, row: any) =>
        `${dayjs(row.startDate).format('MMM D')} – ${dayjs(row.endDate).format('MMM D, YYYY')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {(status || '-').replace(/_/g, ' ')}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, row: any) => (
        <AccessGuard permissions={[Permissions.ApproveShiftSwapPeer]}>
          <Space>
            <Button
              type="primary"
              size="small"
              loading={isPeerApproving}
              onClick={() => peerApprove({ id: row.id })}
              data-cy={`shift-swap-peer-approve-${row.id}`}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              loading={isPeerRejecting}
              onClick={() => peerReject({ id: row.id })}
              data-cy={`shift-swap-peer-reject-${row.id}`}
            >
              Reject
            </Button>
          </Space>
        </AccessGuard>
      ),
    },
  ];

  const emptySwapMessage =
    swapTab === 'pending'
      ? 'No pending swap requests.'
      : swapTab === 'approved'
        ? 'No approved swap requests.'
        : 'No rejected swap requests.';

  return (
      <div
        className="space-y-8 w-full max-w-full pt-2"
        id="time-attendance-my-timesheet-schedule-page"
        data-cy="time-attendance-my-timesheet-schedule-page"
      >
        {/* My Schedule */}
        <section data-cy="my-schedule-section">
          <div className="mb-4" data-cy="my-schedule-heading">
            <h2 className="text-xl font-semibold m-0 text-[#1f1f1f]">
              My Schedule
            </h2>
            <p className="text-sm text-gray-500 m-0 mt-1">
              Week of {weekStart.format('MMM D')} - {weekEnd.format('MMM D')}
              {employeeDisplayName ? ` - ${employeeDisplayName}` : ''}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-3 mb-4"
            data-cy="my-schedule-controls"
          >
            <DatePicker
              picker="month"
              value={weekStart}
              allowClear={false}
              format="MMMM YYYY"
              className="min-w-[160px]"
              onChange={(value) => {
                if (!value) return;
                const next = value.startOf('month').startOf('isoWeek');
                // Prefer the week that contains the 1st if it overlaps; else first week of month
                setWeekStart(
                  value.startOf('month').isoWeekday() === 1
                    ? value.startOf('month')
                    : next.isBefore(value.startOf('month'))
                      ? next.add(1, 'week')
                      : next,
                );
              }}
              data-cy="my-schedule-month-picker"
            />
            <Select
              className="min-w-[240px]"
              value={weekStart.format('YYYY-MM-DD')}
              options={weekOptions}
              onChange={(value) => setWeekStart(dayjs(value))}
              data-cy="my-schedule-week-select"
            />
            {/* <Select
              className="min-w-[260px] flex-1 max-w-[360px]"
              value={userId}
              disabled
              options={[
                {
                  value: userId,
                  label: employeeRole
                    ? `${employeeDisplayName} - ${employeeRole}`
                    : employeeDisplayName,
                },
              ]}
              data-cy="my-schedule-employee-select"
            /> */}
            <Button
              type="primary"
              icon={<FaPlus />}
              className="ml-auto"
              onClick={() => {
                if (departmentId) getDepartmentApproval();
                if (userId) getUserApproval();
                setIsModalOpen(true);
              }}
              data-cy="shift-swap-new-request-btn"
            >
              New Request
            </Button>
          </div>

          {isScheduleLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : !myScheduleId && !isScheduleLoading ? (
            <div
              className="py-10 text-center text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg"
              data-cy="my-schedule-no-work-schedule"
            >
              No work schedule is assigned to your active job. Please contact HR
              to assign a work schedule.
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3"
              data-cy="my-schedule-week-grid"
            >
              {days.map(({ date, cards }) => (
                <div
                  key={date.format('YYYY-MM-DD')}
                  className="rounded-xl border border-gray-200 bg-white min-h-[180px] p-3 flex flex-col"
                  data-cy={`my-schedule-day-${date.format('YYYY-MM-DD')}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1f1f1f]">
                        {date.format('ddd')}{' '}
                        <span className="font-normal text-gray-600">
                          {date.format('MMM D')}
                        </span>
                      </div>
                    </div>
                    <DownOutlined className="text-gray-400 text-xs mt-1" />
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    {cards.length > 0 ? (
                      cards.map((card: any, idx: number) => (
                        <div
                          key={`${date.format('YYYY-MM-DD')}-${idx}`}
                          className="rounded-lg bg-[#f5f5f5] px-3 py-2"
                          data-cy={`my-schedule-shift-card-${date.format('YYYY-MM-DD')}-${idx}`}
                        >
                          <div className="text-sm font-semibold text-[#1f1f1f]">
                            {formatTimeRange(card.startTime, card.endTime)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {card.name}
                          </div>
                          {card.isOverride && (
                            <Tag color="orange" className="mt-1 m-0 text-[10px]">
                              Swap
                            </Tag>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                        Off
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Peer approvals inbox */}
        {peerItems.length > 0 && (
          <section data-cy="shift-swap-peer-pending-section">
            <h3 className="text-base font-semibold mb-3 text-[#1f1f1f]">
            Requests awaiting your approval
            </h3>
            <Table
              rowKey="id"
              columns={peerColumns}
              dataSource={peerItems}
              pagination={false}
              size="small"
              scroll={{ x: 720 }}
              data-cy="shift-swap-peer-pending-table"
            />
          </section>
        )}

        {/* Swap Requests */}
        <section data-cy="swap-requests-section">
          <h2 className="text-xl font-semibold m-0 mb-3 text-[#1f1f1f]">
            Swap Requests
          </h2>
          <Tabs
            activeKey={swapTab}
            onChange={(key) => setSwapTab(key as SwapTabKey)}
            items={[
              {
                key: 'pending',
                label: `Pending (${pendingCount})`,
              },
              {
                key: 'approved',
                label: `Approved (${approvedCount})`,
              },
              {
                key: 'rejected',
                label: `Rejected (${rejectedCount})`,
              },
            ]}
            data-cy="swap-requests-status-tabs"
          />

          {isRequestsLoading ? (
            <TableSkeleton columns={requestColumns} />
          ) : filteredRequests.length === 0 ? (
            <div
              className="py-10 text-center text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg"
              data-cy="swap-requests-empty"
            >
              {emptySwapMessage}
            </div>
          ) : (
            <Table
              rowKey="id"
              columns={requestColumns}
              dataSource={filteredRequests}
              pagination={false}
              scroll={{ x: 900 }}
              data-cy="swap-requests-table"
            />
          )}
        </section>

        <Modal
          open={isModalOpen}
          title="New Shift Swap Request"
          onCancel={() => {
            form.resetFields();
            setIsModalOpen(false);
          }}
          footer={null}
          destroyOnClose
          centered
          data-cy="shift-swap-create-modal"
        >
          {hasNoApprover && (
            <p className="text-red-600 text-sm mb-3">
              You lack approver please contact your team lead for more
              information
            </p>
          )}
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="peerUserId"
              label="Peer"
              rules={[{ required: true, message: 'Select a peer' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={peerOptions}
                placeholder="Select peer employee"
                disabled={hasNoApprover}
              />
            </Form.Item>
            <Form.Item
              name="targetShiftId"
              label="Target shift (shift you want)"
              rules={[{ required: true, message: 'Select a shift' }]}
            >
              <Select
                placeholder={targetShiftPlaceholder}
                disabled={hasNoApprover || !swappableShifts.length}
                options={swappableShifts.map((s: any) => ({
                  value: s.id,
                  label: `${s.name} (${s.startTime} – ${s.endTime})${
                    isShiftMarkedSwappable(s) ? '' : ' — not swappable'
                  }`,
                  disabled: !isShiftMarkedSwappable(s),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="dateRange"
              label="Date range"
              rules={[{ required: true, message: 'Select dates' }]}
            >
              <DatePicker.RangePicker
                className="w-full"
                format={DATE_FORMAT}
                disabled={hasNoApprover}
                disabledDate={(current) =>
                  !!current && current.isBefore(dayjs().startOf('day'))
                }
              />
            </Form.Item>
            <Form.Item name="reason" label="Reason (optional)">
              <Input.TextArea rows={3} disabled={hasNoApprover} />
            </Form.Item>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  form.resetFields();
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating}
                disabled={hasNoApprover}
              >
                Submit
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
  );
}
