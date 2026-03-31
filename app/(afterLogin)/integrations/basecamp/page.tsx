import { Suspense } from 'react';
import { Skeleton } from 'antd';
import AdminBasecampClient from './AdminBasecampClient';

export default function BasecampPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-5xl">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      }
    >
      <AdminBasecampClient />
    </Suspense>
  );
}
