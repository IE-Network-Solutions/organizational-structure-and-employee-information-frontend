'use client';

import { redirect } from 'next/navigation';

const Settings = () => {
  redirect('/settings/tax-rule');
  return null;
};

export default Settings;
