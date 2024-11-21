'use client';

import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

interface Option {
  key: string;
  value: string;
}

interface FieldConfig {
  key: string; // Unique identifier for the field
  label: string; // Display label
  options: Option[]; // Options for the Select component
  widthRatio: number; // Width fraction (e.g., 1/2 or 1/4)
  placeholder: string; // Placeholder for the field
}

interface DynamicSearchProps {
  fields: FieldConfig[]; // Array of field configurations
  onChange: (value: any, key: string) => void; // Callback for field changes
}

const EmployeeSearch: React.FC<DynamicSearchProps> = ({ fields, onChange }) => {
  return (
    <div className="flex justify-start w-full">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`w-full md:w-${Math.round(field.widthRatio / 12)} p-2`}
        >
          <Select
            placeholder={field.placeholder}
            onChange={(value) => onChange(value, field.key)}
            allowClear
            showSearch
            className="w-full h-14"
            optionFilterProp="children"
            filterOption={(input:any, option:any) =>
              option?.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {field.options.map((option) => (
              <Option key={option.key} value={option.key}>
                {option.value}
              </Option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
};

export default EmployeeSearch;
