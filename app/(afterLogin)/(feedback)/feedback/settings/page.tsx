'use client';

import { redirect } from 'next/navigation';

const CFRSettings = () => {
  redirect('/feedback/settings/recognition');
  return null;
};

export default CFRSettings;
