import React from 'react';
import OkrSearch from './searchfilter';
import OkrTab from './okrTab';

export default function Dashboard() {
  return (
    <div className="flex flex-col w-full px-4 md:px-6 py-4 gap-4 mt-0">
      <OkrSearch />
      <OkrTab />
    </div>
  );
}
