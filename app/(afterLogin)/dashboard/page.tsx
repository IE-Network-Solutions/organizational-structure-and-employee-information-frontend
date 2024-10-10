'use client';
import CardList from './_components/card-list';
import ActionPlans from './_components/action-plan';
import ApprovalStatus from './_components/approval-status';
import CoursePermitted from './_components/course-permitted';
import Header from './_components/header';
import NewCourses from './_components/new-course';
import SelfAttendance from './_components/self-attendance';
import EmploymentStats from './_components/employee-status';
import JobSummary from './_components/job-summary';
import { Applicants } from './_components/applicants';
import RoleGuard from '@/utils/permissionGuard';

const people = [
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Pristia Candra',
    email: 'lincoln@ienetwork.com',
    imgSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Section */}
        <div className="col-span-12 md:col-span-8">
          <RoleGuard roles={['admin', 'owner']}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <EmploymentStats />
              </div>
              <div>
                <JobSummary />
              </div>
            </div>
          </RoleGuard>

          <Header />
          <SelfAttendance />
        </div>

        {/* Right Section */}
        <div className="col-span-12 md:col-span-4">
          <ActionPlans />
        </div>
      </div>

      {/* Courses Section */}
      <RoleGuard roles={['user']}>
        <NewCourses />
      </RoleGuard>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-2">
        {/* Left Section */}
        <div className="col-span-12 md:col-span-8 flex flex-col md:flex-row gap-4">
          <ApprovalStatus />
          <RoleGuard roles={['user']}>
            <CoursePermitted />
          </RoleGuard>
          <RoleGuard roles={['admin', 'owner']}>
            <Applicants />
          </RoleGuard>
        </div>

        {/* Right Section */}
        <div className="col-span-12 md:col-span-4 flex flex-col items-center gap-6">
          <CardList
            key="birthday"
            title="Whose Birthday is today?"
            people={people}
            date="July 10, 2024"
          />
          <CardList
            key="anniversary"
            title="Work Anniversary"
            people={people}
            date="July 10, 2024"
          />
        </div>
      </div>
    </div>
  );
}
