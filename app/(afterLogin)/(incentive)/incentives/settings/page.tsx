'use client';

import { redirect } from 'next/navigation';

const Settings = () => {
  redirect(`/incentives/settings/defaultIncentiveCard`);
  return null;
};

export default Settings;
