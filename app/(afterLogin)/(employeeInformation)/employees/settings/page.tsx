'use client';

import { redirect } from 'next/navigation';

function Settings() {
  redirect('/employees/settings/employementType');
  return null;
}
export default Settings;
