'use client';

import { redirect } from 'next/navigation';

const NewSetting = () => {
  redirect('/timesheet/leave-management/leaves');
  return null;
};

export default NewSetting;
