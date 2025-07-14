'use client';

import { Input, Select, Button, Spin } from 'antd';
import CandidateTable from './CandidateTable';
import { ExportOutlined } from '@ant-design/icons';
import { useGetRecruitmentPipeline } from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useEffect, useState } from 'react';

const RecruitmentPipeline = () => {
  const {
    search,
    setSearch,
    departmentId,
    setDepartmentId,
    stageId,
    setStageId,
    jobId,
    setJobId,
    page,
    limit,
  } = useRecruitmentDashboardStore();

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data: pipelineData, isLoading } = useGetRecruitmentPipeline({
    search: debouncedSearch,
    departmentId,
    stageId,
    jobId,
    page,
    limit,
  });

  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: stages, isLoading: stagesLoading } = useGetStages();
  const { data: jobs, isLoading: jobsLoading } = useGetJobs('', 1, 100);

  const departmentOptions = departments?.map((department: any) => ({
    value: department.id,
    label: department.name,
  }));

  const stageOptions = stages?.items?.map((stage: any) => ({
    value: stage.id,
    label: stage.title,
  }));

  const jobOptions = jobs?.items?.map((job: any) => ({
    value: job.id,
    label: job.jobTitle,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold">Recruitment Pipeline</h2>
        <Button icon={<ExportOutlined />} type="default">
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search candidate"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Department"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={departmentsLoading}
          options={departmentOptions}
          onChange={(value) => setDepartmentId(value)}
        />
        <Select
          placeholder="Stage"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={stagesLoading}
          options={stageOptions}
          onChange={(value) => setStageId(value)}
        />
        <Select
          placeholder="Job"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={jobsLoading}
          options={jobOptions}
          onChange={(value) => setJobId(value)}
        />
      </div>

      <CandidateTable data={pipelineData} isLoading={isLoading} />
    </div>
  );
};

export default RecruitmentPipeline;
