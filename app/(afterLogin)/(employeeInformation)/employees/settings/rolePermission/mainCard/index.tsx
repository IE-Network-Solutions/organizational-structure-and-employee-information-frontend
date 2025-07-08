'use client';

import React from 'react';
import { Button, Tabs } from 'antd';
import { FaPlus } from 'react-icons/fa';
import GroupPermissionComponent from '../groupPermission';
import RoleComponent from '../role';
import type { TabsProps } from 'antd';
import Permission from '../permission';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
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
    <div className="w-full bg-white  border-none">
      <div className="flex justify-between items-center">
        <CustomBreadcrumb
          title={tabButton}
          subtitle=""
          items={[
            { title: 'Home', href: '/' },
            { title: 'Tenants', href: '/tenant-management/tenants' },
          ]}
        />
        {tabButton !== 'Permission' && (
          <AccessGuard permissions={[Permissions.CreateGroupPermission]}>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={handleClickNewButton}
            >
              <span className="hidden lg:inline">{`New ${tabButton}`} </span>
            </Button>
          </AccessGuard>
        )}
      </div>
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={props?.onChange}
        size="small"
      />
    </div>
  );
};

export default ParentRolePermissionCards;
