'use client';
import React, { useMemo } from 'react';
import { Form, Select, Input, Tag } from 'antd';
import { useSuccessionOrgData } from '@/store/server/features/employees/successionPlanning/useSuccessionOrgData';

const { Option, OptGroup } = Select;
const { TextArea } = Input;

/** A position from the org structure, enriched with its current holder. */
export interface MockOrgPosition {
  id: string;
  title: string;
  department: string;
  /** Core department id of the position's current holder, when known. */
  departmentId?: string;
  currentEmployee: string | null;
  reportingTo: string | null;
}

interface StepRoleSelectionProps {
  form: any;
}

const StepRoleSelection: React.FC<StepRoleSelectionProps> = ({ form }) => {
  const { positions, isLoading } = useSuccessionOrgData();
  const selectedId = Form.useWatch('positionId', form);
  const selected = positions.find((p) => p.id === selectedId);

  /** Positions grouped by the department of whoever currently holds them. */
  const groupedPositionsByDepartment = useMemo(
    () =>
      positions.reduce<Record<string, MockOrgPosition[]>>((acc, pos) => {
        if (!acc[pos.department]) acc[pos.department] = [];
        acc[pos.department].push(pos);
        return acc;
      }, {}),
    [positions],
  );

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
            loading={isLoading}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            data-cy="step-role-selection-position-select"
          >
            {Object.entries(groupedPositionsByDepartment).map(
              ([dept, positions]) => (
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
              ),
            )}
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

      {selected && (
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="step-role-selection-preview-tags"
        >
          <Tag
            className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
            data-cy="preview-tag-department"
          >
            {selected.department}
          </Tag>

          {selected.currentEmployee ? (
            <Tag
              className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
              data-cy="preview-tag-current-employee"
            >
              {selected.currentEmployee}
            </Tag>
          ) : null}

          {selected.reportingTo ? (
            <Tag
              className="text-[#1677ff] text-sm font-normal px-3 bg-[#e6f4ff] border border-[#91caff] h-[26px] flex items-center"
              data-cy="preview-tag-reporting"
            >
              Reports to: {selected.reportingTo}
            </Tag>
          ) : null}
        </div>
      )}

      <Form.Item
        name="notes"
        label={
          <span className="text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
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
