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
  Modal,
  Button,
} from 'antd';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useGetAllActionPlan } from '@/store/server/features/CFR/meeting/action-plan/queries';
import { ActionPlanSourceType } from '@/types/enumTypes';
import CustomPagination from '@/components/customPagination';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState } from 'react';
import { VscSettings } from 'react-icons/vsc';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import StatusDropdown from '@/components/action-plan/StatusDropdown';
const { Option } = Select;
const { RangePicker } = DatePicker;

// Status and Priority color mappings
const statusColors = {
  Completed: 'green',
  Pending: 'gold',
  Unresolved: 'red',
  Solved: 'green',
};

const priorityColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
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
// Table Columns
const columns: ColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text, record) => (
      <p
        className="text-[12px] max-w-xs truncate"
        data-cy={`feedback-action-plan-table-cell-name-${record.key}`}
        id={`feedback-action-plan-table-cell-name-${record.key}`}
      >
        {text || '—'}
      </p>
    ),
  },
  {
    title: 'Issues',
    dataIndex: 'issue',
    render: (text, record) => (
      <p
        className="text-[12px] max-w-xs truncate"
        data-cy={`feedback-action-plan-table-cell-issue-${record.key}`}
        id={`feedback-action-plan-table-cell-issue-${record.key}`}
      >
        {text}
      </p>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'sourceType',
    render: (val, record) => (
      <p
        className="text-[12px] max-w-xs truncate"
        data-cy={`feedback-action-plan-table-cell-type-${record.key}`}
        id={`feedback-action-plan-table-cell-type-${record.key}`}
      >
        {val ? capitalizeFirstLetter(val) : '—'}
      </p>
    ),
  },
  {
    title: 'Responsible person',
    dataIndex: 'responsible',
    render: (users: any[], record) => (
      <div
        className="flex gap-1"
        data-cy={`feedback-action-plan-table-cell-responsible-${record.key}`}
        id={`feedback-action-plan-table-cell-responsible-${record.key}`}
      >
        {users && users.length > 1
          ? users.map((res: any, index: number) => (
              <Avatar.Group
                max={{
                  count: 2,
                  style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                }}
                className="mt-1"
                key={index}
                data-cy={`feedback-action-plan-avatar-group-${record.key}-${index}`}
              >
                <EmployeeDetails
                  key={res}
                  empId={res}
                  type="avatar"
                  data-cy={`feedback-action-plan-avatar-group-${record.key}-${index}`}
                />
              </Avatar.Group>
            ))
          : users.map((res: any) => (
              <EmployeeDetails
                key={res}
                type="all"
                empId={res}
                data-cy="feedback-action-plan-avatar-group-employee-full"
              />
            ))}
      </div>
    ),
  },
  {
    title: 'Deadline',
    dataIndex: 'deadline',
    render: (val) => dayjs(val).format('MMM DD, YYYY'),
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    render: (priority: keyof typeof priorityColors, record) =>
      !priority ? (
        <span
          data-cy={`feedback-action-plan-table-cell-priority-${record.key}`}
          id={`feedback-action-plan-table-cell-priority-${record.key}`}
        >
          —
        </span>
      ) : (
        <Tag
          className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
          color={priorityColors[priority]}
          data-cy={`feedback-action-plan-table-cell-priority-${record.key}`}
          id={`feedback-action-plan-table-cell-priority-${record.key}`}
        >
          {priority}
        </Tag>
      ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: keyof typeof statusColors, record) => (
      <StatusDropdown
        actionPlanId={record.key}
        currentStatus={status}
        responsiblePerson={record.responsible || []}
        recordKey={record.key}
      />
    ),
  },
  {
    title: 'What needs to be done',
    dataIndex: 'description',
    render: (text, record) => (
      <p
        className="text-[12px] truncate"
        data-cy={`feedback-action-plan-table-cell-description-${record.key}`}
        id={`feedback-action-plan-table-cell-description-${record.key}`}
      >
        {text}
      </p>
    ),
  },
];

