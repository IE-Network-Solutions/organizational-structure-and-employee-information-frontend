'use client';

import { Input, Select, Button, Card } from 'antd';
import CandidateTable from './CandidateTable';
import {
  useGetRecruitmentPipeline,
  useDownloadRecruitmentPipelineExport,
} from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { LuFileDown } from 'react-icons/lu';

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
    candidateName: debouncedSearch,
    departmentId,
    stages: stageId,
    jobId,
    page,
    limit,
  });

  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: stages, isLoading: stagesLoading } = useGetStages();
  const { data: jobs, isLoading: jobsLoading } = useGetJobs('', 1, 100);

  // Export functionality using the new hook
  const { mutate: downloadExport, isLoading: isExporting } =
    useDownloadRecruitmentPipelineExport();

  const handleExport = async () => {
    const params = {
      candidateName: debouncedSearch,
      departmentId,
      stages: stageId,
      jobId,
    };

    downloadExport(params);
  };
  const departmentOptions = departments?.map((department: any) => ({
    value: department.id,
    label: department.name,
  }));

  const stageOptions = stages?.items?.map((stage: any) => ({
    value: stage.title,
    label: stage.title,
  }));

  const jobOptions = jobs?.items?.map((job: any) => ({
    value: job.id,
    label: job.jobTitle,
  }));

  // Calculate average days to hire
  const calculateAverageDaysToHire = () => {
    if (!pipelineData?.results || pipelineData.results.length === 0) {
      return 0;
    }

    // Group candidates by job
    const jobGroups = pipelineData.results.reduce(
      (groups: any, candidate: any) => {
        const jobTitle = candidate.job;
        if (!groups[jobTitle]) {
          groups[jobTitle] = [];
        }
        groups[jobTitle].push(candidate);
        return groups;
      },
      {},
    );

    // Calculate days to hire for each job
    const jobDaysToHire = Object.entries(jobGroups)
      .map(([jobTitle, candidates]: [string, any]) => {
        // Find the first application date (earliest createdAt)
        const firstApplication = candidates.reduce(
          (earliest: any, candidate: any) => {
            const candidateDate = dayjs(candidate.createdAt);
            const earliestDate = earliest ? dayjs(earliest.createdAt) : null;
            return !earliestDate || candidateDate.isBefore(earliestDate)
              ? candidate
              : earliest;
          },
          jobTitle,
        );

        // Find the last application date (latest createdAt)

        // Find hired candidates for this job
        const hiredCandidates = candidates.filter(
          (candidate: any) => candidate.hiredDate,
        );

        if (hiredCandidates.length === 0) {
          return null; // No hired candidates for this job
        }

        // Calculate days to hire for each hired candidate
        const daysToHireArray = hiredCandidates.map((candidate: any) => {
          const firstAppDate = dayjs(firstApplication.createdAt);
          const hiredDate = dayjs(candidate.hiredDate);
          return hiredDate.diff(firstAppDate, 'day');
        });

        // Return average days to hire for this job
        const totalDays = daysToHireArray.reduce(
          (sum: number, days: number) => sum + days,
          0,
        );
        return Math.round(totalDays / daysToHireArray.length);
      })
      .filter((days: number | null) => days !== null);

    if (jobDaysToHire.length === 0) {
      return 0;
    }

    // Calculate overall average across all jobs
    const totalDays = jobDaysToHire.reduce(
      (sum: number, days: number) => sum + days,
      0,
    );
    return Math.round(totalDays / jobDaysToHire.length);
  };

  const averageDaysToHire = calculateAverageDaysToHire();

  return (
    <Card
      bodyStyle={{ padding: '0px' }}
      className="bg-white p-6 rounded-xl shadow-lg mx-1"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-bold">Recruitment Pipeline</h2>
        <div className="flex items-center gap-4">
          {jobId && (
            <div className="text-[18px] text-[#4E4EF1] font-bold">
              <span className="">Days to Hire:</span> {averageDaysToHire}
            </div>
          )}

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search candidate"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          onChange={(value) => setDepartmentId(value)}
          className="h-14"
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
          className="h-14"
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
          className="h-14"
        />
      </div>

      <CandidateTable data={pipelineData} isLoading={isLoading} />
    </Card>
  );
};

export default RecruitmentPipeline;
