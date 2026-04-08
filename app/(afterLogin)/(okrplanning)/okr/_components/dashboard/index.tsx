import React from 'react';
import OkrSearch from './searchfilter';
import OkrTab from './okrTab';

export default function Dashboard() {
  return (
    <div
      id="okr-dashboard"
      data-cy="okr-dashboard"
      className="flex flex-col w-full mt-0"
    >
      <div id="okr-tab-section" data-cy="okr-tab-section">
        <OkrTab
          data-cy="okr-tab-section-display-component"
          filterComponent={
            <OkrSearch
              data-cy="okr-search-section-display-component"
              embedded
            />
          }
        />
      </div>
    </div>
  );
}
