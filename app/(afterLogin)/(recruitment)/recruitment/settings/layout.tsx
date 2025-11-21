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
            id="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields"
            data-cy="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields"
            className={`lg:flex items-center gap-2 ${pathname.includes('/recruitment/settings/customFields') ? 'lg:ml-4' : ''}`}
          >
            <TbNotes
              id="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields-icon"
              data-cy="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields-icon"
              className={`hidden lg:block ${pathname.includes('/recruitment/settings/customFields') ? 'text-[#1677FF]' : ''}`}
            />
            <p id="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields-label" data-cy="talent-acquisition-settings-layout-sidebar-menu-item-custom-fields-label" className="menu-item-label">Template Question</p>
          </div>
        ),
      },
      link: '/recruitment/settings/customFields',
    },
  ]);

  return (
    <div
      className="min-h-screen bg-[#fafafa] p-3 "
      id="talent-acquisition-settings-layout-container"
      data-cy="talent-acquisition-settings-layout-container"
    >
      <div
        className="h-auto w-auto "
        id="talent-acquisition-settings-layout-header-wrapper"
        data-cy="talent-acquisition-settings-layout-header-wrapper"
      >
        <div
          id="talent-acquisition-settings-header"
          data-cy="talent-acquisition-settings-header"
        >
          <PageHeader title="Settings" description="Recruitment settings " />
        </div>

        <div
          className="flex flex-col lg:flex-row  gap-6 mt-3"
          id="talent-acquisition-settings-layout-content"
          data-cy="talent-acquisition-settings-layout-content"
        >
          <div
            id="talent-acquisition-settings-layout-sidebar"
            data-cy="talent-acquisition-settings-layout-sidebar"
          >
            <SidebarMenu data-cy="talent-acquisition-settings-layout-sidebar-menu" menuItems={menuItems} />
          </div>
          <div
            id="talent-acquisition-settings-layout-content-wrapper"
            data-cy="talent-acquisition-settings-layout-content-wrapper"
            className="flex-1"
          >
            <BlockWrapper
              padding="0px"
              className="h-max bg-[#fafafa] overflow-x-auto p-0 "
              data-cy="talent-acquisition-settings-layout-block-wrapper-children"
            >
              {children}
            </BlockWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
