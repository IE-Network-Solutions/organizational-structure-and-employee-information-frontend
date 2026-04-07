// app/action-plans/page.tsx
'use client';

import {
  Table,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Tooltip,
  Form,
  Button,
  Popover,
} from 'antd';
import {
  CloseOutlined,
  LeftOutlined,
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetCombinedActionPlan } from '@/store/server/features/CFR/meeting/action-plan/queries';
import { ActionPlanSourceType } from '@/types/enumTypes';
import CustomPagination from '@/components/customPagination';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
// import StatusDropdown from '@/components/action-plan/StatusDropdown';
import { MdOutlineFilterAlt } from 'react-icons/md';
const { Option } = Select;
const { RangePicker } = DatePicker;

const priorityColors = {
  high: 'red',
  medium: 'orange',
  low: 'green',
};

const capitalizeFirstLetter = (value: any) => {
  if (!value) return value;
  const str = String(value).trim();
  if (!str) return value;
  const normalized = str.replace(/_/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const EmployeeDetails = ({
  empId,
  type,
}: {
  empId: string;
  type: 'avatar' | 'all';
}) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading) return <LoadingOutlined />;
  if (error || !userDetails) return null;

  const userName =
    `${userDetails.firstName} ${userDetails.middleName} ${userDetails.lastName}`.trim();
  const profileImage = userDetails.profileImage;

  // ✅ If just showing avatar (inside Avatar.Group), return Avatar directly
  if (type === 'avatar') {
    return (
      <Tooltip
        title={userName}
        data-cy={`feedback-action-plan-tooltip-employee-${empId}`}
        id={`feedback-action-plan-tooltip-employee-${empId}`}
      >
        <Avatar
          src={profileImage}
          icon={
            <UserOutlined
              id={`feedback-action-plan-avatar-employee-${empId}`}
              data-cy="feedback-action-plan-avatar-employee-icon"
            />
          }
          data-cy={`feedback-action-plan-avatar-employee-${empId}`}
        >
          {!profileImage && userName[0]}
        </Avatar>
      </Tooltip>
    );
  }

  // ✅ For 'all' type — full display
  return (
    <div
      key={empId}
      className="flex gap-2 items-center"
      data-cy={`feedback-action-plan-div-employee-${empId}`}
      id={`feedback-action-plan-div-employee-${empId}`}
    >
      <Avatar
        src={profileImage}
        icon={
          <UserOutlined
            id={`feedback-action-plan-avatar-employee-full-${empId}`}
            data-cy="feedback-action-plan-avatar-employee-full-icon"
          />
        }
        data-cy={`feedback-action-plan-avatar-employee-full-${empId}`}
      >
        {!profileImage && userName[0]}
      </Avatar>
      <span
        data-cy={`feedback-action-plan-span-employee-name-${empId}`}
        id={`feedback-action-plan-span-employee-name-${empId}`}
      >
        {userName}
      </span>
    </div>
  );
};
const issueActionsCellClass =
  'text-sm font-normal text-black/70 max-w-[220px] sm:max-w-[280px] leading-snug line-clamp-2 break-words';

