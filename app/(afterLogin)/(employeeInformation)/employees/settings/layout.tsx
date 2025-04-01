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
        icon: <FaUser />,
        label: <p>Employment Type</p>,
      },
      link: '/employees/settings/employementType',
    },

    {
      item: {
        key: 'rolePermission',
        icon: <IoMdSettings />,
        label: 'Role Permission',
      },
      link: '/employees/settings/rolePermission',
    },
    {
      item: {
        key: 'positions',
        icon: <IoMdSettings />,
        label: 'Positions',
      },
      link: '/employees/settings/positions',
    },
    {
      item: {
        key: 'approvals',
        icon: <IoMdSettings />,
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="h-auto w-auto pr-6 pb-6 pl-3 ">
        <PageHeader
          title="Settings"
          description="Manage your system settings here"
        />

        <div className="flex gap-6 mt-8">
          {/* Sidebar Menu */}
          {/* <Menu
            mode="vertical"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            className="w-60"
            items={menuItems}
          /> */}
          <SidebarMenu menuItems={menuItems} />
          <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>

          {/* Content Area */}
          {/* <BlockWrapper className="flex-1 h-max">
            {selectedKey === 'employment-type' && <EmploymentType />}
            {selectedKey === 'role-permission' && <SettingsPage />}
            {selectedKey === 'positions' && <Positions />}
            {selectedKey === 'approvals' && <Approvals />}
          </BlockWrapper> */}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
