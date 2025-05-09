'use client';
import { FC, ReactNode } from 'react';
import { TbNotes } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'branches',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Branches</p>,
      },
      link: '/organization/settings/branches',
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
    },
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className="h-auto w-auto">
        <PageHeader title="Settings" description="Manage your settings here" />

        <div className="flex  flex-col lg:flex-row gap-6 mt-3">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper className="flex-1 h-max bg-[#fafafa] p-0">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
