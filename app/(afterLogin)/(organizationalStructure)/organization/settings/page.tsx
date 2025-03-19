'use client';
import { redirect } from 'next/navigation';

function Settings() {
  // return <SettingsComponent />;
  redirect('/organization/settings/branches');
  return null;
}
export default Settings;
