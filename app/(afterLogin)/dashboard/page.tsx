'use client';
import Header from './_components/header';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFiscalYearRedirect } from '@/hooks/useFiscalYearRedirect';
import LeftBar from './_components/leftBar';
import RightBar from './_components/rightBar';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useDashboardStore } from '@/store/uistate/features/dashboard';
import { useIsMobile } from '@/hooks/useIsMobile';
import AccessGuard from '@/utils/permissionGuard';
import CustomDashboardModal from './_components/customDashbordModal';

export default function Home() {
  useFiscalYearRedirect(); // 👈 Activate fiscal year redirect logic

  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears({
      refetchInterval: 30000, // Keep polling for banner display
    });

  const userData = useAuthenticationStore.getState().userData;

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
    <div
      className="min-h-screen bg-gray-100  pl-2 pr-3"
      data-cy="dashboard-main-layout"
    >
      {isMobile || isTablet ? (
        <div
          className=" flex justify-between items-center mb-4"
          data-cy="dashboard-mobile-header"
        >
          {userData?.firstName ? (
            <h1
              className="text-2xl font-bold text-gray-800"
              data-cy="dashboard-mobile-greeting"
            >
              Hi, {userData?.firstName}
            </h1>
          ) : (
            <span data-cy="dashboard-mobile-greeting-empty"></span>
          )}
          <div
            className=" text-primary text-base font-bold"
            onClick={() => showAnnouncements()}
            data-cy="dashboard-mobile-announcements-button"
          >
            <span data-cy="dashboard-mobile-announcements-text">
              Announcements
            </span>
          </div>
        </div>
      ) : (
        <div className=" flex justify-start" data-cy="dashboard-desktop-header">
          {userData?.firstName ? (
            <div
              className="mb-4"
              data-cy="dashboard-desktop-greeting-container"
            >
              <h1
                className="text-2xl font-bold text-gray-800"
                data-cy="dashboard-desktop-greeting"
              >
                Hi, {userData?.firstName}
              </h1>
            </div>
          ) : (
            <span data-cy="dashboard-desktop-greeting-empty"></span>
          )}
        </div>
      )}
      <Header />
      {isMobile || isTablet ? (
        <div className="grid grid-cols-1 pb-3" data-cy="dashboard-mobile-grid">
          {isOpen ? (
            <CustomDashboardModal
              open={isOpen}
              onClose={showAnnouncements}
              width="400px"
            >
              <div
                className="col-span-12 "
                data-cy="dashboard-mobile-rightbar-container"
              >
                <RightBar />
              </div>
            </CustomDashboardModal>
          ) : (
            ''
          )}
          <div
            className="col-span-12  "
            data-cy="dashboard-mobile-leftbar-container"
          >
            <LeftBar />
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-12 gap-4 pb-5"
          data-cy="dashboard-desktop-grid"
        >
          <div
            className="col-span-8"
            data-cy="dashboard-desktop-leftbar-container"
          >
            <LeftBar />
          </div>
          <div
            className="col-span-4 "
            data-cy="dashboard-desktop-rightbar-container"
          >
            <RightBar />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div data-cy="dashboard-page-container">
      {isResponseLoading && <Skeleton active paragraph={{ rows: 0 }} />}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2 cursor-pointer hover:bg-[#3a4354] transition"
            onClick={() => {
              window.location.href =
                '/organization/settings/fiscalYear/fiscalYearCard';
            }}
            title="Go to Fiscal Year Settings"
            data-cy="dashboard-fiscal-year-banner-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {/* If user does not have permission, show non-clickable banner */}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2"
            data-cy="dashboard-fiscal-year-banner-non-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title-non-clickable"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message-non-clickable"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {mainLayout}
    </div>
  );
}
