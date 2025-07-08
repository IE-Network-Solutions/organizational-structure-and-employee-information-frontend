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
        key: 'status',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Define Status</p>,
      },
      link: '/recruitment/settings/status',
    },
    {
      item: {
        key: 'talentPoolCategoryTab',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Talent Pool Category</p>,
      },
      link: '/recruitment/settings/talentPoolCategory/talentPoolCategoryTab',
    },
    {
      item: {
        key: 'customFields',
        icon: <TbNotes className="hidden lg:block" />,
        label: <p className="menu-item-label">Template Question</p>,
      },
      link: '/recruitment/settings/customFields',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="h-auto w-auto pr-6 pb-6 pl-3">
        <PageHeader title="Settings" description="Recruitment settings " />

        <div className="flex flex-col lg:flex-row  gap-6 mt-8">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