// Table columns (order matches design: Name → Issues → Type → Deadline → Responsible → Status → Priority → Actions)
const columns: ColumnsType<any> = [
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-name"
      >
        Name
      </span>
    ),
    dataIndex: 'name',
    render: (text, record) => (
      <p
        className="text-sm font-normal text-black/70 max-w-[160px] truncate"
        data-cy={`feedback-action-plan-table-cell-name-${record.key}`}
        id={`feedback-action-plan-table-cell-name-${record.key}`}
      >
        {text || '—'}
      </p>
    ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-issues"
      >
        Issues
      </span>
    ),
    dataIndex: 'issue',
    render: (text, record) => (
      <p
        className={issueActionsCellClass}
        data-cy={`feedback-action-plan-table-cell-issue-${record.key}`}
        id={`feedback-action-plan-table-cell-issue-${record.key}`}
      >
        {text || '—'}
      </p>
    ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-type"
      >
        Type
      </span>
    ),
    dataIndex: 'sourceType',
    render: (val, record) => (
      <p
        className="text-sm font-normal text-black/70 max-w-[120px] truncate"
        data-cy={`feedback-action-plan-table-cell-type-${record.key}`}
        id={`feedback-action-plan-table-cell-type-${record.key}`}
      >
        {val ? capitalizeFirstLetter(val) : '—'}
      </p>
    ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-deadline"
      >
        Deadline
      </span>
    ),
    dataIndex: 'deadline',
    render: (val, record) => (
      <span
        className="text-sm font-normal text-black/70 whitespace-nowrap"
        data-cy={`feedback-action-plan-table-cell-deadline-${record.key}`}
        id={`feedback-action-plan-table-cell-deadline-${record.key}`}
      >
        {val ? dayjs(val).format('MMM D YYYY') : '—'}
      </span>
    ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-responsible"
      >
        Responsible Person
      </span>
    ),
    dataIndex: 'responsible',
    render: (users: string[] | undefined, record) => (
      <div
        className="flex min-w-[140px] items-center gap-1"
        data-cy={`feedback-action-plan-table-cell-responsible-${record.key}`}
        id={`feedback-action-plan-table-cell-responsible-${record.key}`}
      >
        {!users?.length ? (
          <span
            className="text-xs text-gray-500"
            data-cy="feedback-action-plan-table-cell-responsible-empty"
          >
            —
          </span>
        ) : users.length === 1 ? (
          <EmployeeDetails empId={users[0]} type="all" />
        ) : (
          <Avatar.Group
            max={{
              count: 2,
              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
            }}
            className="flex items-center"
            data-cy={`feedback-action-plan-avatar-group-${record.key}`}
          >
            {users.map((res) => (
              <EmployeeDetails key={res} empId={res} type="avatar" />
            ))}
          </Avatar.Group>
        )}
      </div>
    ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-status"
      >
        Status
      </span>
    ),
    dataIndex: 'status',
    render: (status: string, record) => {
      const statusLabel = String(status || '')
        .trim()
        .toLowerCase();
      let label = '';
      let colorClass = '';
      let borderClass = '';
      let bgClass = '';

      if (
        statusLabel === 'solved' ||
        statusLabel === 'resolved' ||
        statusLabel === 'completed'
      ) {
        label = 'Resolved';
        colorClass = 'text-greenbg';
        borderClass = 'border-greenbg';
        bgClass = 'bg-greenlight';
      } else if (statusLabel === 'pending') {
        label = 'Pending';
        colorClass = 'text-orangebg';
        borderClass = 'border-orangebg';
        bgClass = 'bg-lightorange';
      } else if (statusLabel === 'unresolved') {
        label = 'Unresolved';
        colorClass = 'text-error';
        borderClass = 'border-error';
        bgClass = 'bg-errorlight';
      } else {
        label = status || '-';
        colorClass = 'text-black/70';
        borderClass = 'border-gray-200';
        bgClass = 'bg-white';
      }

      return (
        <span
          className={`min-w-[60px] h-[22px] rounded-md flex items-center justify-center border text-xs font-normal ${colorClass} ${borderClass} ${bgClass}`}
          data-cy={`feedback-action-plan-table-status-${record.key}`}
          id={`feedback-action-plan-table-status-${record.key}`}
        >
          {label}
        </span>
      );
    },
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-priority"
      >
        Priority
      </span>
    ),
    dataIndex: 'priority',
    render: (priority: keyof typeof priorityColors, record) =>
      !priority ? (
        <span
          className="text-xs text-gray-500"
          data-cy={`feedback-action-plan-table-cell-priority-${record.key}`}
          id={`feedback-action-plan-table-cell-priority-${record.key}`}
        >
          —
        </span>
      ) : (
        <Tag
          bordered
          className="min-w-[60px] h-[22px] rounded-md flex items-center justify-center border text-xs font-normal capitalize"
          color={
            priorityColors[
              priority?.toString()?.toLowerCase() as keyof typeof priorityColors
            ]
          }
          data-cy={`feedback-action-plan-table-cell-priority-${record.key}`}
          id={`feedback-action-plan-table-cell-priority-${record.key}`}
        >
          {priority}
        </Tag>
      ),
  },
  {
    title: (
      <span
        className="text-base font-bold text-black/70 truncate"
        data-cy="feedback-action-plan-col-title-actions"
      >
        Actions to be done
      </span>
    ),
    dataIndex: 'description',
    render: (text, record) => (
      <p
        className={issueActionsCellClass}
        data-cy={`feedback-action-plan-table-cell-description-${record.key}`}
        id={`feedback-action-plan-table-cell-description-${record.key}`}
      >
        {text || '—'}
      </p>
    ),
  },
];

// Backend JSON data

// Convert API response to table-compatible format

