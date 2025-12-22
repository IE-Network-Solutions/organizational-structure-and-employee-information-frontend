'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';

interface PropData {
  title: string;
  subtitle: string;
}
const AdminSettingHeader: React.FC<PropData> = ({ title, subtitle }) => {
  const headerSlug = title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <div
      className="flex justify-between items-center"
      id={`settings-admin-header-${headerSlug}`}
      data-cy={`settings-admin-header-${headerSlug}`}
    >
      <CustomBreadcrumb
        title={title}
        subtitle={subtitle}
        items={[
          { title: 'Home', href: '/' },
          { title: 'Tenants ', href: '/tenant-management/tenants' },
        ]}
        data-cy={`settings-admin-header-breadcrumb-${headerSlug}`}
      />
    </div>
  );
};

export default AdminSettingHeader;
