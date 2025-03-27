'use client';

import { redirect } from 'next/navigation';

function Settings() {
  redirect('/recruitment/settings/status');
  return null;
}
export default Settings;
