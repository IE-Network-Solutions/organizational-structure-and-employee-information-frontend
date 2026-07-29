'use client';
import React from 'react';
import { Form, Select, Input, Tag } from 'antd';

const { Option, OptGroup } = Select;
const { TextArea } = Input;

// ── Mock org positions pulled from the org & emp module ──────────────────────
export const MOCK_POSITIONS = [
  {
    id: 'pos-1',
    title: 'Chief Executive Officer',
    department: 'Executive',
    currentEmployee: 'Samuel Tesfaye',
    reportingTo: null,
  },
  {
    id: 'pos-2',
    title: 'Chief Operating Officer',
    department: 'Executive',
    currentEmployee: 'Grace Mengistu',
    reportingTo: 'Chief Executive Officer',
  },
  {
    id: 'pos-3',
    title: 'VP of Engineering',
    department: 'Engineering',
    currentEmployee: 'Daniel Bekele',
    reportingTo: 'Chief Executive Officer',
  },
  {
    id: 'pos-4',
    title: 'VP of Finance',
    department: 'Finance',
    currentEmployee: 'Marta Hailu',
    reportingTo: 'Chief Executive Officer',
  },
  {
    id: 'pos-5',
    title: 'Head of Product',
    department: 'Product',
    currentEmployee: 'Yonas Alemu',
    reportingTo: 'VP of Engineering',
  },
  {
    id: 'pos-6',
    title: 'Head of Sales',
    department: 'Sales',
    currentEmployee: 'Tigist Worku',
    reportingTo: 'Chief Operating Officer',
  },
  {
    id: 'pos-7',
    title: 'Director of People',
    department: 'Human Resources',
    currentEmployee: 'Hana Girma',
    reportingTo: 'Chief Operating Officer',
  },
  {
    id: 'pos-8',
    title: 'Head of Finance',
    department: 'Finance',
    currentEmployee: 'Bereket Tadesse',
    reportingTo: 'VP of Finance',
  },
  {
    id: 'pos-9',
    title: 'Engineering Manager',
    department: 'Engineering',
    currentEmployee: 'Selam Negash',
    reportingTo: 'VP of Engineering',
  },
  {
    id: 'pos-10',
    title: 'Sales Manager',
    department: 'Sales',
    currentEmployee: 'Abebe Demeke',
    reportingTo: 'Head of Sales',
  },
];

// Group positions by department for the OptGroup select
const groupedByDepartment = MOCK_POSITIONS.reduce<
  Record<string, typeof MOCK_POSITIONS>
>((acc, pos) => {
  if (!acc[pos.department]) acc[pos.department] = [];
  acc[pos.department].push(pos);
  return acc;
}, {});

interface StepRoleSelectionProps {
  form: any;
}

const StepRoleSelection: React.FC<StepRoleSelectionProps> = ({ form }) => {
  const selectedId = Form.useWatch('positionId', form);
  const selected = MOCK_POSITIONS.find((p) => p.id === selectedId);

  return (
    <div
      className="flex flex-col gap-6 pt-2"
      data-cy="step-role-selection-container"
    >
      <p className="text-sm text-gray-500 -mt-2">
        Select a position from the organizational structure to define as a
        critical role.
      </p>

      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        data-cy="step-role-selection-primary-fields"
      >
        <Form.Item
          name="positionId"
          label={
            <span className="text-sm font-medium text-gray-700">
              Position / Role
            </span>
          }
          rules={[{ required: true, message: 'Please select a position' }]}
          data-cy="step-role-selection-position-item"
        >
          <Select
            showSearch
            placeholder="Search or select a position..."
            className="w-full h-10"
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            data-cy="step-role-selection-position-select"
          >
            {Object.entries(groupedByDepartment).map(([dept, positions]) => (
              <OptGroup key={dept} label={dept}>
                {positions.map((pos) => (
                  <Option
                    key={pos.id}
                    value={pos.id}
                    label={pos.title}
                    data-cy={`position-option-${pos.id}`}
                  >
                    <div className="flex flex-col py-0.5">
                      <span className="text-sm font-medium text-gray-800">
                        {pos.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        {pos.department}
                      </span>
                    </div>
                  </Option>
                ))}
              </OptGroup>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label={
            <span className="text-sm font-medium text-gray-700">Priority</span>
          }
          rules={[{ required: true, message: 'Please select a priority' }]}
          data-cy="step-role-selection-priority-item"
        >
          <Select
            placeholder="Select priority level"
            className="w-full h-10"
            data-cy="step-role-selection-priority-select"
          >
            <Option value="Critical">Critical</Option>
            <Option value="High">High</Option>
            <Option value="Medium">Medium</Option>
          </Select>
        </Form.Item>
      </div>

      {/* Detail tags shown after a position is selected */}
      {selected && (
        <div
          className="flex flex-wrap gap-2"
          data-cy="step-role-selection-preview-tags"
        >
          {/* Department */}
          <Tag
            className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
            data-cy="preview-tag-department"
          >
            {selected.department}
          </Tag>

          {/* Current Employee */}
          <Tag
            className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
            data-cy="preview-tag-current-employee"
          >
            {selected.currentEmployee}
          </Tag>

          {/* Reports To — only when present */}
          {selected.reportingTo && (
            <Tag
              className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
              data-cy="preview-tag-reporting"
            >
              Reports to: {selected.reportingTo}
            </Tag>
          )}
        </div>
      )}

      {/* Notes — optional */}
      <Form.Item
        name="notes"
        label={
          <span className="text-sm font-medium text-gray-700">
            Notes{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </span>
        }
        data-cy="step-role-selection-notes-item"
      >
        <TextArea
          rows={3}
          placeholder="Add any context about why this role is critical..."
          data-cy="step-role-selection-notes-textarea"
        />
      </Form.Item>
    </div>
  );
};

export default StepRoleSelection;
