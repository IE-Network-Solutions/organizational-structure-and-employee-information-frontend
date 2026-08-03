'use client';
import React, { useMemo, useState } from 'react';
import { Avatar, Empty, Form, Input, Select, Table } from 'antd';
import type { TableColumnsType, TableRowSelection } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { MOCK_POSITIONS } from './stepRoleSelection';
import { SUCCESSOR_AVATAR_COLOR } from '../personRoleChrome';

const { Option } = Select;

export interface SuccessorCandidate {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  readiness?: 'Ready Now' | '1-2 Years' | '3+ Years';
}

export const MOCK_EMPLOYEES: SuccessorCandidate[] = [
  {
    id: 'emp-1',
    name: 'Lena Fischer',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    readiness: 'Ready Now',
  },
  {
    id: 'emp-2',
    name: 'Marcus Webb',
    jobTitle: 'Engineering Manager',
    department: 'Engineering',
    readiness: '1-2 Years',
  },
  {
    id: 'emp-3',
    name: 'Aiko Yamamoto',
    jobTitle: 'Principal Engineer',
    department: 'Engineering',
    readiness: 'Ready Now',
  },
  {
    id: 'emp-4',
    name: 'Daniel Mensah',
    jobTitle: 'Finance Manager',
    department: 'Finance',
    readiness: '1-2 Years',
  },
  {
    id: 'emp-5',
    name: 'Priya Nair',
    jobTitle: 'Financial Analyst',
    department: 'Finance',
    readiness: '3+ Years',
  },
  {
    id: 'emp-6',
    name: 'Amara Diallo',
    jobTitle: 'HR Business Partner',
    department: 'Human Resources',
    readiness: 'Ready Now',
  },
  {
    id: 'emp-7',
    name: 'Ravi Sharma',
    jobTitle: 'Talent Acquisition Lead',
    department: 'Human Resources',
    readiness: '1-2 Years',
  },
  {
    id: 'emp-8',
    name: 'Kwame Asante',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    readiness: 'Ready Now',
  },
  {
    id: 'emp-9',
    name: 'Nina Kovacs',
    jobTitle: 'Account Executive',
    department: 'Sales',
    readiness: '1-2 Years',
  },
  {
    id: 'emp-10',
    name: 'Carlos Rivera',
    jobTitle: 'Product Manager',
    department: 'Product',
    readiness: '1-2 Years',
  },
  {
    id: 'emp-11',
    name: 'Sofia Johansson',
    jobTitle: 'Senior Product Manager',
    department: 'Product',
    readiness: 'Ready Now',
  },
  {
    id: 'emp-12',
    name: 'Helen Park',
    jobTitle: 'Operations Lead',
    department: 'Operations',
    readiness: '3+ Years',
  },
];

const DEPARTMENT_OPTIONS = Array.from(
  new Set(MOCK_EMPLOYEES.map((e) => e.department)),
).sort();

const th = 'text-[#4d4d4d] text-sm font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

interface StepEmployeeSelectionProps {
  positionId: string | null;
}

const StepEmployeeSelection: React.FC<StepEmployeeSelectionProps> = ({
  positionId,
}) => {
  const form = Form.useFormInstance();
  const selectedIds: string[] =
    Form.useWatch('successorIds', form) ??
    form.getFieldValue('successorIds') ??
    [];

  const [searchValue, setSearchValue] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  const position = MOCK_POSITIONS.find((p) => p.id === positionId);

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const q = searchValue.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      const matchesDepartment =
        !departmentFilter || emp.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [searchValue, departmentFilter]);

  const rowSelection: TableRowSelection<SuccessorCandidate> = {
    selectedRowKeys: selectedIds,
    onChange: (keys) => {
      form.setFieldsValue({ successorIds: keys as string[] });
    },
    preserveSelectedRowKeys: true,
  };

  const columns: TableColumnsType<SuccessorCandidate> = [
    {
      title: <span className={th}>Successor</span>,
      key: 'employee',
      ellipsis: true,
      render: (_: unknown, record) => (
        <div
          className="flex items-center gap-2"
          data-cy={`successor-employee-cell-${record.id}`}
        >
          <Avatar
            size={24}
            icon={<UserOutlined />}
            style={{ backgroundColor: SUCCESSOR_AVATAR_COLOR }}
            className="shrink-0"
          />
          <span className={td}>{record.name}</span>
        </div>
      ),
    },
    {
      title: <span className={th}>Position</span>,
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      ellipsis: true,
      render: (value: string) => <span className={td}>{value}</span>,
    },
    {
      title: <span className={th}>Department</span>,
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      width: 160,
      render: (value: string) => <span className={td}>{value}</span>,
    },
  ];

  return (
    <div
      className="flex flex-col gap-4 pt-2"
      data-cy="step-employee-selection-container"
    >
      <p className="text-sm text-gray-500 -mt-2">
        Select potential successors for{' '}
        {position ? (
          <span className="font-semibold text-gray-700">{position.title}</span>
        ) : (
          'this role'
        )}
        . Use search and filters to narrow the list.
      </p>

      <Form.Item name="successorIds" hidden>
        <Select mode="multiple" />
      </Form.Item>

      <div
        className="flex flex-wrap items-center gap-2 justify-between"
        data-cy="step-employee-selection-filters"
      >
        <Input
          placeholder="Search by name, position, or department"
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full sm:w-[280px] h-10"
          data-cy="step-employee-search-input"
          suffix={
            <div className="text-gray-400 border-l border-gray-300 py-1 px-2">
              <SearchOutlined />
            </div>
          }
        />
        <Select
          placeholder="Department"
          allowClear
          value={departmentFilter || undefined}
          onChange={(v) => setDepartmentFilter(v ?? '')}
          className="w-40"
          data-cy="step-employee-department-filter"
        >
          {DEPARTMENT_OPTIONS.map((dept) => (
            <Option key={dept} value={dept}>
              {dept}
            </Option>
          ))}
        </Select>
      </div>

      <div
        className="text-xs text-gray-500"
        data-cy="step-employee-selection-count"
      >
        {selectedIds.length} selected
        {filtered.length !== MOCK_EMPLOYEES.length
          ? ` · showing ${filtered.length} of ${MOCK_EMPLOYEES.length}`
          : null}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="small"
        pagination={
          filtered.length > 8
            ? { pageSize: 8, showSizeChanger: false, size: 'small' }
            : false
        }
        scroll={{ x: 560 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span
                  className="text-gray-400 text-sm"
                  data-cy="step-employee-empty"
                >
                  No employees match your search or filters.
                </span>
              }
            />
          ),
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="step-employee-selection-table"
      />
    </div>
  );
};

export default StepEmployeeSelection;
