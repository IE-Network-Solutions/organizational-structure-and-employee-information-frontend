'use client';

import React from 'react';
import { Card, Tabs } from 'antd'; // Assuming Ant Design is being used
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import GroupPermissionComponent from '../groupPermission';
import RoleComponent from '../role';
import type { TabsProps } from 'antd';
import Permission from '../permission';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
interface OnChange {
  onChange: (key: string) => void;
}
const ParentRolePermissionCards: React.FC<OnChange> = (props) => {
  const { tabButton, setCurrentModal, currentModal } = useSettingStore();

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Permission',
      children: (
        <div>
          <Permission />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Group Perm.',
      children: <GroupPermissionComponent />,
    },
    {
      key: '4',
      label: 'Role',
      children: <RoleComponent />,
    },
  ];
  const handleClickNewButton = () => {
    if (tabButton === 'Group Permission') {
      setCurrentModal(currentModal === 'createModal' ? null : 'createModal');
    } else {
      setCurrentModal(currentModal === 'roleModal' ? null : 'roleModal');
    }
  };
  return (
    <div className="flex gap-2">
      {/* <Card className="hidden md:block md:w-1/5 lg:w-1/5 bg-white">
        <div className="flex space-x-2 font-semibold px-2 py-2 bg-gray-100 overflow-scroll rounded">
          <AiOutlineUnorderedList className="text-xs md:text-sm lg:text-sm text-sky-600 pt-1" />
          <p className="text-[1px] md:text-sm lg:text-sm">
            Roles and permissions
          </p>
        </div> */}
        {/* <div className="flex space-x-2 font-semibold px-1 py-2 mt-5">
          <AiOutlineUnorderedList className="text-sm text-[#949798] pt-1" />
          <p className="text-xs">Logs</p>
        </div> */}
      {/* </Card> */}
      <Card className="w-full md:w-4/5 bg-white top-0">
        <div className="flex flex-col md:flex-row justify-between">
          <CustomBreadcrumb
            title={tabButton}
            subtitle="Admin can see all fields, and do everything the system offers"
            items={[
              { title: 'Home', href: '/' },
              { title: 'Tenants', href: '/tenant-management/tenants' },
            ]}
          />
          {tabButton !== 'Permission' && (
            <CustomButton
              onClick={handleClickNewButton}
              title={`New ${tabButton}`}
              icon={<FaPlus />}
              className="mt-4 md:mt-0"
            />
          )}
        </div>
        <footer>
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={props?.onChange}
            className="font-semibold"
          />
        </footer>
      </Card>
    </div>
  );
};

export default ParentRolePermissionCards;
