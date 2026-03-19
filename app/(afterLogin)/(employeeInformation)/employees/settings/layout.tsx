'use client';

import { FC, ReactNode } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { FaUser } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { usePathname } from 'next/navigation';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const layoutSlug = toSlug(pathname || 'settings-layout');
  // Sidebar Menu Items
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'employementType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/employees/settings/employementType') ? 'lg:ml-4' : ''}`}
            id="settings-menu-employment-type"
            data-cy="settings-menu-employment-type"
          >
            <FaUser
              className={`hidden lg:block ${pathname.includes('/employees/settings/employementType') ? 'text-[#1677FF]' : ''}`}
              data-cy="settings-menu-employment-type-icon"
              id="settings-menu-employment-type-icon"
            />
            <p
              id="settings-menu-employment-type-label"
              data-cy="settings-menu-employment-type-label"
            >
              Employment Type
            </p>
          </div>
        ),
      },
      link: '/employees/settings/employementType',
    },

    {
      item: {
        key: 'rolePermission',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/employees/settings/rolePermission') ? 'lg:ml-4' : ''}`}
            id="settings-menu-role-permission"
            data-cy="settings-menu-role-permission"
          >
            <IoMdSettings
              className={`hidden lg:block ${pathname.includes('/employees/settings/rolePermission') ? 'text-[#1677FF]' : ''}`}
              data-cy="settings-menu-role-permission-icon"
              id="settings-menu-role-permission-icon"
            />
            <p
              id="settings-menu-role-permission-label"
              data-cy="settings-menu-role-permission-label"
            >
              Role Permission
            </p>
          </div>
        ),
      },
      link: '/employees/settings/rolePermission',
    },
    {
      item: {
        key: 'positions',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/employees/settings/positions') ? 'lg:ml-4' : ''}`}
            id="settings-menu-positions"
            data-cy="settings-menu-positions"
          >
            <IoMdSettings
              className={`hidden lg:block ${pathname.includes('/employees/settings/positions') ? 'text-[#1677FF]' : ''}`}
              data-cy="settings-menu-positions-icon"
              id="settings-menu-positions-icon"
            />
            <p
              id="settings-menu-positions-label"
              data-cy="settings-menu-positions-label"
            >
              Positions
            </p>
          </div>
        ),
      },
      link: '/employees/settings/positions',
    },
    // {
    //   item: {
    //     key: 'approvals',
    //     icon: (
    //       <div
    //         className={`lg:flex items-center gap-2 ${pathname.includes('/employees/settings/approvals') ? 'lg:ml-4' : ''}`}
    //         id="settings-menu-approvals"
    //         data-cy="settings-menu-approvals"
    //       >
    //         <IoMdSettings
    //           className={`hidden lg:block ${pathname.includes('/employees/settings/approvals') ? 'text-[#1677FF]' : ''}`}
    //           data-cy="settings-menu-approvals-icon"
    //           id="settings-menu-approvals-icon"
    //         />
    //         <p
    //           id="settings-menu-approvals-label"
    //           data-cy="settings-menu-approvals-label"
    //         >
    //           Approval Workflow
    //         </p>
    //       </div>
    //     ),
    //   },
    //   link: '/employees/settings/approvals',
    // },
  ]);

  // Handle Menu Clicks
  // const handleMenuClick: MenuProps['onClick'] = (e) => {
  //   setSelectedKey(e.key);
  // };

  return (
    <div
      className="min-h-screen bg-[#fafafa] p-3 "
      id={`settings-layout-container-${layoutSlug}`}
      data-cy={`settings-layout-container-${layoutSlug}`}
    >
      <div
        className="h-auto w-auto"
        id={`settings-layout-content-${layoutSlug}`}
        data-cy={`settings-layout-content-${layoutSlug}`}
      >
        <PageHeader
          title="Settings"
          description="Manage your system settings here"
          data-cy={`settings-page-header-${layoutSlug}`}
        />

        <div
          className="flex  flex-col lg:flex-row gap-6  mt-1 sm:mt-3"
          id={`settings-layout-body-${layoutSlug}`}
          data-cy={`settings-layout-body-${layoutSlug}`}
        >
          <SidebarMenu menuItems={menuItems} data-cy="settings-sidebar-menu" />
          <BlockWrapper
            padding="0px"
            className="bg-[#fafafa] flex-1 h-max overflow-x-auto p-0"
            data-cy="settings-content-wrapper"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
