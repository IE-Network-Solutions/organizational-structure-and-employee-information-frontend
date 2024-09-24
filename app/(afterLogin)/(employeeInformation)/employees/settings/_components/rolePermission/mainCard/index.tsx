'use client';

import React from 'react';
import { Card, Tabs } from 'antd'; // Assuming Ant Design is being used
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
