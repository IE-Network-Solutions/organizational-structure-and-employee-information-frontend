'use client';

import { Input, Select, Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import JobPerformance from './JobPerformance';
import { useGetJobPostPerformance } from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';

const { Option } = Select;

const JobPostPerformance = () => {
  const { jobPostPage, setJobPostPage, jobPostLimit, setJobPostLimit, jobPostDepartmentId, setJobPostDepartmentId, jobPostStageId, setJobPostStageId, jobPostJobId, setJobPostJobId, jobPostSearch, setJobPostSearch } =
    useRecruitmentDashboardStore();
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
  const { data: jobPostPerformance, isLoading } = useGetJobPostPerformance({
    page: jobPostPage,
    limit: jobPostLimit,
  });
  console.log(jobPostPerformance, 'jobPostPerformance');
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold">Job Post Performance</h2>
        <Button icon={<ExportOutlined />} type="default">
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search candidate"
          value={jobPostSearch}
          onChange={(e) => setJobPostSearch(e.target.value)}
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
          onChange={(value) => setJobPostDepartmentId(value)}
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
          onChange={(value) => setJobPostStageId(value)}
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
          onChange={(value) => setJobPostJobId(value)}
        />
      </div>

      <JobPerformance data={jobPostPerformance} isLoading={isLoading} />
    </div>
  );
};

export default JobPostPerformance;
