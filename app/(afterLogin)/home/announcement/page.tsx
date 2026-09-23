'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Tooltip } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { useAnnouncementChannelsStore } from '@/store/uistate/features/organizationStructure/announcementChannels';
import AnnouncementWorkspace from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/AnnouncementWorkspace';
import AnnouncementSettingsPanel from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/AnnouncementSettingsPanel';
import AnnouncementMegaphoneIcon from '@/app/(afterLogin)/(organizationalStructure)/organization/announcement/_components/AnnouncementMegaphoneIcon';

const HOME_ANNOUNCEMENT_BASE = '/home/announcement';

export default function HomeAnnouncementPage() {
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
        next ? `${HOME_ANNOUNCEMENT_BASE}?settings=1` : HOME_ANNOUNCEMENT_BASE,
      );
      return next;
    });
  };

  return (
    <div
      className="bg-white"
      data-cy="home-announcement-page"
      id="home-announcement-page"
    >
      <div
        className="flex items-center justify-end gap-2 mb-4"
        data-cy="home-announcement-header-actions"
      >
        {settingsOpen && !integrationWizardOpen ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openIntegrationWizard()}
            data-cy="home-announcement-settings-add"
          >
            Add
          </Button>
        ) : null}
        <Tooltip title={settingsOpen ? 'Back to Announcement' : 'Settings'}>
          <Button
            type={settingsOpen ? 'primary' : 'default'}
            icon={
              settingsOpen ? (
                <AnnouncementMegaphoneIcon
                  size={16}
                  data-cy="home-announcement-back-icon"
                />
              ) : (
                <SettingOutlined />
              )
            }
            onClick={handleToggleSettings}
            aria-label={settingsOpen ? 'Back to Announcement' : 'Settings'}
            aria-pressed={settingsOpen}
            data-cy="home-announcement-settings-toggle"
          />
        </Tooltip>
      </div>

      <div data-cy="home-announcement-content">
        {settingsOpen ? (
          <AnnouncementSettingsPanel />
        ) : (
          <AnnouncementWorkspace />
        )}
      </div>
    </div>
  );
}
