'use client';

import { Select, Button, DatePicker, Card } from 'antd';
import JobPerformance from './JobPerformance';
import {
  useGetJobPostPerformance,
  useDownloadJobPostPerformanceExport,
} from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { LuFileDown } from 'react-icons/lu';

const { RangePicker } = DatePicker;

const JobPostPerformance = () => {
  const {
    jobPostPage,
    jobPostLimit,
    jobPostDepartmentId,
    setJobPostDepartmentId,
    jobPostJobId,
    setJobPostJobId,
    jobPostSearch,
    jobPostStartDate,
    setJobPostStartDate,
    jobPostEndDate,
    setJobPostEndDate,
  } = useRecruitmentDashboardStore();
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();

  const { data: jobs, isLoading: jobsLoading } = useGetJobs('', 1, 100);

  // Export functionality using the new hook
  const { mutate: downloadExport, isLoading: isExporting } =
    useDownloadJobPostPerformanceExport();

  const handleExport = async () => {
    const params = {
      jobTitle: jobPostSearch,
      departmentId: jobPostDepartmentId,
      jobId: jobPostJobId,
      startDate: jobPostStartDate,
      endDate: jobPostEndDate,
    };

    downloadExport(params);
  };

  const departmentOptions = departments?.map((department: any) => ({
    value: department.id,
    label: department.name,
  }));

  const jobOptions = jobs?.items?.map((job: any) => ({
    value: job.id,
    label: job.jobTitle,
  }));
  const { data: jobPostPerformance, isLoading } = useGetJobPostPerformance({
    jobTitle: jobPostSearch,
    departmentId: jobPostDepartmentId,
    jobId: jobPostJobId,
    page: jobPostPage,
    limit: jobPostLimit,
    startDate: jobPostStartDate,
    endDate: jobPostEndDate,
  });
  return (
    <Card
      bodyStyle={{ padding: '0px' }}
      className="bg-white p-6 rounded-xl shadow-lg mx-1"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-bold">Job Post Performance</h2>
        <Button
          icon={<LuFileDown />}
          type="default"
          onClick={handleExport}
          loading={isExporting}
          className="h-12 w-28"
        >
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
          className="h-14"
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
          className="h-14"
        />
        <RangePicker
          placeholder={['Start Date', 'End Date']}
          onChange={(dates) => {
            if (dates) {
              setJobPostStartDate(dates[0]?.toISOString() || '');
              setJobPostEndDate(dates[1]?.toISOString() || '');
            } else {
              setJobPostStartDate('');
              setJobPostEndDate('');
            }
          }}
          className="h-14"
        />
      </div>

      <JobPerformance data={jobPostPerformance} isLoading={isLoading} />
    </Card>
  );
};

export default JobPostPerformance;
