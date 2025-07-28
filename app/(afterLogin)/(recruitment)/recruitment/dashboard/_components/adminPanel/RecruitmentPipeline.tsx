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
import axios from 'axios';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { DASHBOARD_API } from '@/store/server/features/recruitment/dashboard/api';

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

  // Export functionality
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const token = useAuthenticationStore.getState().token;
      const tenantId = useAuthenticationStore.getState().tenantId;
      const userId = useAuthenticationStore.getState().userId;

      const headers = {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
        requestedBy: userId,
        createdBy: userId,
      };

      // Build query parameters
      const params = {
        candidateName: debouncedSearch,
        departmentId,
        stages: stageId,
        jobId,
      };

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const url = `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_EXPORT_API}${queryString ? `?${queryString}` : ''}`;

      const response = await axios({
        url,
        method: 'GET',
        headers,
        responseType: 'blob', // Important for file download!
      });

      // Create blob from response data
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Create download link
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Get filename from content-disposition header or use default
      const disposition = response.headers['content-disposition'];
      let fileName = `recruitment-pipeline-${new Date().toISOString().split('T')[0]}.xlsx`;

      if (disposition && disposition.includes('filename=')) {
        fileName = disposition.split('filename=')[1].replace(/"/g, '');
      }

      link.href = url2;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url2);

      console.log('Excel export successful and download triggered');
    } catch (error) {
      console.error('Export failed:', error);
      // Handle error - you might want to show an error notification
    } finally {
      setIsExporting(false);
    }
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold">Recruitment Pipeline</h2>
        <Button
          icon={<ExportOutlined />}
          type="default"
          onClick={handleExport}
          loading={isExporting}
        >
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
