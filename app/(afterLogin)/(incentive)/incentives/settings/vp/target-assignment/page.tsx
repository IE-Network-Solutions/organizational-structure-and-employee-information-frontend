'use client';

import { redirect } from 'next/navigation';

const LegacyIncentiveTargetAssignmentRedirect = () => {
  redirect('/okr/settings/target-assignment');
  return null;
};

export default LegacyIncentiveTargetAssignmentRedirect;
