'use client';

import dynamic from 'next/dynamic';

const SettinsComponent = dynamic(() => import('./settingsPage'), {
  ssr: false,
});

function Settings() {
  return <SettinsComponent />;
}
export default Settings;
