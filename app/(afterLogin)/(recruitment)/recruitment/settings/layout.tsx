'use client';
import { FC, ReactNode } from 'react';
import { TbNotes } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { usePathname } from 'next/navigation';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'status',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/recruitment/settings/status') ? 'lg:ml-4' : ''}`}
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/recruitment/settings/status') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Define Status</p>
          </div>
        ),
      },
      link: '/recruitment/settings/status',
    },
    {
      item: {
        key: 'talentPoolCategoryTab',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/recruitment/settings/talentPoolCategory/talentPoolCategoryTab') ? 'lg:ml-4' : ''}`}
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/recruitment/settings/talentPoolCategory/talentPoolCategoryTab') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Talent Pool Category</p>
          </div>
        ),
      },
      link: '/recruitment/settings/talentPoolCategory/talentPoolCategoryTab',
    },
    {
      item: {
        key: 'customFields',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/recruitment/settings/customFields') ? 'lg:ml-4' : ''}`}
          >
            <TbNotes
              className={`hidden lg:block ${pathname.includes('/recruitment/settings/customFields') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Template Question</p>
          </div>
        ),
      },
      link: '/recruitment/settings/customFields',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] p-3 ">
      <div className="h-auto w-auto ">
        <PageHeader title="Settings" description="Recruitment settings " />

        <div className="flex flex-col lg:flex-row  gap-6 mt-3">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper
            padding="0px"
            className="flex-1 h-max bg-[#fafafa] overflow-x-auto p-0 "
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
