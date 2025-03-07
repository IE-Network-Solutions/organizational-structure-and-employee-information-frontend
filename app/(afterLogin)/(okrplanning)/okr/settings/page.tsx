'use client';

import { redirect } from 'next/navigation';

const OkrSettings = () => {
  redirect('/okr/settings/planning-period');
  return null;
};

export default OkrSettings;
