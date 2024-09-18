'use client';
import React from 'react';
import { Input, Select } from 'antd';
import { useDebounce } from '@/utils/useDebounce';

const { Option } = Select;
interface Option {
  key: string;
  value: string;
}

interface EmployeeSearchProps {
  optionArray1?:Option[];
  optionArray2?:Option[];
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ optionArray2,optionArray1 }) => {
  /*eslint-disable @typescript-eslint/no-unused-vars */

  const handleSearchEmployee = async (
    e: React.ChangeEvent<HTMLInputElement>,
    keyValue: string,
    isSelect: boolean,
  ) => {
    const value = isSelect ? e : e.target.value;
  };

  /* eslint-disable @typescript-eslint/no-unused-vars */

  const onSearchChange = useDebounce(handleSearchEmployee, 2000);
  return (
    <div className="flex flex-col items-center space-y-4 w-full pb-4">
      <div className="flex flex-wrap w-full">
        <div className="w-full md:w-1/2 p-2">
          <Input
            placeholder="Search"
            onChange={(e) => onSearchChange(e, 'search', false)}
            className="w-full h-14"
            allowClear
          />
        </div>
        <div className="w-full md:w-1/4 p-2" id="subscriptionTypeFilter">
          <Select
            placeholder="Select Type"
            onChange={(value) =>
              onSearchChange(value, 'type', true)
            }
            allowClear
            className="w-full h-14"
          >
            {optionArray1?.map(item=>(
                  <Option value={item.key}>{item.value}</Option>
            ))}
          </Select>
        </div>
        <div className="w-full md:w-1/4 p-2" id="subscriptionStatusFilter">
          <Select
            placeholder="status"
            onChange={(value) =>
              onSearchChange(value, 'status', true)
            }
            allowClear
            className="w-full h-14"
          >
            {optionArray2?.map(item=>(
                  <Option value={item.key}>{item.value}</Option>
            ))}

          </Select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSearch;
