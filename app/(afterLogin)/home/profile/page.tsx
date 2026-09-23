'use client';

import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import EmployeeDetails from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/page';

export default function HomeProfilePage() {
  const { userId } = useAuthenticationStore();

  return (
    <div id="home-profile-page" data-cy="home-profile-page">
      {userId ? (
        <EmployeeDetails params={{ id: userId }} />
      ) : (
        <Skeleton active paragraph={{ rows: 4 }} />
      )}
    </div>
  );
}
