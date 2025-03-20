'use client';
import { useRouter } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export default function MyPayroll() {
  const router = useRouter();
  const { userId } = useAuthenticationStore();

  return router.push(`/employee-information/${userId}`);
}
