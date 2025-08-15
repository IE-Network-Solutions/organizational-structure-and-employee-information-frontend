'use client';

import { Select, Button, DatePicker, Card, Modal } from 'antd';
import JobPerformance from './JobPerformance';
import {
  useGetJobPostPerformance,
  useDownloadJobPostPerformanceExport,
} from '@/store/server/features/recruitment/dashboard/queries';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { LuFileDown, LuSettings2 } from 'react-icons/lu';
import CustomButton from '@/components/common/buttons/customButton';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const JobPostPerformance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const MobileFilterContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Department */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Department</label>
        <Select
          placeholder="Department"
          allowClear
          showSearch
          value={jobPostDepartmentId}
          className="w-full h-12"
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
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
        <RangePicker
          placeholder={['Start Date', 'End Date']}
          allowClear
          className="w-full h-12"
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
    </div>
  );

  return (
    <>
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

        {/* Desktop Filters */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

        {/* Mobile Filters */}
        <div className="md:hidden">
          <div className="flex justify-between gap-4 w-full mb-6">
            <div className="flex-1">
              <Select
                placeholder="Job"
                allowClear
                showSearch
                className="w-full h-12"
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
            <div>
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
              />
            </div>
          </div>
        </div>

        <JobPerformance data={jobPostPerformance} isLoading={isLoading} />
      </Card>

      {/* Mobile Filter Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div className="flex gap-2 justify-center mt-4">
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
            />
          </div>
        }
        className="!m-4 md:hidden"
        style={{
          top: '20%',
          transform: 'translateY(-50%)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        width="90%"
        centered
      >
        <MobileFilterContent />
      </Modal>
    </>
  );
};

export default JobPostPerformance;
