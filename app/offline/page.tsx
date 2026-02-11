'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { WifiOutlined, ReloadOutlined } from '@ant-design/icons';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      data-cy="offline-page"
    >
      <div className="max-w-md w-full mx-4" data-cy="offline-content">
        <Result
          icon={<WifiOutlined className="text-6xl text-gray-400" />}
          title="You're Offline"
          subTitle="Please check your internet connection and try again. Some features may be limited while offline."
          extra={[
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              key="refresh"
            >
              Try Again
            </Button>,
            <Button onClick={handleGoBack} key="back">
              Go Back
            </Button>,
          ]}
        />

        <div className="mt-8 text-center" data-cy="offline-features-container">
          <div
            className="bg-white rounded-lg p-6 shadow-sm"
            data-cy="offline-features-card"
          >
            <h3
              className="text-lg font-semibold mb-2"
              data-cy="offline-features-title"
            >
              Offline Features Available:
            </h3>
            <ul
              className="text-left space-y-2 text-gray-600"
              data-cy="offline-features-list"
            >
              <li data-cy="offline-feature-1">
                • View previously loaded pages
              </li>
              <li data-cy="offline-feature-2">• Access cached employee data</li>
              <li data-cy="offline-feature-3">• View offline documentation</li>
              <li data-cy="offline-feature-4">
                • Use basic calculator functions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
