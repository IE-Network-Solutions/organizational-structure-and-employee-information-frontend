'use client';
import { redirect } from 'next/navigation';

const AllowancePage = () => {
   redirect('/compensation/allowance/allAllowance');
  return null;
};

export default AllowancePage;