// 'use client';

// import dynamic from 'next/dynamic';

// const SettingsComponent = dynamic(() => import('./settingsPage'), {
//   ssr: false,
// });

// function Settings() {
//   return <SettingsComponent />;
// }
// export default Settings;

'use client';

import { redirect } from 'next/navigation';

function Settings() {
  redirect('/recruitment/settings/status');
  return null;
}
export default Settings;
