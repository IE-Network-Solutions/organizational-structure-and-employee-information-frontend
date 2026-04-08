'use client';

import React, { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Tabs, Button } from 'antd';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname, useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import CustomBreadcrumb from '@/components/common/breadCramp';

const RolePermissionNewButton: FC = () => {
  const { tabButton, setCurrentModal, currentModal } = useSettingStore();
  const handleClickNewButton = () => {
    if (tabButton === 'Group Permission') {
      setCurrentModal(currentModal === 'createModal' ? null : 'createModal');
    } else {
      setCurrentModal(currentModal === 'roleModal' ? null : 'roleModal');
    }
  };
  if (tabButton === 'Permission') return null;
  return (
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
        >{`Add New ${tabButton}`}</span>
      </Button>
    </AccessGuard>
  );
};

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
  const router = useRouter();
  const layoutSlug = toSlug(pathname || 'settings-layout');
  const { isMobile } = useIsMobile();
  const { setOpen, setIsEditMode, setEditingEmploymentType } =
    EmployeTypeManagementStore();

  const showDrawer = () => {
    setIsEditMode(false);
    setEditingEmploymentType(null);
    setOpen(true);
  };

  const getActiveKey = () => {
    if (pathname.includes('/employementType')) return 'employementType';
    if (pathname.includes('/rolePermission')) return 'rolePermission';
    if (pathname.includes('/positions')) return 'positions';
    if (pathname.includes('/customFields')) return 'customFields';
    return 'employementType';
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'employementType':
        router.push('/employees/settings/employementType');
        break;
      case 'rolePermission':
        router.push('/employees/settings/rolePermission');
        break;
      case 'positions':
        router.push('/employees/settings/positions');
        break;
      case 'customFields':
        router.push('/employees/settings/customFields');
        break;
      default:
        router.push('/employees/settings/employementType');
    }
  };

  const activeKey = getActiveKey();

  const items: TabsProps['items'] = [
    {
      key: 'employementType',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'employementType' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-employement-type-tab-label"
          id="settings-employement-type-tab-label"
        >
          Employement Type
        </div>
      ),
    },
    {
      key: 'rolePermission',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'rolePermission' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-role-permission-tab-label"
          id="settings-role-permission-tab-label"
        >
          Role Permission
        </div>
      ),
    },
    {
      key: 'positions',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'positions' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-positions-tab-label"
          id="settings-positions-tab-label"
        >
          Positions
        </div>
      ),
    },
    {
      key: 'customFields',
      label: (
        <div
          className={`text-base m-0 ${activeKey === 'customFields' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-custom-fields-tab-label"
          id="settings-custom-fields-tab-label"
        >
          Custom Fields
        </div>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen"
      id={`settings-layout-container-${layoutSlug}`}
      data-cy={`settings-layout-container-${layoutSlug}`}
    >
      <div
        className="w-full"
        id={`settings-layout-content-${layoutSlug}`}
        data-cy={`settings-layout-content-${layoutSlug}`}
      >
        <div
          className="py-2"
          data-cy={`settings-page-header-${layoutSlug}`}
        >
          <CustomBreadcrumb
            title="Employee Settings"
            subtitle={
              <>
                <Link href="/employees/manage-employees">Employee</Link>
                <span> / </span>
                <span>Employee Settings</span>
              </>
            }
            data-cy="employee-settings-breadcrumb"
          />
        </div>

        <div
          id={`settings-layout-body-${layoutSlug}`}
          data-cy={`settings-layout-body-${layoutSlug}`}
        >
          {/* <SidebarMenu menuItems={menuItems} data-cy="settings-sidebar-menu" /> */}
          <div data-cy="settings-layout-tabs-container" className="mb-4">
            <Tabs
              activeKey={getActiveKey()}
              onChange={handleTabChange}
              items={items}
              tabBarGutter={24}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
                getActiveKey() === 'employementType' ? (
                  <AccessGuard
                    permissions={[Permissions.CreateEmploymentType]}
                    id="settings-employment-type-add-btn-guard"
                    data-cy="settings-employment-type-add-btn-guard"
                  >
                    <Button
                      className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                      icon={
                        <FaPlus
                          data-cy="org-settings-branches-add-btn-icon"
                          id="org-settings-branches-add-btn-icon"
                        />
                      }
                      type="primary"
                      onClick={showDrawer}
                      data-cy="org-settings-branches-add-btn"
                      id="org-settings-branches-add-btn"
                    >
                      {!isMobile && 'Add Type'}
                    </Button>
                  </AccessGuard>
                ) : getActiveKey() === 'rolePermission' ? (
                  <RolePermissionNewButton />
                ) : null
              }
              className="text-base [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:font-bold [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            />
          </div>
          <div data-cy="settings-content-wrapper">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
