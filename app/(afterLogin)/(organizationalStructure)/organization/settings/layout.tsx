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
        icon: <TbNotes />,
        label: <p className="menu-item-label">Branches</p>,
      },
      link: '/organization/settings/branches',
    },
    {
      item: {
        key: 'fiscal-year',
        icon: <TbNotes />,
        label: <p className="menu-item-label">Fiscal Year</p>,
      },
      link: '/organization/settings/fiscal-year',
    },
    {
      item: {
        key: 'workSchedule',
        icon: <TbNotes />,
        label: <p className="menu-item-label">Work Schedule</p>,
      },
      link: '/organization/settings/workSchedule',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="h-auto w-auto pr-6 pb-6 pl-3">
        <PageHeader title="Settings" description="Manage your settings here" />

        <div className="flex gap-6 mt-8">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