export default function ActionPlansPage() {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const { data: allUsers } = useGetAllUsers();
  const { userData, userId } = useAuthenticationStore();
  const isUserRole = userData?.role?.slug?.toLowerCase() === 'user';
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));
  const formEmpId = Form.useWatch('empId', form) || null;
  // If user role, automatically filter by their own userId, otherwise use form value
  const empId = isUserRole ? userId : formEmpId;
  const formSourceType = Form.useWatch('sourceType', form) || null;
  const typeFromUrl = searchParams?.get('type')?.trim().toLowerCase();
  const sourceTypeFromUrl =
    typeFromUrl === 'meeting'
      ? ActionPlanSourceType.MEETING
      : typeFromUrl === 'survey'
        ? ActionPlanSourceType.SURVEY
        : null;
  const sourceType = formSourceType || sourceTypeFromUrl || null;
  const priority = Form.useWatch('priority', form) || null;
  const status = Form.useWatch('status', form) || null;
  const dateRange = Form.useWatch('dateRange', form) || null;
  const startAt = dateRange
    ? dayjs(dateRange[0]).startOf('day').toISOString()
    : null;
  const endAt = dateRange
    ? dayjs(dateRange[1]).endOf('day').toISOString()
    : null;
  // 👇 Trigger callback when any field changes
  // useEffect(() => {
  // }, [search, priority, status, dateRange])
  const { pageSizeAction, currentAction, setCurrentAction, setPagesizeAction } =
    useMeetingStore();
  const { data: actionPlan, isLoading } = useGetCombinedActionPlan({
    page: currentAction,
    limit: pageSizeAction,
    status,
    userId: empId,
    completionStartDate: startAt,
    completionEndDate: endAt,
    sourceType,
    priority,
  });
  const data = actionPlan?.items?.map((item: any) => ({
    key: item.id,
    name: item?.name ?? item?.sourceName ?? '—',
    sourceType: item?.type ?? item?.sourceType ?? null,
    issue: item?.description ?? item?.issue,
    description: item?.actionToBeTaken ?? item?.description,
    deadline: item.deadline,
    priority: item.priority,
    status: item.status,
    responsible:
      item?.responsiblePerson ||
      item?.responsibleUsers?.map((ru: any) => ru.responsibleId) ||
      [],
  }));
  const { isMobile } = useIsMobile();
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sourceTypeFromUrl && !form.getFieldValue('sourceType')) {
      form.setFieldValue('sourceType', sourceTypeFromUrl);
    }
  }, [form, sourceTypeFromUrl]);

  const breadcrumbSubtitle = (
    <span
      className="text-black/45 text-sm font-medium"
      data-cy="feedback-action-plan-breadcrumb-subtitle"
    >
      <Link
        href="/feedback/conversation"
        className="text-slate-500 hover:text-slate-700"
        data-cy="feedback-action-plan-breadcrumb-dashboard-link"
      >
        Conversation
      </Link>
      <span data-cy="feedback-action-plan-breadcrumb-separator"> / </span>
      <span
        className="text-black/70 font-normal"
        data-cy="feedback-action-plan-breadcrumb-current"
      >
        Action Plan
      </span>
    </span>
  );

  return (
    <div
      className="min-h-full py-4"
      data-cy="feedback-action-plan-page-div"
      id="feedback-action-plan-page-div"
    >
      <div
        className="mb-5 flex items-center gap-3"
        data-cy="feedback-action-plan-page-div-header"
        id="feedback-action-plan-page-div-header"
      >
        <Button
          type="default"
          className="!flex h-9 w-9 shrink-0 items-center justify-center !p-0"
          icon={<LeftOutlined />}
          onClick={() => router.back()}
          aria-label="Go back"
          data-cy="feedback-action-plan-back-button"
        />
        <div
          className="min-w-0 flex-1"
          data-cy="feedback-action-plan-page-div-title-section"
          id="feedback-action-plan-page-div-title-section"
        >
          <CustomBreadcrumb
            title="Action Plan"
            subtitle={breadcrumbSubtitle}
            compact
          />
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          search: '',
          meetingType: null,
          departments: [],
          dateRange: null,
          sourceType: null,
        }}
        data-cy="feedback-action-plan-page-form"
        id="feedback-action-plan-page-form"
      >
        <div
          id="feedback-action-plan-page-card-inner"
          className="rounded-lg border border-gray-200 bg-white shadow-sm"
          data-cy="feedback-action-plan-page-card"
        >
          <div
            className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
            data-cy="feedback-action-plan-page-toolbar"
          >
            <Form.Item
              name="empId"
              className="m-0 w-[300px] flex-1 md:max-w-md"
              data-cy="feedback-action-plan-page-form-item-employee"
              id="feedback-action-plan-page-form-item-employee"
            >
              <Select
                showSearch
                allowClear
                maxTagCount={1}
                placeholder="Search Employee"
                options={peopleOptions}
                suffixIcon={
                  <div
                    className="border-l border-gray-200 h-8 flex items-center justify-center "
                    data-cy="feedback-action-plan-select-employee-suffix"
                  >
                    <SearchOutlined className="text-gray-400 ml-2" />
                  </div>
                }
                filterOption={(input: string, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="h-8 "
                data-cy="feedback-action-plan-page-select-employee"
                id="feedback-action-plan-page-select-employee"
                // disabled={!isOwner || isUserRole}
              />
            </Form.Item>
            <Popover
              trigger="click"
              placement={isMobile ? 'bottom' : 'bottomRight'}
              open={isFilterPopoverOpen}
              onOpenChange={setIsFilterPopoverOpen}
              getPopupContainer={(trigger) =>
                trigger.closest('#feedback-action-plan-page-card-inner') ??
                document.body
              }
              content={
                <div
                  className="w-[543px] rounded-xl bg-white px-5 py-2"
                  data-cy="feedback-action-plan-filter-popover-content"
                >
                  <div
                    className="mb-5 flex items-center justify-between"
                    data-cy="feedback-action-plan-filter-popover-header"
                  >
                    <h3
                      className="text-base font-bold leading-none text-black/70"
                      data-cy="feedback-action-plan-filter-popover-title"
                    >
                      Filter
                    </h3>
                    <Button
                      type="text"
                      icon={
                        <CloseOutlined className="text-base text-black/70" />
                      }
                      onClick={() => setIsFilterPopoverOpen(false)}
                      className="!h-8 !w-8 !p-0"
                      data-cy="feedback-action-plan-filter-popover-close"
                    />
                  </div>

                  <div
                    className="max-h-[min(70vh,28rem)] space-y-5 overflow-y-auto pr-1"
                    data-cy="feedback-action-plan-filter-popover-fields"
                  >
                    <div
                      className="grid grid-cols-1 gap-4 md:grid-cols-3"
                      data-cy="feedback-action-plan-filter-grid"
                    >
                      <Form.Item
                        name="sourceType"
                        className="mb-0"
                        label={
                          <span
                            className="text-base font-normal text-black/70"
                            data-cy="feedback-action-plan-filter-label-type"
                          >
                            Type{' '}
                            <span
                              className="text-red-500"
                              data-cy="feedback-action-plan-filter-label-type-required"
                            >
                              *
                            </span>
                          </span>
                        }
                        data-cy="feedback-action-plan-filter-form-item-source-type"
                        id="feedback-action-plan-filter-form-item-source-type"
                      >
                        <Select
                          allowClear
                          className="h-10 w-full "
                          placeholder="Select"
                          data-cy="feedback-action-plan-filter-select-source-type"
                          id="feedback-action-plan-filter-select-source-type"
                        >
                          <Option
                            value={ActionPlanSourceType.MEETING}
                            data-cy="feedback-action-plan-filter-option-source-meeting"
                            id="feedback-action-plan-filter-option-source-meeting"
                          >
                            Meeting
                          </Option>
                          <Option
                            value={ActionPlanSourceType.SURVEY}
                            data-cy="feedback-action-plan-filter-option-source-survey"
                            id="feedback-action-plan-filter-option-source-survey"
                          >
                            Survey
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="status"
                        className="mb-0"
                        label={
                          <span
                            className="text-base font-normal text-black/70"
                            data-cy="feedback-action-plan-filter-label-status"
                          >
                            Status{' '}
                            <span
                              className="text-red-500"
                              data-cy="feedback-action-plan-filter-label-status-required"
                            >
                              *
                            </span>
                          </span>
                        }
                        data-cy="feedback-action-plan-filter-form-item-status"
                        id="feedback-action-plan-filter-form-item-status"
                      >
                        <Select
                          allowClear
                          className="h-10 w-full "
                          placeholder="Select"
                          data-cy="feedback-action-plan-filter-select-status"
                          id="feedback-action-plan-filter-select-status"
                        >
                          <Option
                            value="Pending"
                            data-cy="feedback-action-plan-filter-option-status-pending"
                            id="feedback-action-plan-filter-option-status-pending"
                          >
                            Pending
                          </Option>
                          <Option
                            value="In_Progress"
                            data-cy="feedback-action-plan-filter-option-status-in-progress"
                            id="feedback-action-plan-filter-option-status-in-progress"
                          >
                            In progress
                          </Option>
                          <Option
                            value="Completed"
                            data-cy="feedback-action-plan-filter-option-status-completed"
                            id="feedback-action-plan-filter-option-status-completed"
                          >
                            Completed
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="priority"
                        className="mb-0"
                        label={
                          <span
                            className="text-base font-normal text-black/70"
                            data-cy="feedback-action-plan-filter-label-priority"
                          >
                            Priority{' '}
                            <span
                              className="text-red-500"
                              data-cy="feedback-action-plan-filter-label-priority-required"
                            >
                              *
                            </span>
                          </span>
                        }
                        data-cy="feedback-action-plan-filter-form-item-priority"
                        id="feedback-action-plan-filter-form-item-priority"
                      >
                        <Select
                          allowClear
                          className="h-10 w-full "
                          placeholder="Select"
                          data-cy="feedback-action-plan-filter-select-priority"
                          id="feedback-action-plan-filter-select-priority"
                        >
                          <Option
                            value="High"
                            data-cy="feedback-action-plan-filter-option-priority-high"
                            id="feedback-action-plan-filter-option-priority-high"
                          >
                            High
                          </Option>
                          <Option
                            value="Medium"
                            data-cy="feedback-action-plan-filter-option-priority-medium"
                            id="feedback-action-plan-filter-option-priority-medium"
                          >
                            Medium
                          </Option>
                          <Option
                            value="Low"
                            data-cy="feedback-action-plan-filter-option-priority-low"
                            id="feedback-action-plan-filter-option-priority-low"
                          >
                            Low
                          </Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="dateRange"
                      className="mb-0 !mt-1"
                      label={
                        <span
                          className="text-base font-normal text-black/70"
                          data-cy="feedback-action-plan-filter-label-date"
                        >
                          Date{' '}
                          <span
                            className="text-red-500"
                            data-cy="feedback-action-plan-filter-label-date-required"
                          >
                            *
                          </span>
                        </span>
                      }
                      data-cy="feedback-action-plan-filter-form-item-date-range"
                      id="feedback-action-plan-filter-form-item-date-range"
                    >
                      <RangePicker
                        allowClear
                        className="h-10 w-full "
                        format="DD MMM YYYY"
                        placeholder={['Start date', 'End date']}
                        data-cy="feedback-action-plan-filter-range-picker"
                        id="feedback-action-plan-filter-range-picker"
                      />
                    </Form.Item>
                  </div>
                  <div
                    className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3"
                    data-cy="feedback-action-plan-filter-popover-footer"
                  >
                    <Button
                      onClick={() => setIsFilterPopoverOpen(false)}
                      className="h-8 min-w-[68px] rounded-md border-[#D9D9D9] border"
                      data-cy="feedback-action-plan-filter-button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => setIsFilterPopoverOpen(false)}
                      className="h-8 min-w-[68px] rounded-md bg-[#1f40be] !border-none"
                      data-cy="feedback-action-plan-filter-button-apply"
                    >
                      Filter
                    </Button>
                  </div>
                </div>
              }
              data-cy="feedback-action-plan-filter-popover"
            >
              <Button
                type="default"
                className="flex h-8 items-center justify-center gap-2 border-gray-300 md:w-auto text-black/70 font-normal"
                icon={<MdOutlineFilterAlt size={16} className="mt-1" />}
                data-cy="feedback-action-plan-page-button-filter"
              >
                Filter
              </Button>
            </Popover>
          </div>

          <div
            className="overflow-x-auto   scrollbar-none"
            data-cy="feedback-action-plan-page-div-table-container"
            id="feedback-action-plan-page-div-table-container"
          >
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              loading={isLoading}
              scroll={{ x: 'max-content' }}
              rowKey="key"
              rowClassName={(rowRecord, index) =>
                index % 2 == 0 ? 'bg-white' : 'bg-[#fafafa]'
              }
              className="action-plan-table [&_.ant-table]:rounded-none"
              data-cy="feedback-action-plan-page-table"
              id="feedback-action-plan-page-table"
            />
          </div>

          <div
            className="border-t border-gray-100 px-2 py-3 md:px-4"
            data-cy="feedback-action-plan-page-pagination-wrap"
          >
            <CustomPagination
              current={actionPlan?.meta?.currentPage || 1}
              total={actionPlan?.meta?.totalItems || 1}
              pageSize={pageSizeAction}
              onChange={(page, pageSize) => {
                setCurrentAction(page);
                setPagesizeAction(pageSize);
              }}
              onShowSizeChange={(size) => {
                setPagesizeAction(size);
                setCurrentAction(1);
              }}
              data-cy="feedback-action-plan-page-pagination"
            />
          </div>
        </div>
      </Form>
    </div>
  );
}
