'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Button, notification } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

interface OfflineIndicatorProps {
  showNotifications?: boolean;
  /** `viewport` = fixed full-width overlay (legacy). `content` = in-flow banner for main content only. */
  variant?: 'viewport' | 'content';
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showNotifications = true,
  variant = 'content',
  className = '',
}) => {
  const { isOnline } = usePWA();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setWasOffline(true);
      setShowOfflineAlert(true);

      if (showNotifications && variant === 'viewport') {
        notification.warning({
          message: 'You are offline',
          description:
            'Some features may be limited while offline. The app will sync when you reconnect.',
          icon: <DisconnectOutlined style={{ color: '#faad14' }} />,
          duration: 5,
        });
      }
    } else if (isOnline && wasOffline) {
      setShowOfflineAlert(false);

      if (showNotifications && variant === 'viewport') {
        notification.success({
          message: 'Back online',
          description: 'All features are now available. Syncing data...',
          icon: <WifiOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
      }

      setTimeout(() => {
        setWasOffline(false);
      }, 1000);
    }
  }, [isOnline, wasOffline, showNotifications, variant]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isOnline && showOfflineAlert && variant === 'content') {
    return (
      <div
        data-cy="pwa-offline-indicator-content"
        className={`sticky top-0 z-[25] mb-3 ${className}`}
      >
        <Alert
          type="warning"
          showIcon
          icon={<DisconnectOutlined />}
          message="You’re offline"
          description="Some features may be limited until you reconnect."
          closable
          onClose={() => setShowOfflineAlert(false)}
          className="border border-amber-200 bg-amber-50/90 text-sm shadow-sm [&_.ant-alert-message]:font-medium [&_.ant-alert-description]:text-xs [&_.ant-alert-description]:text-gray-600"
          action={
            <Button
              size="small"
              type="default"
              icon={<SyncOutlined />}
              onClick={handleRetry}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!isOnline && showOfflineAlert && variant === 'viewport') {
    return (
      <div
        data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-div-67"
        className={`fixed left-4 right-4 top-4 z-50 ${className}`}
      >
        <Alert
          message="You are offline"
          description={
            <div
              data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-div-73"
              className="flex items-center justify-between"
            >
              <span data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-span-74">
                Some features may be limited. Check your internet connection.
              </span>
              <Button
                size="small"
                icon={<SyncOutlined />}
                onClick={handleRetry}
                className="ml-2"
              >
                Retry
              </Button>
            </div>
          }
          type="warning"
          showIcon
          icon={<DisconnectOutlined />}
          closable
          onClose={() => setShowOfflineAlert(false)}
          className="mb-2"
        />
      </div>
    );
  }

  return null;
};

export const ConnectionStatus: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { isOnline } = usePWA();

  return (
    <div
      data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-div-106"
      className={`flex items-center gap-2 ${className}`}
    >
      {isOnline ? (
        <>
          <WifiOutlined className="text-green-500" />
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-span-110"
            className="text-green-500 text-sm"
          >
            Online
          </span>
        </>
      ) : (
        <>
          <DisconnectOutlined className="text-orange-500" />
          <span
            data-cy="organizational-structure-and-employee-information-frontend-components-pwa-offlineindicator-tsx-offlineindicator-span-115"
            className="text-orange-500 text-sm"
          >
            Offline
          </span>
        </>
      )}
    </div>
  );
};
