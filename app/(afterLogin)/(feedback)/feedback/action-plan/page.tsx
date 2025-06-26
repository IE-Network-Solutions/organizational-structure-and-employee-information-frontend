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
import CustomPagination from '@/components/customPagination';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState } from 'react';
import { VscSettings } from 'react-icons/vsc';
const { Option } = Select;
const { RangePicker } = DatePicker;

// Status and Priority color mappings
const statusColors = {
  Completed: 'green',
  Pending: 'gold',
  Unresolved: 'red',
};

const priorityColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
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
      <Tooltip title={userName}>
        <Avatar src={profileImage} icon={<UserOutlined />}>
          {!profileImage && userName[0]}
        </Avatar>
      </Tooltip>
    );
  }

  // ✅ For 'all' type — full display
  return (
    <div key={empId} className="flex gap-2 items-center">
      <Avatar src={profileImage} icon={<UserOutlined />}>
        {!profileImage && userName[0]}
      </Avatar>
      <span>{userName}</span>
    </div>
  );
};
// Table Columns
const columns: ColumnsType<any> = [
  {
    title: 'Issues',
    dataIndex: 'issue',
    render: (text) => <p className="text-[12px] max-w-xs truncate">{text}</p>,
  },
  {
    title: 'Responsible person',
    dataIndex: 'responsible',
    render: (users: any[]) => (
      <div className="flex gap-1">
        {users && users.length > 1
          ? users.map((res: any, index: number) => (
              <Avatar.Group
                max={{
                  count: 2,
                  style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                }}
                className="mt-1"
                key={index}
              >
                <EmployeeDetails key={res} empId={res} type="avatar" />
              </Avatar.Group>
            ))
          : users.map((res: any) => (
              <EmployeeDetails key={res} type="all" empId={res} />
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
    render: (priority: keyof typeof priorityColors) => (
      <Tag
        className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
        color={priorityColors[priority]}
      >
        {priority}
      </Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: keyof typeof statusColors) => (
      <Tag
        className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
        color={statusColors[status]}
      >
        {status}
      </Tag>
    ),
  },
  {
    title: 'What needs to be done',
    dataIndex: 'description',
    render: (text) => <p className="text-[12px] truncate">{text}</p>,
  },
];

// Backend JSON data

// Convert API response to table-compatible format

export default function ActionPlansPage() {
  const [form] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();
  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));
  const empId = Form.useWatch('empId', form) || null;
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
  );
  const data = actionPlan?.items?.map((item: any) => ({
    key: item.id,
    issue: item.issue,
    description: item.description,
    deadline: item.deadline,
    priority: item.priority,
    status: item.status,
    responsible: item.responsibleUsers.map((ru: any) => ru.responsibleId),
  }));

  const { isMobile } = useIsMobile();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Action Plans</h2>
          <p className="text-sm text-gray-500">View all action plans</p>
        </div>
        {isMobile && (
          <div className="flex justify-end items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 text-black border border-gray-300 rounded-lg">
              <VscSettings
                size={20}
                onClick={() => setIsFilterModalOpen(true)}
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
        }}
      >
        <div
          className={`grid gap-4 items-center ${isMobile ? 'hidden' : 'grid-cols-12'}`}
        >
          <Form.Item
            name="empId"
            className={isMobile ? 'col-span-12' : 'col-span-3 my-2'}
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
            />
          </Form.Item>

          <Form.Item
            name="priority"
            className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
          >
            <Select allowClear className="h-12" placeholder="Select priority">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
          >
            <Select allowClear className="h-12" placeholder="Select status">
              <Option value="Pending">Pending</Option>
              <Option value="In_Progress">In progress </Option>
              <Option value="Completed">Completed </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            className={isMobile ? 'col-span-12' : 'col-span-3 m-0'}
          >
            <RangePicker
              allowClear
              className="w-full h-12"
              format="DD MMM YYYY"
            />
          </Form.Item>
        </div>
      </Form>
      <div className="overflow-x-auto scrollbar-none">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={isLoading}
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
      />

      <Modal
        title="Filters"
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={
          <div className="flex justify-end items-center gap-2">
            <Button key="cancel" onClick={() => setIsFilterModalOpen(false)}>
              Cancel
            </Button>
            <Button
              key="apply"
              type="primary"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        }
        width={isMobile ? '95%' : '50%'}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            search: '',
            meetingType: null,
            departments: [],
            dateRange: null,
          }}
        >
          <div className="space-y-4">
            <Form.Item name="empId" label="Employee">
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
              />
            </Form.Item>

            <Form.Item name="priority" label="Priority">
              <Select allowClear className="h-12" placeholder="Select priority">
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Status">
              <Select allowClear className="h-12" placeholder="Select status">
                <Option value="Pending">Pending</Option>
                <Option value="In_Progress">In progress </Option>
                <Option value="Completed">Completed </Option>
              </Select>
            </Form.Item>

            <Form.Item name="dateRange" label="Date Range">
              <RangePicker
                allowClear
                className="w-full h-12"
                format="DD MMM YYYY"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
