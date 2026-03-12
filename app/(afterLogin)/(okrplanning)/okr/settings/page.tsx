'use client';

import { redirect } from 'next/navigation';

const OkrSettings = () => {
  redirect('/okr/settings/okr-type');
  return null;
};

export default OkrSettings;
