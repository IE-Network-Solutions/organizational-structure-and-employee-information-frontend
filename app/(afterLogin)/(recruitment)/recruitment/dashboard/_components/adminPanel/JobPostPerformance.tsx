'use client';

import { Input, Select, Button, DatePicker } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import JobPerformance from './JobPerformance';
import { useGetJobPostPerformance, useGetJobPostPerformanceExport } from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';

const { Option } = Select;
const { RangePicker } = DatePicker;

const JobPostPerformance = () => {
  const {
    jobPostPage,
    setJobPostPage,
    jobPostLimit,
    setJobPostLimit,
    jobPostDepartmentId,
    setJobPostDepartmentId,
    jobPostJobId,
    setJobPostJobId,
    jobPostSearch,
    setJobPostSearch,
    jobPostStartDate,
    setJobPostStartDate,
    jobPostEndDate,
    setJobPostEndDate
  } = useRecruitmentDashboardStore();
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { data: stages, isLoading: stagesLoading } = useGetStages();
  const { data: jobs, isLoading: jobsLoading } = useGetJobs('', 1, 100);

  // Export functionality
  const { refetch: exportJobPostPerformance, isLoading: isExporting } = useGetJobPostPerformanceExport({
    jobTitle: jobPostSearch,
    departmentId: jobPostDepartmentId,
    jobId: jobPostJobId,
    startDate: jobPostStartDate,
    endDate: jobPostEndDate,
  });

  const handleExport = async () => {
    try {
      const result = await exportJobPostPerformance();
      console.log(result, 'perererer');
      if (result.data) {
        // Check if the response contains a download URL
        if (result.data.downloadUrl || result.data.url) {
          // If server returns a download URL, trigger download directly
          const downloadUrl = result.data.downloadUrl || result.data.url;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `job-post-performance-${new Date().toISOString().split('T')[0]}.xlsx`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (result.data instanceof Blob) {
          // If it's already a blob, use it directly
          const url = window.URL.createObjectURL(result.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `job-post-performance-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else if (typeof result.data === 'string') {
          // Handle string data (binary content as string)
          // The data might be base64 encoded or need different handling
          console.log('String data length:', result.data.length);
          console.log('First 100 chars:', result.data.substring(0, 100));

          // Try different approaches to handle the binary data
          let blob;

          // Approach 1: Try to decode as base64 first
          try {
            // Check if it looks like base64
            if (result.data.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(result.data)) {
              // It might be base64 encoded
              const binaryString = atob(result.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              blob = new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
            } else {
              // Direct binary string handling
              const bytes = new Uint8Array(result.data.length);
              for (let i = 0; i < result.data.length; i++) {
                bytes[i] = result.data.charCodeAt(i) & 0xff;
              }
              blob = new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
            }
          } catch (error) {
            console.error('Error processing binary data:', error);
            // Fallback to direct string handling
            const bytes = new Uint8Array(result.data.length);
            for (let i = 0; i < result.data.length; i++) {
              bytes[i] = result.data.charCodeAt(i) & 0xff;
            }
            blob = new Blob([bytes], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
          }

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `job-post-performance-${new Date().toISOString().split('T')[0]}.xlsx`;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log('Excel export successful and download triggered');
        } else if (result.data.buffer && result.data.buffer.type === 'Buffer') {
          // Handle Buffer data (Excel content)
          const bufferData = result.data.buffer.data;

          // Create blob from buffer data
          const blob = new Blob([new Uint8Array(bufferData)], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `job-post-performance-${new Date().toISOString().split('T')[0]}.xlsx`;

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log('Excel export successful and download triggered');
        } else {
          // If it's JSON data, we need to handle it differently
          console.log('Export response format:', typeof result.data, result.data);
          // You might need to make a separate request to get the actual file
          // or the server might need to be configured to return the file directly
        }

        console.log('Export successful and download triggered');
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Handle error - you might want to show an error notification
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
  const { data: jobPostPerformance, isLoading } = useGetJobPostPerformance({
    jobTitle: jobPostSearch,
    departmentId: jobPostDepartmentId,
    jobId: jobPostJobId,
    page: jobPostPage,
    limit: jobPostLimit,
    startDate: jobPostStartDate,
    endDate: jobPostEndDate,
  });
  console.log(jobPostPerformance, 'jobPostPerformance');
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold">Job Post Performance</h2>
        <Button
          icon={<ExportOutlined />}
          type="default"
          onClick={handleExport}
          loading={isExporting}
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
        />
      </div>

      <JobPerformance data={jobPostPerformance} isLoading={isLoading} />
    </div>
  );
};

export default JobPostPerformance;
