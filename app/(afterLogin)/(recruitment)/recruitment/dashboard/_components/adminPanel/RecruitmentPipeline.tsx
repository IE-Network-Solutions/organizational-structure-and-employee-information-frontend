'use client';

import { Input, Select, Button } from 'antd';
import CandidateTable from './CandidateTable';
import { ExportOutlined } from '@ant-design/icons';

const { Option } = Select;

const RecruitmentPipeline = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold">Recruitment Pipeline</h2>
        <Button icon={<ExportOutlined/> } type="default">
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Input placeholder="Search candidate" />
        <Select placeholder="Department" allowClear>
          <Option value="Software">Software</Option>
          <Option value="Sales">Sales</Option>
        </Select>
        <Select placeholder="Stage" allowClear>
          <Option value="Stage 1">Stage 1</Option>
          <Option value="Stage 2">Stage 2</Option>
        </Select>
        <Select placeholder="Job" allowClear>
          <Option value="UI/UX Designer">UI/UX Designer</Option>
          <Option value="Sales Representative">Sales Representative</Option>
        </Select>
      </div>

      <CandidateTable />
    </div>
  );
};

export default RecruitmentPipeline;
