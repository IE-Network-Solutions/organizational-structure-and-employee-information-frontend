'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export default function MyPayroll() {
  const router = useRouter();
  const { userId } = useAuthenticationStore();

  useEffect(() => {
    if (userId) {
      router.replace(`/employee-information/${userId}?from=myPayroll`);
    }
  }, [router, userId]);

  return null;
}
