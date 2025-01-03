'use client';
import { redirect } from 'next/navigation';

const CompensationSettings = () => {
  redirect('/compensationSetting/allowanceType');
  return null;
};

export default CompensationSettings;
