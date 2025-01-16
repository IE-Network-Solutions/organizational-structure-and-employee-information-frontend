'use client';

import { redirect } from 'next/navigation';

const Settings = () => {
  redirect('/incentive/settings/project');
  return null;
};

export default Settings;
