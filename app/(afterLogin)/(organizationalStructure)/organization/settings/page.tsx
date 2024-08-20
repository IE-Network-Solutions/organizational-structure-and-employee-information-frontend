'use client';

import dynamic from 'next/dynamic';

const SettingsComponent = dynamic(() => import('./settingsPage'), {
  ssr: false,
});

function Settings() {
  return <SettingsComponent />;
}
export default Settings;
