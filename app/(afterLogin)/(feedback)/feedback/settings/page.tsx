'use client';

import { redirect } from 'next/navigation';

const CFRSettings = () => {
  redirect('/feedback/settings/define-feedback');
  return null;
};

export default CFRSettings;
