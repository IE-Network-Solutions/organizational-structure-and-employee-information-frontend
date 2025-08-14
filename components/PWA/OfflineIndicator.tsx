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
  position?: 'top' | 'bottom';
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showNotifications = true,
  position = 'top',
  className = '',
}) => {
  const { isOnline } = usePWA();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setWasOffline(true);
      setShowOfflineAlert(true);

      if (showNotifications) {
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

      if (showNotifications) {
        notification.success({
          message: 'Back online',
          description: 'All features are now available. Syncing data...',
          icon: <WifiOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
      }

      // Reset the offline state after showing online notification
      setTimeout(() => {
        setWasOffline(false);
      }, 1000);
    }
  }, [isOnline, wasOffline, showNotifications]);

  const handleRetry = () => {
    window.location.reload();
  };

  const positionClass = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div className={`fixed left-4 right-4 z-50 ${positionClass} ${className}`}>
      {/* Offline Alert */}
      {!isOnline && showOfflineAlert && (
        <Alert
          message="You are offline"
          description={
            <div className="flex items-center justify-between">
              <span>
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
      )}
    </div>
  );
};

// Connection status badge component
export const ConnectionStatus: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { isOnline } = usePWA();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <>
          <WifiOutlined className="text-green-500" />
          <span className="text-green-500 text-sm">Online</span>
        </>
      ) : (
        <>
          <DisconnectOutlined className="text-orange-500" />
          <span className="text-orange-500 text-sm">Offline</span>
        </>
      )}
    </div>
  );
};
