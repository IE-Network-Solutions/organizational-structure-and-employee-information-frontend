'use client';

import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useRouter } from 'next/navigation';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';

// Layout component definition
export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const router = useRouter();

  const items = [
    {
      key: 'structure',
      icon: <BarChartOutlined />,
      label: 'Structure',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: 'User',
    },
  ];

  // Handling menu click and navigation
  const onMenuClick = (e: any) => {
    const key = e['key'] as string;
    switch (key) {
      case 'structure':
        router.push('/organization/chart/org-structure');
        break;
      case 'user':
        router.push('/organization/chart/org-chart');
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader title="Organizational Structure" description="" />
      <div className="flex justify-end">
        {/* Horizontal Menu */}
        <Menu
          className="w-[300px] rounded-2xl py-2 px-6 h-max"
          items={items}
          mode="horizontal"
          defaultActiveFirst
          onClick={onMenuClick}
        />
        {/* Block wrapper to display the children */}
      </div>
      <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
    </div>
  );
}
