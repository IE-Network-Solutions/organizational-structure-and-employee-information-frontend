'use client';
import ActionPlans from './_components/action-plan';
import CoursePermitted from './_components/course-permitted';
import Header from './_components/header';
import NewCourses from './_components/new-course';
import SelfAttendance from './_components/self-attendance';
import EmploymentStats from './_components/employee-status';
import JobSummary from './_components/job-summary';
import { Applicants } from './_components/applicants';
import AccessGuard from '@/utils/permissionGuard';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';

export default function Home() {
  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears();

  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();

  const mainLayout = (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Section */}
        <div className="col-span-12 lg:col-span-8">
          <Header />
        </div>
        {/* Right Section */}
        <div className="col-span-12 lg:col-span-4">
          <ActionPlans />
        </div>
      </div>

      <AccessGuard roles={['user']}>
        <NewCourses />
      </AccessGuard>

      {/* Second Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">
            {/* Employment and Job Summary */}
            <div className="col-span-12 xl:col-span-8">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <EmploymentStats />
                <JobSummary />
              </div>
              <SelfAttendance />
            </div>

            {/* Course Permitted and Applicants */}
            <div className="col-span-12 xl:col-span-4">
              <AccessGuard roles={['user']}>
                <CoursePermitted />
              </AccessGuard>
              <AccessGuard roles={['admin', 'owner']}>
                <Applicants />
              </AccessGuard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isResponseLoading && <Skeleton active paragraph={{ rows: 0 }} />}
      {hasEndedFiscalYear && (
        <div className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-lg">
          <span className="text-[#FFDE65] px-2">
            Your fiscal year has ended
          </span>
          <span className="text-white">
            Please contact your system admin for more information
          </span>
        </div>
      )}
      {mainLayout}
    </>
  );
}
