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

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
interface OnChange {
  onChange: (key: string) => void;
}
const ParentRolePermissionCards: React.FC<OnChange> = (props) => {
  const { tabButton, setCurrentModal, currentModal } = useSettingStore();

  const tabSlug = toSlug(tabButton);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Permission',
      children: (
        <div
          id="settings-role-permission-tab-permission"
          data-cy="settings-role-permission-tab-permission"
        >
          <Permission data-cy="settings-role-permission-permission-component" />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Group Perm.',
      children: (
        <GroupPermissionComponent data-cy="settings-role-permission-group-component" />
      ),
    },
    {
      key: '4',
      label: 'Role',
      children: (
        <RoleComponent data-cy="settings-role-permission-role-component" />
      ),
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
    <div
      className="w-full bg-white  border-none"
      id="settings-role-permission-tabs-container"
      data-cy="settings-role-permission-tabs-container"
    >
      <div
        className="flex justify-between items-center"
        id="settings-role-permission-tabs-header"
        data-cy="settings-role-permission-tabs-header"
      >
        <CustomBreadcrumb
          title={tabButton}
          subtitle=""
          items={[
            { title: 'Home', href: '/' },
            { title: 'Tenants', href: '/tenant-management/tenants' },
          ]}
          data-cy={`settings-role-permission-breadcrumb-${tabSlug}`}
        />
        {tabButton !== 'Permission' && (
          <AccessGuard
            permissions={[Permissions.CreateGroupPermission]}
            id="settings-role-permission-new-btn-guard"
            data-cy="settings-role-permission-new-btn-guard"
          >
            <Button
              type="primary"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              onClick={handleClickNewButton}
              id="settings-role-permission-new-btn"
              data-cy="settings-role-permission-new-btn"
            >
              <span
                className="hidden lg:inline"
                id="settings-role-permission-new-btn-text"
                data-cy="settings-role-permission-new-btn-text"
              >{`New ${tabButton}`}</span>
            </Button>
          </AccessGuard>
        )}
      </div>
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={props?.onChange}
        size="small"
        id="settings-role-permission-tabs"
        data-cy="settings-role-permission-tabs"
      />
    </div>
  );
};

export default ParentRolePermissionCards;
