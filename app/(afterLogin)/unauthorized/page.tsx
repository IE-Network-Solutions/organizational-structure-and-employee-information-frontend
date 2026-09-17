'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      data-cy="unauthorized-page"
    >
      <Result
        status="403"
        title="Unauthorized"
        subTitle="You do not have permission to access this page."
        extra={
          <Button
            type="primary"
            data-cy="unauthorized-go-dashboard"
            onClick={() => router.replace('/dashboard')}
          >
            Go to Dashboard
          </Button>
        }
      />
    </div>
  );
}
