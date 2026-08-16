'use client';
import React, { useMemo, useState } from 'react';
import { Avatar, Empty, Form, Input, Select, Table } from 'antd';
import type { TableColumnsType, TableRowSelection } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { SUCCESSOR_AVATAR_COLOR } from '../personRoleChrome';
import type { SuccessorReadiness } from '../successionTypes';
import type { EducationField, EducationLevel } from '../educationCatalog';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';

const { Option } = Select;

export interface SuccessorCandidate {
  /**
   * In the wizard this is the employee id being nominated. Once persisted,
   * `id` becomes the backend nomination row id and `userId` carries the
   * employee — see `mapCriticalRole`.
   */
  id: string;
  /** Core user id. Present on successors loaded from the API. */
  userId?: string;
  name: string;
  jobTitle: string;
  department: string;
  /** Core department id of the employee's active job info, when known. */
  departmentId?: string;
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

const th = 'text-[#4d4d4d] text-sm font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

interface StepEmployeeSelectionProps {
  positionId: string | null;
}

const StepEmployeeSelection: React.FC<StepEmployeeSelectionProps> = ({
  positionId,
}) => {
  const form = Form.useFormInstance();
  const { employees, positions, isLoading } = useSuccessionOrgData();
  const selectedIds: string[] =
    Form.useWatch('successorIds', form) ??
    form.getFieldValue('successorIds') ??
    [];

  const [searchValue, setSearchValue] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  const position = positions.find((p) => p.id === positionId);

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          employees
            .map((employee) => employee.department)
            .filter((name) => Boolean(name) && name !== '—'),
        ),
      ).sort(),
    [employees],
  );

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
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
  }, [employees, searchValue, departmentFilter]);

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
          {departmentOptions.map((dept) => (
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
        {filtered.length !== employees.length
          ? ` · showing ${filtered.length} of ${employees.length}`
          : null}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="small"
        loading={isLoading}
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
