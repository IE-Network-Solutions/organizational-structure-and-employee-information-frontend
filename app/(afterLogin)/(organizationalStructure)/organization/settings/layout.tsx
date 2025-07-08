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

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const { token } = useAuthenticationStore();

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
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Branches</p>,
      },
      link: '/organization/settings/branches',
      disabled: hasEndedFiscalYear,
    },
    {
      item: {
        key: 'fiscalYearCard',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Fiscal Year</p>,
      },
      link: '/organization/settings/fiscalYear/fiscalYearCard',
    },
    {
      item: {
        key: 'workSchedule',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Work Schedule</p>,
      },
      link: '/organization/settings/workSchedule',
      disabled: hasEndedFiscalYear,
    },
  ]);

  return (
    <div className="min-h-screen ">
      {isResponseLoading && <Skeleton active paragraph={{ rows: 0 }} />}
      {hasEndedFiscalYear && (
        <div className="bg-[#323B49] h-12 flex items-center justify-start text-lg p-2 rounded-lg shadow-none ">
          <span className="text-[#FFDE65] px-2">
            Your Have Finished Your Fiscal Year
          </span>
          <span className="text-white">
            Please Create Your Next Fiscal Year To Continue
          </span>
        </div>
      )}
      <div className="min-h-screen bg-[#f5f5f5]">
        <PageHeader title="Settings" description="Manage your settings here" />
        <div className="flex  flex-col lg:flex-row gap-6 m-4">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper
            padding="0px"
            className="flex-1 h-max overflow-x-auto bg-[#fafafa] "
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
