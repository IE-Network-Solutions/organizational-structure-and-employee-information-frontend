'use client';

import { redirect } from 'next/navigation';

const Settings = () => {
  redirect(`/incentive/settings/defaultIncentiveCard`);
  return null;
};

export default Settings;
