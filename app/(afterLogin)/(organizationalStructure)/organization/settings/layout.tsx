'use client';
import { FC, ReactNode, useEffect } from 'react';
import { TbNotes } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import { usePathname } from 'next/navigation';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const { token } = useAuthenticationStore();
  const pathname = usePathname();

  const {
    data: activeFiscalYear,
    refetch,
    isLoading: isResponseLoading,
  } = useGetActiveFiscalYearsData();

  useEffect(() => {
    refetch();
  }, [token]);

  const hasEndedFiscalYear =
    !!activeFiscalYear?.isActive &&
    !!activeFiscalYear?.endDate &&
    new Date(activeFiscalYear?.endDate) <= new Date();

  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'branches',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/organization/settings/branches') ? 'lg:ml-4' : ''}`}
            data-cy="org-settings-branches-icon"
            id="org-settings-branches-icon"
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/organization/settings/branches') ? 'text-[#1677FF]' : ''}`}
              data-cy="org-settings-branches-icon-svg"
              id="org-settings-branches-icon-svg"
            />
            <p
              className="menu-item-label"
              data-cy="org-settings-branches-label"
              id="org-settings-branches-label"
            >
              Branches
            </p>
          </div>
        ),
      },
      link: '/organization/settings/branches',
      disabled: hasEndedFiscalYear,
    },
    {
      item: {
        key: 'fiscalYearCard',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/organization/settings/fiscalYear') ? 'lg:ml-4' : ''}`}
            data-cy="org-settings-fiscal-year-icon"
            id="org-settings-fiscal-year-icon"
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/organization/settings/fiscalYear') ? 'text-[#1677FF]' : ''}`}
              data-cy="org-settings-fiscal-year-icon-svg"
              id="org-settings-fiscal-year-icon-svg"
            />
            <p
              className="menu-item-label"
              data-cy="org-settings-fiscal-year-label"
              id="org-settings-fiscal-year-label"
            >
              Fiscal Year
            </p>
          </div>
        ),
      },
      link: '/organization/settings/fiscalYear/fiscalYearCard',
    },
    {
      item: {
        key: 'workSchedule',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/organization/settings/workSchedule') ? 'lg:ml-4' : ''}`}
            data-cy="org-settings-work-schedule-icon"
            id="org-settings-work-schedule-icon"
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/organization/settings/workSchedule') ? 'text-[#1677FF]' : ''}`}
              data-cy="org-settings-work-schedule-icon-svg"
              id="org-settings-work-schedule-icon-svg"
            />
            <p
              className="menu-item-label"
              data-cy="org-settings-work-schedule-label"
              id="org-settings-work-schedule-label"
            >
              Work Schedule
            </p>
          </div>
        ),
      },
      link: '/organization/settings/workSchedule',
      disabled: hasEndedFiscalYear,
    },
  ]);

  return (
    <div
      className="min-h-screen "
      data-cy="org-settings-layout"
      id="org-settings-layout"
    >
      {isResponseLoading && (
        <Skeleton
          active
          paragraph={{ rows: 0 }}
          data-cy="org-organization-settings-layout-skeleton-1"
        />
      )}
      {hasEndedFiscalYear && (
        <div
          className="bg-[#323B49] h-12 flex items-center justify-start text-md p-2 rounded-lg shadow-none "
          data-cy="org-settings-fiscal-year-warning"
          id="org-settings-fiscal-year-warning"
        >
          <span
            className="text-[#FFDE65] px-2"
            data-cy="org-settings-fiscal-year-warning-text"
            id="org-settings-fiscal-year-warning-text"
          >
            Your Have Finished Your Fiscal Year
          </span>
          <span
            className="text-white"
            data-cy="org-settings-fiscal-year-warning-text-2"
            id="org-settings-fiscal-year-warning-text-2"
          >
            Please Create Your Next Fiscal Year To Continue
          </span>
        </div>
      )}
      <div
        className="min-h-screen bg-[#f5f5f5]"
        data-cy="org-settings-layout-div"
        id="org-settings-layout-div"
      >
        <PageHeader
          title="Settings"
          description="Manage your settings here"
          data-cy="org-settings-page-header"
        />
        <div
          className="flex  flex-col lg:flex-row gap-6 m-4"
          data-cy="org-organization-settings-layout-div-1"
          id="org-organization-settings-layout-div-1"
        >
          <SidebarMenu
            menuItems={menuItems}
            data-cy="org-settings-sidebar-menu"
          />
          <BlockWrapper
            padding="0px"
            className="flex-1 h-max overflow-x-auto bg-[#fafafa] "
            data-cy="org-settings-content-wrapper"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
