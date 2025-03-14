'use client';

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const SettingsComponent = dynamic(() => import('./settingsPage'), {
  ssr: false,
});

function Settings() {
  // return <SettingsComponent />;
  redirect('/organization/settings/branches');
  return null;
}
export default Settings;
