'use client';
import Header from './_components/header';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import LeftBar from './_components/leftBar';
import RightBar from './_components/rightBar';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardStore } from '@/store/uistate/features/dashboard';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Home() {
  const userData = useAuthenticationStore.getState().userData;
  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears();
  const { isOpen, setIsOpen } = useDashboardStore();
  const { isMobile, isTablet } = useIsMobile();

  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();
  const showAnnouncements = () => {
    setIsOpen(!isOpen);
  };

  const mainLayout = (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className=" flex justify-between items-center">
        <div className="">
          {' '}
          {userData?.firstName ? (
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Hi, {userData?.firstName}
              </h1>
            </div>
          ) : (
            ''
          )}
        </div>
        {isMobile || isTablet ? (
          <div
            className=" text-primary text-base font-bold"
            onClick={() => showAnnouncements()}
          >
            Announcements
          </div>
        ) : (
          ''
        )}
      </div>
      {isMobile || isTablet ? isOpen ? null : <Header /> : <Header />}
      {isMobile || isTablet ? (
        <div className="grid grid-cols-1 ">
          {isOpen ? (
            <div className="col-span-12 ">
              <RightBar />
            </div>
          ) : (
            <div className="col-span-12  ">
              <LeftBar />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <LeftBar />
          </div>
          <div className="col-span-4 ">
            <RightBar />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
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
