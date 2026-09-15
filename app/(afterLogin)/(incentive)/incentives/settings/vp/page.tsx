'use client';

import { redirect } from 'next/navigation';

const VpSettingsPage = () => {
  redirect('/incentives/settings/vp/criteria-management');
  return null;
};

export default VpSettingsPage;
