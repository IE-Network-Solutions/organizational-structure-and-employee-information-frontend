'use client';
import React, { FC, ReactNode } from 'react';
import Link from 'next/link';
import { Typography, Breadcrumb, Divider, Tabs, Button } from 'antd';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname, useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { ConversationStore } from '@/store/uistate/features/conversation';

const { Title } = Typography;

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface SettingsLayoutProps {
  children: ReactNode;
}
interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CFRSettingLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const layoutSlug = toSlug(pathname || 'settings-layout');
  const { isMobile } = useIsMobile();
  const { setOpen } = ConversationStore();
  const { variantType } = ConversationStore();
  const getActiveKey = () => {
    if (pathname.includes('/define-feedback')) return 'defineFeedback';
    if (pathname.includes('/recognition')) return 'recognition';
    if (pathname.includes('/target-achievement')) return 'targetAchievement';
    if (pathname.includes('/define-meeting-type')) return 'meetingType';
    return 'defineFeedback';
  };

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'defineFeedback':
        router.push('/feedback/settings/define-feedback');
        break;
      case 'recognition':
        router.push('/feedback/settings/recognition');
        break;
      case 'targetAchievement':
        router.push('/feedback/settings/target-achievement');
        break;
      case 'meetingType':
        router.push('/feedback/settings/define-meeting-type');
        break;
      default:
        router.push('/feedback/settings/define-feedback');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'defineFeedback',
      label: 'Define Feedback',
    },
    {
      key: 'recognition',
      label: 'Recognition',
    },
    {
      key: 'targetAchievement',
      label: 'Target Achievement',
    },
    {
      key: 'meetingType',
      label: 'Meeting Type',
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
          className="pb-4 px-4 py-4"
          data-cy={`settings-page-header-${layoutSlug}`}
        >
          <Title level={4} className="!mb-1 !font-bold !text-gray-700">
            Setting
          </Title>
          <Breadcrumb
            className="text-sm text-gray-400"
            items={[
              {
                title: <Link href="/feedback/conversation">CFR</Link>,
              },
              {
                title: 'Settings',
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
          <div
            data-cy="settings-layout-tabs-container"
            className="px-4 pr-6 mb-4"
          >
            <Tabs
              activeKey={getActiveKey()}
              onChange={handleTabChange}
              items={items}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
                getActiveKey() === 'defineFeedback' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-branches-add-btn-icon"
                        id="org-settings-branches-add-btn-icon"
                      />
                    }
                    type="primary"
                    onClick={() => {
                      setOpen(true);
                    }}
                    data-cy="org-settings-branches-add-btn"
                    id="org-settings-branches-add-btn"
                  >
                    {!isMobile && `Add ${variantType}`}
                  </Button>
                ) : getActiveKey() === 'recognition' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-branches-add-btn-icon"
                        id="org-settings-branches-add-btn-icon"
                      />
                    }
                    type="primary"
                    // onClick={showDrawer}
                    data-cy="org-settings-branches-add-btn"
                    id="org-settings-branches-add-btn"
                  >
                    {!isMobile && 'Category'}
                  </Button>
                ) : getActiveKey() === 'targetAchievement' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-branches-add-btn-icon"
                        id="org-settings-branches-add-btn-icon"
                      />
                    }
                    type="primary"
                    // onClick={showDrawer}
                    data-cy="org-settings-branches-add-btn"
                    id="org-settings-branches-add-btn"
                  >
                    {!isMobile && 'Employee Survey'}
                  </Button>
                ) : getActiveKey() === 'meetingType' ? (
                  <Button
                    className={`h-10 ${isMobile ? 'ml-4' : ''}`}
                    icon={
                      <FaPlus
                        data-cy="org-settings-branches-add-btn-icon"
                        id="org-settings-branches-add-btn-icon"
                      />
                    }
                    type="primary"
                    // onClick={showDrawer}
                    data-cy="org-settings-branches-add-btn"
                    id="org-settings-branches-add-btn"
                  >
                    {!isMobile && 'Meeting Type'}
                  </Button>
                ) : null
              }
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0"
              data-cy="org-settings-tabs"
              id="org-settings-tabs"
            />
          </div>
          <div className="sm:px-5 px-1" data-cy="settings-content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFRSettingLayout;
