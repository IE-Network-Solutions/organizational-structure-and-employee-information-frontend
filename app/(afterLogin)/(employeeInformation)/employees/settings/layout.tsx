'use client';

import { FC, ReactNode } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { FaUser } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  // Sidebar Menu Items
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'employementType',
        icon: <FaUser className="hidden lg:block" />,
        label: <p>Employment Type</p>,
      },
      link: '/employees/settings/employementType',
    },

    {
      item: {
        key: 'rolePermission',
        icon: <IoMdSettings className="hidden lg:block" />,
        label: 'Role Permission',
      },
      link: '/employees/settings/rolePermission',
    },
    {
      item: {
        key: 'positions',
        icon: <IoMdSettings className="hidden lg:block" />,
        label: 'Positions',
      },
      link: '/employees/settings/positions',
    },
    {
      item: {
        key: 'approvals',
        icon: <IoMdSettings className="hidden lg:block" />,
        label: 'Approvals',
      },
      link: '/employees/settings/approvals',
    },
  ]);

  // Handle Menu Clicks
  // const handleMenuClick: MenuProps['onClick'] = (e) => {
  //   setSelectedKey(e.key);
  // };

  return (
    <div className="min-h-screen bg-[#fafafa] p-3 ">
      <div className="h-auto w-auto">
        <PageHeader
          title="Settings"
          description="Manage your system settings here"
        />

        <div className="flex  flex-col lg:flex-row gap-6  mt-1 sm:mt-3">
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper
            padding="0px"
            className="bg-[#fafafa] flex-1 h-max overflow-x-auto p-0"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
