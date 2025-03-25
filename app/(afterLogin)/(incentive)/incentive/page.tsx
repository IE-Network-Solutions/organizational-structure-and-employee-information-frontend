import { redirect } from 'next/navigation';

const IncentivePage = () => {
  redirect(`/incentive/_components/all`);
  return null;
};

export default IncentivePage;
