'use client';
import React, { useMemo, useState } from 'react';
import { Avatar, Empty, Form, Input, Select, Table } from 'antd';
import type { TableColumnsType, TableRowSelection } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { MOCK_POSITIONS } from './stepRoleSelection';
import { SUCCESSOR_AVATAR_COLOR } from '../personRoleChrome';
import type { SuccessorReadiness } from '../successionTypes';
import type { EducationField, EducationLevel } from '../educationCatalog';
import { formatEducationLabel } from '../educationCatalog';

const { Option } = Select;

export interface SuccessorCandidate {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  readiness?: SuccessorReadiness;
  educationLevel?: EducationLevel;
  educationField?: EducationField;
  /** Derived display label from level + field. */
  education?: string;
  /** Years of relevant experience (from employee record / mock). */
  relevantExperience?: number;
  /** Org position id for the employee's current role (from system). */
  currentPositionId?: string;
  currentPosition?: string;
}

/**
 * Experience years aligned to seeded critical-role requirements so readiness
 * matches shortfalls (never e.g. 5-year gap labeled "Ready within 1 Year"):
 * - CEO (11y): Marcus 10 → Ready within 1 Year
 * - VP Eng (10y): Lena 9 / Marcus 10 / Aiko 12
 * - Head of Finance (8y): Daniel 9
 * - Director of People (8y): Amara 11 / Ravi 7
 * - Head of Sales (8y): Kwame 10 / Nina 7 / Sofia 9
 */
export const MOCK_EMPLOYEES: SuccessorCandidate[] = (
  [
    {
      id: 'emp-1',
      name: 'Lena Fischer',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      readiness: 'Ready within 1 Year',
      educationLevel: 'Master',
      educationField: 'Computer Science',
      relevantExperience: 9,
      currentPositionId: 'pos-11',
      currentPosition: 'Senior Software Engineer',
    },
    {
      id: 'emp-2',
      name: 'Marcus Webb',
      jobTitle: 'Engineering Manager',
      department: 'Engineering',
      readiness: 'Ready within 1 Year',
      educationLevel: 'Bachelor',
      educationField: 'Software Engineering',
      relevantExperience: 10,
      currentPositionId: 'pos-9',
      currentPosition: 'Engineering Manager',
    },
    {
      id: 'emp-3',
      name: 'Aiko Yamamoto',
      jobTitle: 'Principal Engineer',
      department: 'Engineering',
      readiness: 'Ready Now',
      educationLevel: 'Master',
      educationField: 'Electrical Engineering',
      relevantExperience: 12,
      currentPositionId: 'pos-12',
      currentPosition: 'Principal Engineer',
    },
    {
      id: 'emp-4',
      name: 'Daniel Mensah',
      jobTitle: 'Finance Manager',
      department: 'Finance',
      readiness: 'Ready Now',
      educationLevel: 'Master',
      educationField: 'Business Administration',
      relevantExperience: 9,
      currentPositionId: 'pos-13',
      currentPosition: 'Finance Manager',
    },
    {
      id: 'emp-5',
      name: 'Priya Nair',
      jobTitle: 'Financial Analyst',
      department: 'Finance',
      readiness: 'Ready within 3+ Years',
      educationLevel: 'Bachelor',
      educationField: 'Accounting',
      relevantExperience: 4,
      currentPositionId: 'pos-14',
      currentPosition: 'Financial Analyst',
    },
    {
      id: 'emp-6',
      name: 'Amara Diallo',
      jobTitle: 'HR Business Partner',
      department: 'Human Resources',
      readiness: 'Ready Now',
      educationLevel: 'Master',
      educationField: 'Human Resource Management',
      relevantExperience: 11,
      currentPositionId: 'pos-15',
      currentPosition: 'HR Business Partner',
    },
    {
      id: 'emp-7',
      name: 'Ravi Sharma',
      jobTitle: 'Talent Acquisition Lead',
      department: 'Human Resources',
      readiness: 'Ready within 1 Year',
      educationLevel: 'Bachelor',
      educationField: 'Psychology',
      relevantExperience: 7,
      currentPositionId: 'pos-16',
      currentPosition: 'Talent Acquisition Lead',
    },
    {
      id: 'emp-8',
      name: 'Kwame Asante',
      jobTitle: 'Sales Manager',
      department: 'Sales',
      readiness: 'Ready Now',
      educationLevel: 'Bachelor',
      educationField: 'Business Administration',
      relevantExperience: 10,
      currentPositionId: 'pos-10',
      currentPosition: 'Sales Manager',
    },
    {
      id: 'emp-9',
      name: 'Nina Kovacs',
      jobTitle: 'Account Executive',
      department: 'Sales',
      readiness: 'Ready within 1 Year',
      educationLevel: 'Bachelor',
      educationField: 'Marketing',
      relevantExperience: 7,
      currentPositionId: 'pos-17',
      currentPosition: 'Account Executive',
    },
    {
      id: 'emp-10',
      name: 'Carlos Rivera',
      jobTitle: 'Product Manager',
      department: 'Product',
      readiness: 'Ready within 1 Year',
      educationLevel: 'Bachelor',
      educationField: 'Information Systems',
      relevantExperience: 7,
      currentPositionId: 'pos-18',
      currentPosition: 'Product Manager',
    },
    {
      id: 'emp-11',
      name: 'Sofia Johansson',
      jobTitle: 'Senior Product Manager',
      department: 'Product',
      readiness: 'Ready Now',
      educationLevel: 'Master',
      educationField: 'Business Administration',
      relevantExperience: 9,
      currentPositionId: 'pos-19',
      currentPosition: 'Senior Product Manager',
    },
    {
      id: 'emp-12',
      name: 'Helen Park',
      jobTitle: 'Operations Lead',
      department: 'Operations',
      readiness: 'Ready Now',
      educationLevel: 'Bachelor',
      educationField: 'Operations Management',
      relevantExperience: 8,
      currentPositionId: 'pos-20',
      currentPosition: 'Operations Lead',
    },
  ] as const satisfies ReadonlyArray<
    Omit<SuccessorCandidate, 'education' | 'readiness'> & {
      educationLevel: EducationLevel;
      educationField: EducationField;
      relevantExperience: number;
      currentPositionId: string;
      readiness: SuccessorReadiness;
    }
  >
).map((emp) => ({
  ...emp,
  education: formatEducationLabel(emp.educationLevel, emp.educationField),
}));

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
