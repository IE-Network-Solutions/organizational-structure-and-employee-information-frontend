import { ReactNode } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
}

const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { userData } = useAuthenticationStore();
  const userRole = userData?.role?.slug || '';
  if (roles.includes(userRole)) {
    return <>{children}</>;
  } else {
    return <></>;
  }
};

export default RoleGuard;
