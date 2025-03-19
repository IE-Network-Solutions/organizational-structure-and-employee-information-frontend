'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';

interface PropData {
  title: string;
  subtitle: string;
}
const AdminSettingHeader: React.FC<PropData> = ({ title, subtitle }) => {
  return (
    <div className="flex justify-between items-center">
      <CustomBreadcrumb
        title={title}
        subtitle={subtitle}
        items={[
          { title: 'Home', href: '/' },
          { title: 'Tenants ', href: '/tenant-management/tenants' },
        ]}
      />
    </div>
  );
};

export default AdminSettingHeader;
