'use client';

import { redirect } from 'next/navigation';

const DefaultIncentiveSettingCard = () => {
  redirect('/incentives/settings/vp/criteria-management');
  return null;
};

export default DefaultIncentiveSettingCard;
