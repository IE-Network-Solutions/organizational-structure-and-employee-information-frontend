'use client';

import { redirect, useParams } from 'next/navigation';

type Params = {
  id: string;
};

const IncentiveSettings = () => {
  const { id } = useParams<Params>();

  if (id && id !== 'vp') {
    redirect('/incentives/settings/vp/criteria-management');
  }

  return null;
};

export default IncentiveSettings;
