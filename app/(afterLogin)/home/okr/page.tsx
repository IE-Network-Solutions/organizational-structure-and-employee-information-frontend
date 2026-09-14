'use client';

import OkrSearch from '@/app/(afterLogin)/(okrplanning)/okr/_components/dashboard/searchfilter';
import OkrTab from '@/app/(afterLogin)/(okrplanning)/okr/_components/dashboard/okrTab';

export default function HomeOkrPage() {
  return (
    <div data-cy="home-okr-page" id="home-okr-page">
      <OkrTab
        myOkrOnly
        filterComponent={<OkrSearch data-cy="home-okr-search" embedded />}
        data-cy="home-okr-tab"
      />
    </div>
  );
}
