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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
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

        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              Offline Features Available:
            </h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li>• View previously loaded pages</li>
              <li>• Access cached employee data</li>
              <li>• View offline documentation</li>
              <li>• Use basic calculator functions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
