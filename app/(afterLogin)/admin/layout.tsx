'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Card, Divider } from 'antd';
import { TbUserSquare } from 'react-icons/tb';
import CustomBreadcrumb from '@/components/common/breadCramp';

interface AdminLayoutProps {
  children: ReactNode;
}

const getBreadcrumbConfig = (pathname: string) => {
  if (pathname.startsWith('/admin/billing')) {
    return {
      title: 'Billing and Invoice',
      subtitle: 'Admin Console / Billing and Invoice',
    };
  }
  if (pathname.startsWith('/admin/profile')) {
    return {
      title: 'Update Profile',
      subtitle: 'Admin Console / Profile',
    };
  }
  if (pathname.startsWith('/admin/plan')) {
    return {
      title: 'Plan Management',
      subtitle: 'Admin Console / Plan Management',
    };
  }
  if (pathname.startsWith('/admin/invoice')) {
    return {
      title: 'Invoice Details',
      subtitle: 'Admin Console / Billing and Invoice',
    };
  }
  return {
    title: 'Dashboard',
    subtitle: 'Admin Console / Dashboard',
  };
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { title, subtitle } = getBreadcrumbConfig(pathname || '');

  return (
    <div className="h-auto w-auto py-6" data-cy="admin-layout">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6">
        <CustomBreadcrumb title={title} subtitle={subtitle} />
        <Link href="/admin/profile" className="sm:shrink-0">
          <Button
            type="primary"
            icon={<TbUserSquare />}
            data-cy="admin-layout-update-profile"
          >
            Update Profile
          </Button>
        </Link>
      </div>
      <Divider className="!my-0" />
      {/* <Card className="rounded-lg" styles={{ body: { padding: 0 } }}> */}
        <div className="px-6 pt-4 pb-6">{children}</div>
      {/* </Card> */}
    </div>
  );
};

export default AdminLayout;

