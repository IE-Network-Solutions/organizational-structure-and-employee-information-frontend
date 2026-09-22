'use client';

import React, { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Typography, Breadcrumb, Divider, Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname, useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';

const { Title } = Typography;

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

interface SettingsTabItem {
  key: string;
  label: ReactNode;
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

  const items: SettingsTabItem[] = [
    {
      key: 'employementType',
      label: (
        <span
          className={`text-base m-0 ${activeKey === 'employementType' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-employement-type-tab-label"
          id="settings-employement-type-tab-label"
        >
          Employement Type
        </span>
      ),
    },
    {
      key: 'rolePermission',
      label: (
        <span
          className={`text-base m-0 ${activeKey === 'rolePermission' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-role-permission-tab-label"
          id="settings-role-permission-tab-label"
        >
          Role Permission
        </span>
      ),
    },
    {
      key: 'positions',
      label: (
        <span
          className={`text-base m-0 ${activeKey === 'positions' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-positions-tab-label"
          id="settings-positions-tab-label"
        >
          Positions
        </span>
      ),
    },
    {
      key: 'customFields',
      label: (
        <span
          className={`text-base m-0 ${activeKey === 'customFields' ? 'text-primary' : 'text-gray-800'}`}
          data-cy="settings-custom-fields-tab-label"
          id="settings-custom-fields-tab-label"
        >
          Custom Fields
        </span>
      ),
    },
  ];
  const activeTabId = `settings-tab-${activeKey}`;
  const tabExtraContent =
    activeKey === 'employementType' ? (
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
    ) : activeKey === 'rolePermission' ? (
      <RolePermissionNewButton />
    ) : null;

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
          className="pb-4 py-4"
          data-cy={`settings-page-header-${layoutSlug}`}
        >
          <Title level={4} className="!mb-1 !font-bold !text-gray-700">
            Employee Settings
          </Title>
          <Breadcrumb
            className="text-sm text-gray-400"
            items={[
              {
                title: <Link href="/employees/manage-employees">Employee</Link>,
              },
              {
                title: 'Employee Settings',
              },
            ]}
          />
          <Divider className="!my-0 !mt-4 !border-gray-200" />
        </div>

        <div
          id={`settings-layout-body-${layoutSlug}`}
          data-cy={`settings-layout-body-${layoutSlug}`}
        >
          {/* <SidebarMenu menuItems={menuItems} data-cy="settings-sidebar-menu" /> */}
          <div data-cy="settings-layout-tabs-container" className="mb-2">
            <div
              className="flex items-center justify-between gap-3 border-b border-gray-200 text-base"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            >
              <div
                className="flex min-w-0 flex-1 gap-6 overflow-x-auto whitespace-nowrap pr-4"
                role="tablist"
                aria-activedescendant={activeTabId}
                data-cy="settings-tabs-list"
              >
                {items.map((item) => {
                  const selected = activeKey === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      id={`settings-tab-${item.key}`}
                      data-cy={`settings-tab-${item.key}`}
                      aria-selected={selected}
                      onClick={() => handleTabChange(item.key)}
                      className={`border-b-2 px-0 py-4 transition-colors ${
                        selected
                          ? 'border-primary text-primary font-bold'
                          : 'border-transparent text-gray-800 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {tabExtraContent && (
                <div className="shrink-0" data-cy="settings-tabs-extra">
                  {tabExtraContent}
                </div>
              )}
            </div>
          </div>
          <div data-cy="settings-content-wrapper">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
