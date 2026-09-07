'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Tooltip } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import AnnouncementWorkspace from './_components/AnnouncementWorkspace';
import AnnouncementSettingsPanel from './_components/AnnouncementSettingsPanel';
import AnnouncementMegaphoneIcon from './_components/AnnouncementMegaphoneIcon';

export default function OrganizationAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(
    () => searchParams.get('settings') === '1',
  );
  const openIntegrationWizard = useAnnouncementChannelsStore(
    (state) => state.openIntegrationWizard,
  );
  const integrationWizardOpen = useAnnouncementChannelsStore(
    (state) => state.integrationWizardOpen,
  );

  useEffect(() => {
    if (searchParams.get('settings') === '1') {
      setSettingsOpen(true);
    }
  }, [searchParams]);

  const handleToggleSettings = () => {
    setSettingsOpen((open) => {
      const next = !open;
      router.replace(
        next
          ? '/organization/announcement?settings=1'
          : '/organization/announcement',
      );
      return next;
    });
  };

  return (
    <div
      className="min-h-screen bg-white"
      data-cy="organization-announcement-page"
    >
      <div className="pt-4" data-cy="organization-announcement-header">
        <CustomBreadcrumb
          title={
            <span
              className="text-gray-900 text-2xl font-bold mb-0"
              data-cy="organization-announcement-page-title"
            >
              Announcement
            </span>
          }
          subtitle={
            settingsOpen ? (
              <>
                <a
                  href="/organization/announcement"
                  onClick={(e) => {
                    e.preventDefault();
                    setSettingsOpen(false);
                    router.replace('/organization/announcement');
                  }}
                  data-cy="organization-announcement-breadcrumb-announcement-link"
                >
                  Announcement
                </a>
                <span data-cy="organization-announcement-breadcrumb-separator">
                  {' '}
                  /{' '}
                </span>
                <span data-cy="organization-announcement-breadcrumb-current">
                  Settings
                </span>
              </>
            ) : (
              <>
                <a
                  href="/organization/chart"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/organization/chart');
                  }}
                  data-cy="organization-announcement-breadcrumb-organization-link"
                >
                  Organization
                </a>
                <span data-cy="organization-announcement-breadcrumb-separator">
                  {' '}
                  /{' '}
                </span>
                <span data-cy="organization-announcement-breadcrumb-current">
                  Announcement
                </span>
              </>
            )
          }
          titleExtra={
            <div
              className="flex items-center gap-2"
              data-cy="organization-announcement-header-actions"
            >
              {settingsOpen && !integrationWizardOpen ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openIntegrationWizard()}
                  data-cy="organization-announcement-settings-add"
                >
                  Add
                </Button>
              ) : null}
              <Tooltip
                title={settingsOpen ? 'Back to Announcement' : 'Settings'}
              >
                <Button
                  type={settingsOpen ? 'primary' : 'default'}
                  icon={
                    settingsOpen ? (
                      <AnnouncementMegaphoneIcon
                        size={16}
                        data-cy="organization-announcement-back-icon"
                      />
                    ) : (
                      <SettingOutlined />
                    )
                  }
                  onClick={handleToggleSettings}
                  aria-label={
                    settingsOpen ? 'Back to Announcement' : 'Settings'
                  }
                  aria-pressed={settingsOpen}
                  data-cy="organization-announcement-settings-toggle"
                />
              </Tooltip>
            </div>
          }
          data-cy="organization-announcement-breadcrumb"
        />
      </div>

      <div className="mt-4" data-cy="organization-announcement-content">
        {settingsOpen ? (
          <AnnouncementSettingsPanel />
        ) : (
          <AnnouncementWorkspace />
        )}
      </div>
    </div>
  );
}
