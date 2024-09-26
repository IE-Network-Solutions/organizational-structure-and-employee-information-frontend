import React from 'react';
import OkrSearch from './searchfilter';
import OkrTab from './okrTab';
import OkrProgress from './okrprogress';

export default function Dashboard() {
  return (
    <div>
      <OkrSearch />
      <OkrProgress />
      <OkrTab />
    </div>
  );
}
