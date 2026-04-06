'use client';
import { redirect } from 'next/navigation';

const DeductionPage = () => {
  redirect('/deduction/allDeduction');
  return null;
};

export default DeductionPage;
