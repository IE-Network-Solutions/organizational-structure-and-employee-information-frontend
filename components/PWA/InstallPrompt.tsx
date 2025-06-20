'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Card, Space, Typography, Alert } from 'antd';
import {
  DownloadOutlined,
  CloseOutlined,
  MobileOutlined,
  DesktopOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

const { Title, Text, Paragraph } = Typography;

interface InstallPromptProps {
  showMinimal?: boolean;
  autoShow?: boolean;
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  showMinimal = false,
  autoShow = true,
  onInstall,
  onDismiss,
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    installApp, 
    deviceType, 
    isStandalone,
    isCheckingInstallStatus 
  } = usePWA();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (
      autoShow &&
      isInstallable &&
      !isInstalled &&
      !isDismissed &&
      !isStandalone &&
      !isCheckingInstallStatus
    ) {
      // Show after a short delay to not interrupt user experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoShow, isInstallable, isInstalled, isDismissed, isStandalone, isCheckingInstallStatus]);

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
      onInstall?.();
    } catch (error) {
      // console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  const getInstallInstructions = () => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      return (
        <div className="ios-install-instructions">
          <Alert
            message="Install on iOS"
            description={
              <div>
                <Paragraph>
                  1. Tap the <ShareAltOutlined /> share button in your browser
                </Paragraph>
                <Paragraph>
                  2. Scroll down and tap &quot;Add to Home Screen&quot;
                </Paragraph>
                <Paragraph>3. Tap &quot;Add&quot; to install the app</Paragraph>
              </div>
            }
            type="info"
            showIcon
          />
        </div>
      );
    }

    if (/Android/.test(navigator.userAgent)) {
      return (
        <div className="android-install-instructions">
          <Alert
            message="Install on Android"
            description="Tap 'Install' below or look for the install banner in your browser to add this app to your home screen."
            type="info"
            showIcon
          />
        </div>
      );
    }

    return (
      <div className="desktop-install-instructions">
        <Alert
          message="Install on Desktop"
          description="Click 'Install' below or look for the install icon in your browser's address bar to install this app."
          type="info"
          showIcon
        />
      </div>
    );
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return <MobileOutlined className="text-2xl" />;
      case 'tablet':
        return <MobileOutlined className="text-2xl" />;
      default:
        return <DesktopOutlined className="text-2xl" />;
    }
  };

  // Show loading state while checking installation status
  if (isCheckingInstallStatus) {
    if (showMinimal) {
      return (
        <Button
          loading
          className="install-button-minimal"
          disabled
        >
          Checking...
        </Button>
      );
    }
    return null; // Don't show modal while checking
  }

  // Don't show if already installed or not installable
  if (!isInstallable || isInstalled || isStandalone) {
    return null;
  }

  if (showMinimal) {
    return (
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={handleInstall}
        className="install-button-minimal"
      >
        Install App
      </Button>
    );
  }

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <span>Install Selamnew Workspace</span>
          </div>
        }
        open={isVisible}
        onCancel={handleDismiss}
        footer={null}
        width={500}
        className="install-modal"
        closeIcon={<CloseOutlined />}
      >
        <div className="install-prompt-content">
          <Card className="mb-4">
            <div className="text-center mb-4">
              <img
                src="/icons/android/android-launchericon-96-96.png"
                alt="Selamnew Workspace"
                className="w-16 h-16 mx-auto mb-3"
              />
              <Title level={4} className="mb-2">
                Install Selamnew Workspace
              </Title>
              <Text type="secondary" className="text-sm">
                Get the full app experience with offline access, notifications,
                and faster performance.
              </Text>
            </div>

            <div className="features-list mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text>Works offline</Text>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text>Fast loading</Text>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text>Native app experience</Text>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text>Push notifications</Text>
                </div>
              </div>
            </div>

            {getInstallInstructions()}

            <div className="mt-4">
              <Space className="w-full justify-end">
                <Button onClick={handleDismiss}>Maybe Later</Button>
                {!/iPad|iPhone|iPod/.test(navigator.userAgent) && (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleInstall}
                    loading={false}
                  >
                    Install Now
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </div>
      </Modal>
    </>
  );
};
