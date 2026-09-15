'use client';

import { redirect } from 'next/navigation';

const Settings = () => {
  redirect('/incentives/settings/vp/criteria-management');
  return null;
};

export default Settings;
