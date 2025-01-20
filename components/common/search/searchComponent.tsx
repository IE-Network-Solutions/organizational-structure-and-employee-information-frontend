'use client';

import React from 'react';
import { Select,DatePicker } from 'antd';


const { RangePicker } = DatePicker
const { Option } = Select;

interface Option {
  key: string;
  value: string;
}

interface FieldConfig {
  key: string; // Unique identifier for the field
  options: Option[]; // Options for the Select component
  widthRatio: number; // Width fraction (e.g., 1/2 or 1/4)
  placeholder: string; // Placeholder for the field
  type: string; // Placeholder for the field
  onChange: (value: any) => void; // Callback triggered on value change
}

interface DynamicSearchProps {
  fields: FieldConfig[]; // Array of field configurations
}

const EmployeeSearchComponent: React.FC<DynamicSearchProps> = ({
  fields,
}) => {
  return (
    <div className="flex justify-start w-full">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`w-full md:w-${Math.round(field.widthRatio / 12)} p-2`}
        >
          {field?.type==='start-end-date'?
          <RangePicker
          onChange={(dates, dateStrings) => {
            if (field?.onChange) {
              field.onChange(dateStrings); // Pass formatted date strings to the handler
            }
          }}
          className="w-full h-14"
        />:
          <Select
            placeholder={field.placeholder}
            onChange={(value:string) => field?.onChange(value)}
            allowClear
            showSearch
            className="w-full h-14"
            optionFilterProp="children"
            filterOption={(input: any, option: any) =>
              option?.children
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {field.options?.map((option) => (
              <Option key={option.key} value={option.key}>
                {option.value}
              </Option>
            ))}
          </Select>}
        </div>
      ))}
    </div>
  );
};

export default EmployeeSearchComponent;
