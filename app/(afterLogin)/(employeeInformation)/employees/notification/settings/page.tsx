'use client';

import React from 'react';
import Link from 'next/link';
import { Typography, Breadcrumb, Divider } from 'antd';
import { NotificationPreferencesForm } from '@/components/navBar/NotificationPreferencesForm';

const { Title } = Typography;

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen" data-cy="notification-settings-page">
      <div className="w-full" data-cy="notification-settings-page-inner">
        <div className="pb-4 py-4" data-cy="notification-settings-header">
          <Title level={4} className="!mb-1 !font-bold !text-gray-700">
            Notification Settings
          </Title>
          <Breadcrumb
            className="text-sm text-gray-400"
            items={[
              {
                title: <Link href="/employees/notification">Notification</Link>,
              },
              {
                title: 'Notification Settings',
              },
            ]}
          />
          <Divider className="!my-0 !mt-4 !border-gray-200" />
        </div>

        <div
          className="rounded-2xl h-full"
          data-cy="notification-settings-body"
        >
          <NotificationPreferencesForm />
        </div>
      </div>
    </div>
  );
}
