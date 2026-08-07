'use client';
import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import {
  MOCK_DEPARTMENTS,
  MOCK_POSITIONS,
  resolvePositionDepartment,
} from './steps/stepRoleSelection';

interface DepartmentPositionSelectProps {
  /** Form field name for department filter (string department name in mock). */
  departmentFieldName: string;
  /** Form field name for selected position id(s). */
  positionFieldName: string;
  departmentLabel?: string;
  positionLabel?: string;
  required?: boolean;
  /** Allow selecting multiple positions (role requirements). */
  multiple?: boolean;
  className?: string;
  departmentDataCy?: string;
  positionDataCy?: string;
}

/**
 * Department + Position selects matching employee job forms:
 * searchable department, then searchable position filtered by department.
 * Uses succession MOCK_POSITIONS until org APIs are wired.
 */
const DepartmentPositionSelect: React.FC<DepartmentPositionSelectProps> = ({
  departmentFieldName,
  positionFieldName,
  departmentLabel = 'Department',
  positionLabel = 'Position',
  required = true,
  multiple = false,
  className,
  departmentDataCy = 'department-select',
  positionDataCy = 'position-select',
}) => {
  const form = Form.useFormInstance();
  const selectedDepartment = Form.useWatch(departmentFieldName, form) as
    | string
    | undefined;

  const positionOptions = useMemo(() => {
    const list = selectedDepartment
      ? MOCK_POSITIONS.filter((p) => p.department === selectedDepartment)
      : MOCK_POSITIONS;
    return list.map((p) => ({
      value: p.id,
      label: p.title,
      department: p.department,
    }));
  }, [selectedDepartment]);

  return (
    <div
      className={
        className ?? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'
      }
    >
      <Form.Item
        name={departmentFieldName}
        label={
          <span className="text-sm font-medium text-gray-700">
            {departmentLabel}
          </span>
        }
        rules={
          required && !multiple
            ? [{ required: true, message: 'Please select a department' }]
            : undefined
        }
        className="!mb-0"
        data-cy={`${departmentDataCy}-item`}
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Select a department"
          className="w-full h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!leading-8"
          options={MOCK_DEPARTMENTS.map((name) => ({
            value: name,
            label: name,
          }))}
          onChange={(dept: string | undefined) => {
            if (multiple) return;
            const currentPosId = form.getFieldValue(positionFieldName) as
              | string
              | undefined;
            if (
              currentPosId &&
              resolvePositionDepartment(currentPosId) !== dept
            ) {
              form.setFieldValue(positionFieldName, undefined);
            }
          }}
          data-cy={departmentDataCy}
        />
      </Form.Item>

      <Form.Item
        name={positionFieldName}
        label={
          <span className="text-sm font-medium text-gray-700">
            {positionLabel}
          </span>
        }
        rules={
          required
            ? [
                {
                  required: true,
                  message: multiple
                    ? 'Please select at least one position'
                    : 'Please select a position',
                },
              ]
            : undefined
        }
        className="mb-0"
        data-cy={`${positionDataCy}-item`}
      >
        <Select
          mode={multiple ? 'multiple' : undefined}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={
            multiple
              ? 'Search and select one or more positions'
              : 'Search or select a position'
          }
          className="w-full h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-overflow]:!flex-nowrap [&_.ant-select-selection-item]:!leading-[22px] [&_.ant-select-selection-placeholder]:!leading-8"
          options={positionOptions}
          maxTagCount="responsive"
          onChange={(value: string | string[] | undefined) => {
            if (multiple || !value || Array.isArray(value)) return;
            const dept = resolvePositionDepartment(value);
            if (dept && form.getFieldValue(departmentFieldName) !== dept) {
              form.setFieldValue(departmentFieldName, dept);
            }
          }}
          data-cy={positionDataCy}
        />
      </Form.Item>
    </div>
  );
};

export default DepartmentPositionSelect;
