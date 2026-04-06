'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useDeleteActionPlanById,
  useResolveActionPlanById,
} from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllActionPlan } from '@/store/server/features/organization-development/categories/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Popover,
  Row,
  Select,
  Skeleton,
  Table,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import {
  MdDeleteOutline,
  MdMoreHoriz,
  MdOutlineFilterAlt,
  MdOutlineModeEditOutline,
} from 'react-icons/md';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  actionPlanCreatedAtSortMs,
  employeeFullName,
  normalizeActionPlanListItem,
  normalizeActionPlanListPayload,
  normalizeStatus,
  pickActionPlanDeadlineRaw,
  pickActionPlanPriority,
  responsibleIds,
  resolvedByUserId,
} from '../actionPlanListNormalize';

const { RangePicker } = DatePicker;

type AppliedActionPlanFilters = {
  status: 'all' | 'resolved' | 'pending' | 'unresolved';
  priority: 'all' | 'high' | 'medium' | 'low';
  dateRange: [Dayjs, Dayjs] | null;
  /** Empty = no filter; otherwise row must include at least one selected id. */
  responsiblePersonIds: string[];
};

const defaultAppliedFilters: AppliedActionPlanFilters = {
  status: 'all',
  priority: 'all',
  dateRange: null,
  responsiblePersonIds: [],
};

/** Match feedback /form categories list (`CategoriesManagementStore` default). */
const ACTION_PLANS_PAGE_SIZE_DEFAULT = 12;

interface Params {
  id: string;
}

function StatusPill({ status }: { status: string | undefined }) {
  const n = normalizeStatus(status);
  if (n === 'resolved') {
    return (
      <span className="inline-flex items-center rounded border border-emerald-500/55 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
        Resolved
      </span>
    );
  }
  if (n === 'pending') {
    return (
      <span className="inline-flex items-center rounded border border-amber-500/55 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded border border-red-500/55 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
      Unresolved
    </span>
  );
}

function StatusCell({
  item,
  userById,
}: {
  item: any;
  userById: Map<string, any>;
}) {
  const n = normalizeStatus(item?.status);
  if (n !== 'resolved') {
    return <StatusPill status={item?.status} />;
  }

  const resolverId = resolvedByUserId(item);
  if (!resolverId) {
    return <StatusPill status={item?.status} />;
  }

  const resolver = userById.get(String(resolverId));
  const fullName = resolver ? employeeFullName(resolver).trim() : '';
  const displayName = fullName || 'Unknown user';
  const initial = displayName.trim()[0];

  return (
    <div className="flex min-w-0 max-w-[220px] items-start gap-2">
      <Avatar
        src={resolver?.profileImage}
        size={32}
        className="mt-0.5 shrink-0"
      >
        {initial}
      </Avatar>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="inline-flex w-fit items-center rounded border border-emerald-500/55 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          Resolved by
        </span>
        <span
          className="truncate text-sm font-medium leading-tight text-gray-900"
          title={displayName}
        >
          {displayName}
        </span>
      </div>
    </div>
  );
}

function PriorityPill({ priority }: { priority: string | null | undefined }) {
  const p = (priority || '').toLowerCase();
  if (p === 'high') {
    return (
      <span className="inline-flex items-center rounded border border-red-500/55 bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
        High
      </span>
    );
  }
  if (p === 'medium') {
    return (
      <span className="inline-flex items-center rounded border border-orange-500/55 bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-800">
        Medium
      </span>
    );
  }
  if (p === 'low') {
    return (
      <span className="inline-flex items-center rounded border border-emerald-500/55 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
        Low
      </span>
    );
  }
  return <span className="text-xs text-gray-400">—</span>;
}

function surveyCreatorId(item: any): string | undefined {
  const raw =
    item?.createdByUserId ??
    item?.createdById ??
    item?.createdBy ??
    item?.created_by ??
    item?.createdByUser?.id ??
    item?.surveyCreatedByUserId ??
    item?.formCreatedByUserId ??
    item?.formCreatedById ??
    item?.formCreatedBy ??
    item?.sourceCreatedBy ??
    undefined;

  if (raw == null || raw === '') return undefined;
  return String(raw);
}

function formatActionPlanDeadlineCell(item: any): string {
  const raw = pickActionPlanDeadlineRaw(item);
  if (raw == null || raw === '') return '—';
  const d = dayjs(raw as string | number | Date);
  return d.isValid() ? d.format('MMM D YYYY') : '—';
}

function deadlineStatusText(item: any): React.ReactNode {
  const raw = pickActionPlanDeadlineRaw(item);
  if (raw == null || raw === '') {
    return (
      <span className="text-xs font-medium text-gray-500">No deadline</span>
    );
  }
  const d = dayjs(raw as string | number | Date);
  if (!d.isValid()) {
    return (
      <span className="text-xs font-medium text-gray-500">No deadline</span>
    );
  }

  const today = dayjs().startOf('day');
  const dd = d.startOf('day');
  const diffDays = dd.diff(today, 'day');

  if (diffDays < 0) {
    return <span className="text-xs font-semibold text-red-600">Overdue</span>;
  }
  if (diffDays === 0) {
    return (
      <span className="text-xs font-semibold text-amber-600">Due today</span>
    );
  }
  if (diffDays <= 3) {
    return (
      <span className="text-xs font-medium text-orange-600">Due soon</span>
    );
  }
  return <span className="text-xs font-medium text-blue-600">Upcoming</span>;
}

function ActionPlansTableSkeleton() {
  return (
    <div
      className="w-full min-w-0 overflow-hidden bg-white"
      data-cy="action-plans-table-skeleton"
    >
      <div className="border-b border-gray-200 bg-[#F5F5F5] px-3 py-3">
        <Skeleton.Input
          active
          size="small"
          style={{ width: 220, minWidth: 220 }}
          className="!min-h-[14px] !leading-none"
        />
      </div>
      {Array.from({ length: 3 }).map((_, row) => (
        <div
          key={row}
          className={`border-b border-gray-100 px-3 py-4 ${
            row % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
          }`}
        >
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 2, width: ['68%', '42%'] }}
          />
        </div>
      ))}
    </div>
  );
}

