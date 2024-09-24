import React from 'react';
import { DatePicker, Select } from 'antd';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters = () => {
  const { setFilters } = useTalentPoolStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
      <RangePicker
        className="w-full h-12"
        onChange={(dates, dateStrings) =>
          setFilters({ dateRange: [dateStrings[0], dateStrings[1]] })
        }
      />
      <Select
        className="w-full h-12"
        placeholder="Select Job"
        onChange={(value) => setFilters({ job: value })}
      >
        <Option value="Software Engineer">Software Engineer</Option>
        <Option value="Designer">Designer</Option>
        {/* Add more options if needed */}
      </Select>

      <Select
        className="w-full h-12"
        placeholder="Select Department"
        onChange={(value) => setFilters({ department: value })}
      >
        <Option value="Engineering">Engineering</Option>
        <Option value="Design">Design</Option>
        {/* Add more options if needed */}
      </Select>

      <Select
        className="w-full h-12"
        placeholder="Select Stages"
        onChange={(value) => setFilters({ stage: value })}
      >
        <Option value="Interview">Interview</Option>
        <Option value="Talent Pool">Talent Pool</Option>
        {/* Add more options if needed */}
      </Select>
    </div>
  );
};

export default Filters;
