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

export default function Home() {
  return (
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
              <div className="flex-col sm:flex-row gap-3 mb-3">
                <AccessGuard roles={['user']}>
                  <CoursePermitted />
                </AccessGuard>
              </div>
              <AccessGuard roles={['admin', 'owner']}>
                <Applicants />
              </AccessGuard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