function ActionPlans({ id }: Params) {
  const currentUserId = useAuthenticationStore.getState().userId || null;
  const {
    data: actionPlanData,
    refetch: refetchActionPlan,
    isLoading: actionPlansLoading,
  } = useGetAllActionPlan(id);
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const {
    setSelectedActionPlan,
    selectedActionPlan,
    setNumberOfActionPlan,
    setSelectedEditActionPlan,
    setOpen,
  } = useOrganizationalDevelopment();
  const { mutate: deleteEmployeeData, isLoading: actionPlanDeletingLoading } =
    useDeleteActionPlanById();
  const {
    mutateAsync: resolveActionPlanAsync,
    isLoading: actionPlanResolvingLoading,
  } = useResolveActionPlanById();

  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] =
    useState<AppliedActionPlanFilters>(defaultAppliedFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [form] = Form.useForm();
  const filterFormSnapshot = useRef<Record<string, unknown>>({});
  const [actionPlansPage, setActionPlansPage] = useState(1);
  const [actionPlansPageSize, setActionPlansPageSize] = useState(
    ACTION_PLANS_PAGE_SIZE_DEFAULT,
  );
  const { isMobile, isTablet } = useIsMobile();

  const showTableSkeleton = actionPlansLoading || userLoading;

  const userById = useMemo(() => {
    const map = new Map<string, any>();
    for (const u of employeeData?.items ?? []) {
      if (u?.id) map.set(String(u.id), u);
    }
    return map;
  }, [employeeData?.items]);

  const rows = useMemo(() => {
    const raw = normalizeActionPlanListPayload(actionPlanData).map(
      normalizeActionPlanListItem,
    );
    return [...raw].sort((a: any, b: any) => {
      const tb = actionPlanCreatedAtSortMs(b);
      const ta = actionPlanCreatedAtSortMs(a);
      if (tb !== ta) return tb - ta;
      return String(b?.id ?? '').localeCompare(String(a?.id ?? ''));
    });
  }, [actionPlanData]);

  const assignedResponsibleOptions = useMemo(() => {
    const idSet = new Set<string>();
    for (const item of rows) {
      for (const uid of responsibleIds(item)) {
        idSet.add(String(uid));
      }
    }
    const options = [...idSet].map((uid) => {
      const u = userById.get(uid);
      const label = u
        ? employeeFullName(u).trim() || uid
        : `Unknown (${uid.slice(0, 8)}…)`;
      return { value: uid, label };
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, [rows, userById]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((item: any) => {
      const ids = responsibleIds(item);
      const nameParts = ids
        .map((uid) => {
          const u = userById.get(uid);
          if (!u) return '';
          return [u.firstName, u.middleName, u.lastName]
            .filter(Boolean)
            .join(' ');
        })
        .join(' ')
        .toLowerCase();

      if (q) {
        const rid = resolvedByUserId(item);
        const resolver = rid ? userById.get(String(rid)) : undefined;
        const resolverName = resolver
          ? employeeFullName(resolver).toLowerCase()
          : '';
        const hay = [
          item?.actionToBeTaken,
          item?.description,
          item?.issue,
          item?.problemStatement,
          item?.whatNeedsToBeDone,
          item?.name,
          resolverName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q) && !nameParts.includes(q)) return false;
      }

      if (appliedFilters.status !== 'all') {
        if (normalizeStatus(item?.status) !== appliedFilters.status)
          return false;
      }

      if (appliedFilters.priority !== 'all') {
        const pr = (item?.priority || '').toLowerCase();
        if (pr !== appliedFilters.priority) return false;
      }

      if (appliedFilters.dateRange) {
        const [start, end] = appliedFilters.dateRange;
        const rawDl = pickActionPlanDeadlineRaw(item);
        if (rawDl == null || rawDl === '') return false;
        const d = dayjs(rawDl as string | number | Date);
        if (!d.isValid() || d.isBefore(start, 'day') || d.isAfter(end, 'day'))
          return false;
      }

      if (appliedFilters.responsiblePersonIds.length > 0) {
        const planResponsible = new Set(
          responsibleIds(item).map((x) => String(x)),
        );
        const matches = appliedFilters.responsiblePersonIds.some((fid) =>
          planResponsible.has(String(fid)),
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [rows, search, appliedFilters, userById]);

  useEffect(() => {
    setActionPlansPage(1);
  }, [
    search,
    appliedFilters.status,
    appliedFilters.priority,
    appliedFilters.dateRange,
    appliedFilters.responsiblePersonIds,
  ]);

  const paginatedRows = useMemo(() => {
    const start = (actionPlansPage - 1) * actionPlansPageSize;
    return filteredRows.slice(start, start + actionPlansPageSize);
  }, [filteredRows, actionPlansPage, actionPlansPageSize]);

  const actionPlansTotal = filteredRows.length;

  useEffect(() => {
    if (actionPlansTotal === 0) {
      setActionPlansPage(1);
      return;
    }
    const lastPage = Math.max(
      1,
      Math.ceil(actionPlansTotal / actionPlansPageSize),
    );
    setActionPlansPage((p) => Math.min(p, lastPage));
  }, [actionPlansTotal, actionPlansPageSize]);

  const confirmDeleteActionPlanHandler = () => {
    if (selectedActionPlan) {
      deleteEmployeeData(selectedActionPlan, {
        onSuccess: () => {
          setSelectedActionPlan(null);
          refetchActionPlan();
        },
      });
    }
  };

  const handleEditActionPlan = (planId: string) => {
    setOpen(true);
    setNumberOfActionPlan(1);
    setSelectedEditActionPlan(null);
    setSelectedEditActionPlan(planId);
  };

  const handleResolveHandler = (planId: string) => {
    Modal.confirm({
      title: 'Resolve this issue?',
      content:
        'This action plan will be marked as resolved. You can still view it in the list.',
      okText: 'Resolve',
      cancelText: 'Cancel',
      centered: true,
      zIndex: 1100,
      okButtonProps: {
        className:
          '!bg-[#1E40AF] hover:!bg-[#1E3A8A] !border-[#1E40AF] text-white',
      },
      onOk: async () => {
        await resolveActionPlanAsync({ status: 'solved', id: planId });
        refetchActionPlan();
      },
    });
  };

  const syncFilterFormFromState = () => {
    form.setFieldsValue({
      responsiblePersonIds:
        appliedFilters.responsiblePersonIds.length > 0
          ? [...appliedFilters.responsiblePersonIds]
          : undefined,
      status:
        appliedFilters.status === 'all' ? undefined : appliedFilters.status,
      priority:
        appliedFilters.priority === 'all' ? undefined : appliedFilters.priority,
      dateRange:
        appliedFilters.dateRange &&
        appliedFilters.dateRange[0] &&
        appliedFilters.dateRange[1]
          ? appliedFilters.dateRange
          : undefined,
    });
  };

  const handleFilterPopoverOpenChange = (open: boolean) => {
    if (open) {
      syncFilterFormFromState();
      filterFormSnapshot.current = form.getFieldsValue();
    }
    setFilterOpen(open);
  };

  const closeFilterPopover = () => setFilterOpen(false);

  const handleFilterCancel = () => {
    form.setFieldsValue(filterFormSnapshot.current);
    closeFilterPopover();
  };

  const handleFilterApply = () => {
    const v = form.getFieldsValue();
    const dr = v.dateRange as [Dayjs, Dayjs] | undefined;
    const rp = v.responsiblePersonIds;
    const responsiblePersonIds = Array.isArray(rp)
      ? rp.map(String).filter(Boolean)
      : [];
    setAppliedFilters({
      status: v.status ?? 'all',
      priority: v.priority ?? 'all',
      dateRange: dr?.[0] && dr?.[1] ? [dr[0], dr[1]] : null,
      responsiblePersonIds,
    });
    closeFilterPopover();
  };

  const requiredMark = (text: string) => (
    <span>
      {text} <span className="text-red-500">*</span>
    </span>
  );

  const filterPopoverContent = (
    <div
      className="w-[min(100vw-2rem,400px)] rounded-lg bg-white shadow-lg ring-1 ring-black/5"
      data-cy="action-plans-filter-popover"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-base font-semibold text-gray-900">Filter</span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close filter"
          onClick={handleFilterCancel}
          data-cy="action-plans-filter-close"
        >
          <CloseOutlined />
        </button>
      </div>
      <Form
        form={form}
        layout="vertical"
        className="px-4 pb-2 pt-3"
        requiredMark={false}
      >
        <Form.Item
          name="responsiblePersonIds"
          label="Responsible person"
          className="mb-3"
          data-cy="action-plans-filter-responsible-person"
        >
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={
              assignedResponsibleOptions.length > 0
                ? 'Select one or more'
                : 'No responsible persons on this survey'
            }
            disabled={assignedResponsibleOptions.length === 0}
            className="w-full rounded-md"
            options={assignedResponsibleOptions}
            maxTagCount="responsive"
            data-cy="action-plans-filter-responsible-person-select"
          />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label={requiredMark('Status')}
              className="mb-3"
            >
              <Select
                placeholder="Select"
                allowClear
                className="w-full rounded-md"
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'unresolved', label: 'Unresolved' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="priority"
              label={requiredMark('Priority')}
              className="mb-3"
            >
              <Select
                placeholder="Select"
                allowClear
                className="w-full rounded-md"
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="dateRange"
          label={requiredMark('Date')}
          className="mb-0"
        >
          <RangePicker
            className="w-full rounded-md"
            format="MMM D YYYY"
            placeholder={['Start date', 'End date']}
          />
        </Form.Item>
      </Form>
      <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
        <Button
          size="middle"
          className="rounded-md border-gray-200"
          onClick={handleFilterCancel}
          data-cy="action-plans-filter-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          size="middle"
          className="rounded-md border-0 bg-[#2D5BFF] hover:!bg-[#2450e6]"
          onClick={handleFilterApply}
          data-cy="action-plans-filter-apply"
        >
          Filter
        </Button>
      </div>
    </div>
  );

  const columns: ColumnsType<any> = [
    {
      title: 'Issues',
      key: 'issue',
      align: 'left',
      width: 300,
      minWidth: 220,
      render: (_: unknown, item: any) => {
        const text =
          item?.issue ?? item?.problemStatement ?? item?.description ?? '—';
        return (
          <p
            className="line-clamp-2 max-w-full whitespace-normal break-words text-sm leading-snug text-gray-800"
            title={text}
          >
            {text}
          </p>
        );
      },
    },
    {
      title: 'Action to be taken',
      key: 'actionToBeTaken',
      align: 'left',
      width: 260,
      minWidth: 200,
      render: (_: unknown, item: any) => {
        const text = item?.actionToBeTaken ?? item?.whatNeedsToBeDone ?? '—';
        const title =
          typeof text === 'string' && text !== '—' ? text : undefined;
        return (
          <p
            className="line-clamp-2 max-w-full whitespace-normal break-words text-sm leading-snug text-gray-800"
            title={title}
          >
            {text}
          </p>
        );
      },
    },
    {
      title: 'Deadline',
      key: 'deadline',
      align: 'left',
      width: 104,
      render: (_: unknown, item: any) => (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm text-gray-800">
            {formatActionPlanDeadlineCell(item)}
          </span>
          {deadlineStatusText(item)}
        </div>
      ),
    },
    {
      title: 'Responsible Person',
      key: 'responsible',
      align: 'left',
      width: 88,
      render: (_: unknown, item: any) => {
        const ids = responsibleIds(item);
        const users = ids
          .map((uid) => userById.get(uid))
          .filter(Boolean) as any[];
        if (users.length === 0) {
          return <span className="text-xs text-gray-400">—</span>;
        }
        if (users.length === 1) {
          const u = users[0];
          const full = employeeFullName(u);
          const initial = full?.trim()?.[0];
          return (
            <Tooltip
              title={full || '—'}
              mouseEnterDelay={0.12}
              placement="topLeft"
            >
              <span className="inline-flex cursor-default align-middle">
                <Avatar src={u.profileImage} size={32} className="shrink-0">
                  {initial}
                </Avatar>
              </span>
            </Tooltip>
          );
        }
        const visibleUsers = users.slice(0, 5);
        const hiddenUsers = users.slice(5);
        const hiddenUsersPopover = (
          <div className="responsible-hidden-users-scroll max-h-56 min-w-[220px] overflow-y-auto pr-1">
            <div className="space-y-2">
              {hiddenUsers.map((u) => {
                const full = employeeFullName(u);
                return (
                  <div key={u.id} className="flex items-center gap-2">
                    <Avatar src={u.profileImage} size={24}>
                      {full?.[0]}
                    </Avatar>
                    <span
                      className="truncate text-sm text-gray-800"
                      title={full || '—'}
                    >
                      {full || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
        return (
          <div className="inline-flex items-center gap-2 align-middle">
            <span className="inline-flex cursor-default align-middle">
              <Avatar.Group size={32}>
                {visibleUsers.map((u) => {
                  const full = employeeFullName(u);
                  return (
                    <Tooltip
                      key={u.id}
                      title={full || '—'}
                      mouseEnterDelay={0.12}
                      placement="topLeft"
                    >
                      <Avatar src={u.profileImage} size={32}>
                        {full?.[0]}
                      </Avatar>
                    </Tooltip>
                  );
                })}
              </Avatar.Group>
            </span>
            {hiddenUsers.length > 0 ? (
              <Popover
                content={hiddenUsersPopover}
                trigger="click"
                placement="bottomLeft"
              >
                <button
                  type="button"
                  className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 text-[11px] font-semibold text-[#1E40AF] transition-colors hover:bg-[#DBEAFE]"
                >
                  +{hiddenUsers.length}
                </button>
              </Popover>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'left',
      width: 220,
      render: (_: unknown, item: any) => (
        <StatusCell item={item} userById={userById} />
      ),
    },
    {
      title: 'Priority',
      key: 'priority',
      align: 'left',
      width: 88,
      render: (_: unknown, item: any) => (
        <PriorityPill priority={pickActionPlanPriority(item)} />
      ),
    },
    {
      title: 'Actions',
      key: 'rowActions',
      align: 'left',
      width: 96,
      render: (_: unknown, item: any) =>
        (() => {
          const planId = item?.id;
          const canResolve =
            item?.status !== 'solved' &&
            responsibleIds(item).includes(String(currentUserId));

          const canEdit =
            surveyCreatorId(item) &&
            currentUserId &&
            String(surveyCreatorId(item)) === String(currentUserId);

          const canDelete = canEdit;

          const menuItems = [
            ...(canResolve
              ? [
                  {
                    key: 'resolve',
                    label: (
                      <span
                        onClick={() => handleResolveHandler(planId)}
                        data-cy={`action-plan-row-${planId}-menu-resolve`}
                        className="inline-flex items-center gap-3 text-[16px] font-normal text-[#262626]"
                      >
                        <IoCheckmarkCircleOutline className="text-[16px] leading-none text-[#262626]" />
                        Resolve Action Plan
                      </span>
                    ),
                  },
                ]
              : []),
            ...(canEdit
              ? [
                  {
                    key: 'edit',
                    label: (
                      <span
                        onClick={() => handleEditActionPlan(planId)}
                        data-cy={`action-plan-row-${planId}-menu-edit`}
                        className="inline-flex items-center gap-3 text-[16px] font-normal text-[#262626]"
                      >
                        <MdOutlineModeEditOutline className="text-[16px] leading-none text-[#262626]" />
                        Edit Action Plan
                      </span>
                    ),
                  },
                  {
                    key: 'delete',
                    label: (
                      <span
                        onClick={() => setSelectedActionPlan(planId)}
                        data-cy={`action-plan-row-${planId}-menu-delete`}
                        className="inline-flex items-center gap-3 text-[16px] font-normal text-[#ff4d4f]"
                      >
                        <MdDeleteOutline className="text-[16px] leading-none text-[#ff4d4f]" />
                        Delete Action Plan
                      </span>
                    ),
                  },
                ]
              : []),
            ...(canDelete ? [] : []),
          ];

          if (menuItems.length === 0) return null;

          return (
            <Dropdown
              menu={{ items: menuItems as any }}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="action-plan-row-actions-menu"
              data-cy={`action-plan-row-${planId}-menu`}
            >
              <button
                type="button"
                className="relative z-[2] flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-[#374151] transition-colors hover:border-slate-300 hover:bg-slate-50 pointer-events-auto"
                data-cy={`action-plan-row-${planId}-menu-trigger`}
                aria-label="More options"
              >
                <MdMoreHoriz className="text-[24px] leading-none" />
              </button>
            </Dropdown>
          );
        })(),
    },
  ];

  return (
    <div
      data-cy="action-plans-container"
      className="flex h-full min-h-0 w-full min-w-0 flex-col pb-3 pt-0 lg:pb-0"
    >
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm lg:shadow-none">
        <div className="flex w-full min-w-0 shrink-0 flex-row items-stretch justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
          <div
            className="flex h-10 min-w-0 max-w-[min(100%,calc(17rem+30px))] flex-1 items-stretch overflow-hidden rounded-md border border-[#E5E7EB] bg-white transition-colors focus-within:border-[#1e40af]/40 md:max-w-none"
            data-cy="action-plans-search-employee"
          >
            <Input
              allowClear
              variant="borderless"
              placeholder="Search Employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 !bg-transparent px-3 text-sm shadow-none placeholder:text-gray-400"
              classNames={{
                input: '!shadow-none',
              }}
            />
            <div
              className="flex w-10 shrink-0 items-center justify-center border-l border-[#E5E7EB] bg-white"
              aria-hidden
            >
              <SearchOutlined className="text-base text-gray-800" />
            </div>
          </div>
          <div className="flex shrink-0 items-center">
            <Popover
              content={filterPopoverContent}
              trigger="click"
              open={filterOpen}
              onOpenChange={handleFilterPopoverOpenChange}
              placement="bottomRight"
              arrow={false}
              styles={{ body: { padding: 0 } }}
              overlayInnerStyle={{ padding: 0 }}
            >
              <Button
                type="default"
                size="large"
                aria-label="Filter"
                title="Filter"
                className="inline-flex !h-10 !min-h-10 !min-w-10 !w-10 !items-center !justify-center !gap-0 !rounded-lg !border !border-[#E5E7EB] !bg-white !px-0 !py-0 text-slate-800 shadow-sm hover:!border-gray-300 hover:!bg-gray-50 lg:!min-w-[auto] lg:!w-auto lg:!gap-2 lg:!px-4 [&_.ant-btn-icon]:!m-0"
                icon={
                  <MdOutlineFilterAlt
                    className="h-[18px] w-[18px] shrink-0 text-slate-600"
                    aria-hidden
                  />
                }
                data-cy="action-plans-filter"
              >
                <span className="hidden pl-0 text-[14px] font-normal leading-none lg:inline">
                  Filter
                </span>
              </Button>
            </Popover>
          </div>
        </div>

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-0">
          <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto scrollbar-hide">
            {showTableSkeleton ? (
              <div className="w-full min-w-0">
                <ActionPlansTableSkeleton />
              </div>
            ) : (
              <Table
                id="action-plans-table"
                data-cy="action-plans-table"
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
                size={isMobile ? 'small' : 'middle'}
                dataSource={paginatedRows}
                columns={columns}
                rowClassName={(_, index) =>
                  index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                }
                className="survey-action-plans-table w-full min-w-0 [&_.ant-table-wrapper]:w-full [&_.ant-table-wrapper]:!rounded-t-none [&_.ant-table]:w-full [&_.ant-table]:!rounded-t-none [&_.ant-table-container]:!rounded-t-none [&_.ant-table-content]:!rounded-t-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead>tr>th]:!bg-[#F5F5F5] [&_.ant-table-thead>tr>th]:!text-left [&_.ant-table-thead>tr>th]:!font-bold [&_.ant-table-thead>tr>th]:!text-gray-900 [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-thead>tr>th]:border-r [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-thead>tr>th:last-child]:!border-r-0 [&_.ant-table-thead>tr>th]:px-2 [&_.ant-table-thead>tr>th]:py-2.5 [&_.ant-table-thead>tr>th]:text-xs lg:[&_.ant-table-thead>tr>th]:px-3 lg:[&_.ant-table-thead>tr>th]:py-3 lg:[&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-tbody>tr>td]:align-top [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr>td]:border-r [&_.ant-table-tbody>tr>td]:border-gray-100 [&_.ant-table-tbody>tr>td:last-child]:!border-r-0 [&_.ant-table-tbody>tr>td]:px-2 [&_.ant-table-tbody>tr>td]:py-3 lg:[&_.ant-table-tbody>tr>td]:px-3 lg:[&_.ant-table-tbody>tr>td]:py-4"
                style={{ width: '100%' }}
              />
            )}
          </div>

          {!showTableSkeleton &&
            actionPlansTotal > actionPlansPageSize &&
            (isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={actionPlansTotal}
                pageSize={actionPlansPageSize}
                currentPage={actionPlansPage}
                onChange={(page, size) => {
                  setActionPlansPage(page);
                  setActionPlansPageSize(size);
                }}
                onShowSizeChange={(page, size) => {
                  setActionPlansPage(page);
                  setActionPlansPageSize(size);
                }}
                className="border-t border-gray-100 bg-white"
                data-cy="action-plans-mobile-pagination-container"
              />
            ) : (
              <CustomPagination
                current={actionPlansPage}
                total={actionPlansTotal}
                pageSize={actionPlansPageSize}
                onChange={(page, size) => {
                  setActionPlansPage(page);
                  setActionPlansPageSize(size);
                }}
                onShowSizeChange={(size) => {
                  setActionPlansPageSize(size);
                  setActionPlansPage(1);
                }}
                showPageSizeChanger={false}
                goToOnRight
                className="shrink-0 border-t border-gray-100 bg-white"
                data-cy="action-plans-pagination-container"
              />
            ))}
        </div>
      </div>

      <DeleteModal
        data-cy="action-plan-delete-modal"
        onCancel={() => setSelectedActionPlan(null)}
        onConfirm={confirmDeleteActionPlanHandler}
        open={selectedActionPlan !== null}
        loading={actionPlanDeletingLoading}
      />
      <style jsx global>{`
        /* Action plan row dropdown: match the "triple-dot" menu UI. */
        .action-plan-row-actions-menu.ant-dropdown
          .ant-dropdown-menu
          .ant-dropdown-menu-item {
          padding: 10px 16px !important;
          font-size: 16px !important;
          line-height: 22px !important;
          min-height: 0 !important;
        }

        .action-plan-row-actions-menu.ant-dropdown .ant-dropdown-menu {
          border-radius: 12px !important;
        }

        .action-plan-row-actions-menu.ant-dropdown
          .ant-dropdown-menu-item:hover {
          background: #f5f5f5 !important;
        }

        .responsible-hidden-users-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .responsible-hidden-users-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </div>
  );
}

export default ActionPlans;
