'use client';

import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import EmployeeDetails from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/page';

export default function HomeProfilePage() {
  const { userId } = useAuthenticationStore();

  if (!userId) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  return <EmployeeDetails params={{ id: userId }} />;
}
