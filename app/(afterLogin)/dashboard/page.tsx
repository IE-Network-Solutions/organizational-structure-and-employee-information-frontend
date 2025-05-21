'use client';
import Header from './_components/header';
import NewCourses from './_components/new-course';
import JobSummary from './_components/job-summary';
import AccessGuard from '@/utils/permissionGuard';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import LeftBar from './_components/leftBar';
import RightBar from './_components/rightBar';

export default function Home() {
  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears();

  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();

  const mainLayout = (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Main Grid */} <Header />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Section */}
        <div className="col-span-12 lg:col-span-8">
          <LeftBar />
        </div>
        {/* Right Section */}
        <div className="col-span-12 lg:col-span-4 ">
          <RightBar />
        </div>
      </div>
    </div>
  );

  return (
    <div className=" py-6">
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
    </div>
  );
}