// Backend JSON data

// Convert API response to table-compatible format

export default function ActionPlansPage() {
  const [form] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();
  const { userData, userId } = useAuthenticationStore();
  const isOwner = userData?.role?.slug === 'owner';
  const isUserRole = userData?.role?.slug?.toLowerCase() === 'user';
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));
  const formEmpId = Form.useWatch('empId', form) || null;
  // If user role, automatically filter by their own userId, otherwise use form value
  const empId = isUserRole ? userId : formEmpId;
  const sourceType = Form.useWatch('sourceType', form) || null;
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
  const { data: actionPlan, isLoading } = useGetAllActionPlan(
    pageSizeAction,
    currentAction,
    empId,
    priority,
    status,
    startAt,
    endAt,
    sourceType,
  );
  const data = actionPlan?.items?.map((item: any) => ({
    key: item.id,
    name: item?.sourceName ?? '—',
    sourceType: item?.sourceType ?? null,
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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div
      className="p-6"
      data-cy="feedback-action-plan-page-div"
      id="feedback-action-plan-page-div"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
        data-cy="feedback-action-plan-page-div-header"
        id="feedback-action-plan-page-div-header"
      >
        <div
          data-cy="feedback-action-plan-page-div-title-section"
          id="feedback-action-plan-page-div-title-section"
        >
          <h2
            className="text-2xl font-semibold"
            data-cy="feedback-action-plan-page-h2-title"
            id="feedback-action-plan-page-h2-title"
          >
            Action Plans
          </h2>
          <p
            className="text-sm text-gray-500"
            data-cy="feedback-action-plan-page-p-subtitle"
            id="feedback-action-plan-page-p-subtitle"
          >
            View all action plans
          </p>
        </div>
        {isMobile && (
          <div
            className="flex justify-end items-center gap-2"
            data-cy="feedback-action-plan-page-div-mobile-filter"
            id="feedback-action-plan-page-div-mobile-filter"
          >
            <div
              className="flex items-center justify-center w-10 h-10 text-black border border-gray-300 rounded-lg"
              data-cy="feedback-action-plan-page-div-filter-icon-container"
              id="feedback-action-plan-page-div-filter-icon-container"
            >
              <VscSettings
                size={20}
                onClick={() => setIsFilterModalOpen(true)}
                data-cy="feedback-action-plan-page-icon-settings"
                id="feedback-action-plan-page-icon-settings"
              />
            </div>
          </div>
        )}
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
          className={`grid gap-4 items-center ${isMobile ? 'hidden' : 'grid-cols-12'}`}
          data-cy="feedback-action-plan-page-div-filters"
          id="feedback-action-plan-page-div-filters"
        >
          <Form.Item
            name="empId"
            className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
            data-cy="feedback-action-plan-page-form-item-employee"
            id="feedback-action-plan-page-form-item-employee"
          >
            <Select
              showSearch
              allowClear
              maxTagCount={1}
              placeholder="Select Employee"
              options={peopleOptions}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              className="h-12"
              data-cy="feedback-action-plan-page-select-employee"
              id="feedback-action-plan-page-select-employee"
              disabled={!isOwner || isUserRole}
            />
          </Form.Item>

          <Form.Item
            name="sourceType"
            className={isMobile ? 'col-span-12' : 'col-span-2 m-0'}
            data-cy="feedback-action-plan-page-form-item-source-type"
            id="feedback-action-plan-page-form-item-source-type"
          >
            <Select
              allowClear
              className="h-12"
              placeholder="Select type"
              data-cy="feedback-action-plan-page-select-source-type"
              id="feedback-action-plan-page-select-source-type"
            >
              <Option
                value={ActionPlanSourceType.MEETING}
                data-cy="feedback-action-plan-page-option-source-meeting"
                id="feedback-action-plan-page-option-source-meeting"
              >
                Meeting
              </Option>
              <Option
                value={ActionPlanSourceType.SURVEY}
                data-cy="feedback-action-plan-page-option-source-survey"
                id="feedback-action-plan-page-option-source-survey"
              >
                Survey
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            className={isMobile ? 'col-span-12' : 'col-span-2 m-0'}
            data-cy="feedback-action-plan-page-form-item-status"
            id="feedback-action-plan-page-form-item-status"
          >
            <Select
              allowClear
              className="h-12"
              placeholder="Select status"
              data-cy="feedback-action-plan-page-select-status"
              id="feedback-action-plan-page-select-status"
            >
              <Option
                value="Pending"
                data-cy="feedback-action-plan-page-option-status-pending"
                id="feedback-action-plan-page-option-status-pending"
              >
                Pending
              </Option>
              <Option
                value="In_Progress"
                data-cy="feedback-action-plan-page-option-status-in-progress"
                id="feedback-action-plan-page-option-status-in-progress"
              >
                In progress{' '}
              </Option>
              <Option
                value="Completed"
                data-cy="feedback-action-plan-page-option-status-completed"
                id="feedback-action-plan-page-option-status-completed"
              >
                Completed{' '}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            className={isMobile ? 'col-span-12' : 'col-span-2 m-0'}
            data-cy="feedback-action-plan-page-form-item-priority"
            id="feedback-action-plan-page-form-item-priority"
          >
            <Select
              allowClear
              className="h-12"
              placeholder="Select priority"
              data-cy="feedback-action-plan-page-select-priority"
              id="feedback-action-plan-page-select-priority"
            >
              <Option
                value="High"
                data-cy="feedback-action-plan-page-option-priority-high"
                id="feedback-action-plan-page-option-priority-high"
              >
                High
              </Option>
              <Option
                value="Medium"
                data-cy="feedback-action-plan-page-option-priority-medium"
                id="feedback-action-plan-page-option-priority-medium"
              >
                Medium
              </Option>
              <Option
                value="Low"
                data-cy="feedback-action-plan-page-option-priority-low"
                id="feedback-action-plan-page-option-priority-low"
              >
                Low
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
            data-cy="feedback-action-plan-page-form-item-date-range"
            id="feedback-action-plan-page-form-item-date-range"
          >
            <RangePicker
              allowClear
              className="w-full h-12"
              format="DD MMM YYYY"
              data-cy="feedback-action-plan-page-range-picker"
              id="feedback-action-plan-page-range-picker"
            />
          </Form.Item>
        </div>
      </Form>

      <div
        className="mt-4 overflow-x-auto scrollbar-none"
        data-cy="feedback-action-plan-page-div-table-container"
        id="feedback-action-plan-page-div-table-container"
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          data-cy="feedback-action-plan-page-table"
          id="feedback-action-plan-page-table"
        />
      </div>

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

      <Modal
        title="Filters"
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={
          <div
            className="flex justify-end items-center gap-2"
            data-cy="feedback-action-plan-page-modal-footer"
            id="feedback-action-plan-page-modal-footer"
          >
            <Button
              key="cancel"
              onClick={() => setIsFilterModalOpen(false)}
              data-cy="feedback-action-plan-page-modal-button-cancel"
              id="feedback-action-plan-page-modal-button-cancel"
            >
              Cancel
            </Button>
            <Button
              key="apply"
              type="primary"
              onClick={() => setIsFilterModalOpen(false)}
              data-cy="feedback-action-plan-page-modal-button-apply"
              id="feedback-action-plan-page-modal-button-apply"
            >
              Apply Filters
            </Button>
          </div>
        }
        width={isMobile ? '95%' : '50%'}
        centered
        data-cy="feedback-action-plan-page-modal"
      >
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
          data-cy="feedback-action-plan-page-modal-form"
          id="feedback-action-plan-page-modal-form"
        >
          <div
            className="space-y-4"
            data-cy="feedback-action-plan-page-modal-div-fields"
            id="feedback-action-plan-page-modal-div-fields"
          >
            <Form.Item
              name="empId"
              label="Employee"
              data-cy="feedback-action-plan-page-modal-form-item-employee"
              id="feedback-action-plan-page-modal-form-item-employee"
            >
              <Select
                showSearch
                allowClear
                maxTagCount={1}
                placeholder="Select Employee"
                options={peopleOptions}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="h-12"
                data-cy="feedback-action-plan-page-modal-select-employee"
                id="feedback-action-plan-page-modal-select-employee"
                disabled={!isOwner || isUserRole}
              />
            </Form.Item>

            <Form.Item
              name="sourceType"
              label="Type"
              data-cy="feedback-action-plan-page-modal-form-item-source-type"
              id="feedback-action-plan-page-modal-form-item-source-type"
            >
              <Select
                allowClear
                className="h-12"
                placeholder="Select type"
                data-cy="feedback-action-plan-page-modal-select-source-type"
                id="feedback-action-plan-page-modal-select-source-type"
              >
                <Option
                  value={ActionPlanSourceType.MEETING}
                  data-cy="feedback-action-plan-page-modal-option-source-meeting"
                  id="feedback-action-plan-page-modal-option-source-meeting"
                >
                  Meeting
                </Option>
                <Option
                  value={ActionPlanSourceType.SURVEY}
                  data-cy="feedback-action-plan-page-modal-option-source-survey"
                  id="feedback-action-plan-page-modal-option-source-survey"
                >
                  Survey
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              data-cy="feedback-action-plan-page-modal-form-item-priority"
              id="feedback-action-plan-page-modal-form-item-priority"
            >
              <Select
                allowClear
                className="h-12"
                placeholder="Select priority"
                data-cy="feedback-action-plan-page-modal-select-priority"
                id="feedback-action-plan-page-modal-select-priority"
              >
                <Option
                  value="High"
                  data-cy="feedback-action-plan-page-modal-option-priority-high"
                  id="feedback-action-plan-page-modal-option-priority-high"
                >
                  High
                </Option>
                <Option
                  value="Medium"
                  data-cy="feedback-action-plan-page-modal-option-priority-medium"
                  id="feedback-action-plan-page-modal-option-priority-medium"
                >
                  Medium
                </Option>
                <Option
                  value="Low"
                  data-cy="feedback-action-plan-page-modal-option-priority-low"
                  id="feedback-action-plan-page-modal-option-priority-low"
                >
                  Low
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              data-cy="feedback-action-plan-page-modal-form-item-status"
              id="feedback-action-plan-page-modal-form-item-status"
            >
              <Select
                allowClear
                className="h-12"
                placeholder="Select status"
                data-cy="feedback-action-plan-page-modal-select-status"
                id="feedback-action-plan-page-modal-select-status"
              >
                <Option
                  value="Pending"
                  data-cy="feedback-action-plan-page-modal-option-status-pending"
                  id="feedback-action-plan-page-modal-option-status-pending"
                >
                  Pending
                </Option>
                <Option
                  value="In_Progress"
                  data-cy="feedback-action-plan-page-modal-option-status-in-progress"
                  id="feedback-action-plan-page-modal-option-status-in-progress"
                >
                  In progress{' '}
                </Option>
                <Option
                  value="Completed"
                  data-cy="feedback-action-plan-page-modal-option-status-completed"
                  id="feedback-action-plan-page-modal-option-status-completed"
                >
                  Completed{' '}
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="Date Range"
              data-cy="feedback-action-plan-page-modal-form-item-date-range"
              id="feedback-action-plan-page-modal-form-item-date-range"
            >
              <RangePicker
                allowClear
                className="w-full h-12"
                format="DD MMM YYYY"
                data-cy="feedback-action-plan-page-modal-range-picker"
                id="feedback-action-plan-page-modal-range-picker"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
