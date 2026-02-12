'use client';

import React, { useState } from 'react';
import { Card, Switch, Button, Tag, Divider } from 'antd';
import {
  GoogleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const GoogleCalendarSettingsPage: React.FC = () => {
  // Connection state (will be replaced with real API integration)
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync preferences
  const [syncObjectives, setSyncObjectives] = useState(true);
  const [syncKeyResults, setSyncKeyResults] = useState(true);
  const [syncPlans, setSyncPlans] = useState(true);
  const [syncCheckIns, setSyncCheckIns] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleConnect = async () => {
    setIsConnecting(true);
    // TODO: Implement Google OAuth2 flow for Calendar API
    // This will be replaced with actual Google Calendar OAuth integration
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    // TODO: Implement disconnect / revoke Google Calendar access
    setIsConnected(false);
  };

  return (
    <div
      className="p-6 bg-white rounded-lg"
      data-cy="google-calendar-settings-container"
      id="google-calendar-settings-container"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6"
        data-cy="google-calendar-settings-header"
        id="google-calendar-settings-header"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
            <GoogleOutlined
              className="text-xl text-blue-500"
              data-cy="google-calendar-settings-header-icon"
              id="google-calendar-settings-header-icon"
            />
          </div>
          <div>
            <h2
              className="text-xl font-semibold text-gray-900 m-0"
              data-cy="google-calendar-settings-title"
              id="google-calendar-settings-title"
            >
              Google Calendar Integration
            </h2>
            <p
              className="text-sm text-gray-500 m-0"
              data-cy="google-calendar-settings-subtitle"
              id="google-calendar-settings-subtitle"
            >
              Sync your OKR plans and deadlines to Google Calendar (one-way sync)
            </p>
          </div>
        </div>
        <Tag
          icon={
            isConnected ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={isConnected ? 'success' : 'default'}
          className="text-sm px-3 py-1"
          data-cy="google-calendar-settings-connection-status"
          id="google-calendar-settings-connection-status"
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </Tag>
      </div>

      <Divider className="my-4" />

      {/* Connection Card */}
      <Card
        className="mb-6"
        data-cy="google-calendar-settings-connection-card"
        id="google-calendar-settings-connection-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3
              className="text-base font-semibold text-gray-900 m-0 mb-1"
              data-cy="google-calendar-connection-title"
              id="google-calendar-connection-title"
            >
              Google Account Connection
            </h3>
            <p
              className="text-sm text-gray-500 m-0"
              data-cy="google-calendar-connection-description"
              id="google-calendar-connection-description"
            >
              {isConnected
                ? 'Your Google Calendar is connected. OKR events will automatically sync to your calendar based on your preferences below.'
                : 'Connect your Google account to sync OKR plans, objectives, and key result deadlines to your Google Calendar. Events will be created in your calendar automatically.'}
            </p>
          </div>
          <div className="ml-4">
            {isConnected ? (
              <Button
                danger
                onClick={handleDisconnect}
                data-cy="google-calendar-disconnect-button"
                id="google-calendar-disconnect-button"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<GoogleOutlined />}
                loading={isConnecting}
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                data-cy="google-calendar-connect-button"
                id="google-calendar-connect-button"
              >
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sync Preferences */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <SyncOutlined className="text-blue-500" />
            <span
              className="text-base font-semibold"
              data-cy="google-calendar-sync-preferences-title"
              id="google-calendar-sync-preferences-title"
            >
              Sync Preferences
            </span>
          </div>
        }
        className="mb-6"
        data-cy="google-calendar-sync-preferences-card"
        id="google-calendar-sync-preferences-card"
      >
        {/* Sync Direction Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <ArrowRightOutlined className="text-blue-500" />
          <span
            className="text-sm text-gray-700"
            data-cy="google-calendar-sync-direction-info"
            id="google-calendar-sync-direction-info"
          >
            Events sync from OKR to Google Calendar only. Changes in Google Calendar will not affect your OKR data.
          </span>
        </div>

        <div className="space-y-5">

          {/* Sync Objectives */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="google-calendar-sync-objectives-label"
                id="google-calendar-sync-objectives-label"
              >
                Sync Objectives
              </p>
              <p
                className="text-xs text-gray-500 m-0 mt-0.5"
                data-cy="google-calendar-sync-objectives-description"
                id="google-calendar-sync-objectives-description"
              >
                Create calendar events in Google Calendar for objective deadlines
              </p>
            </div>
            <Switch
              checked={syncObjectives}
              onChange={setSyncObjectives}
              disabled={!isConnected}
              data-cy="google-calendar-sync-objectives-switch"
              id="google-calendar-sync-objectives-switch"
            />
          </div>

          {/* Sync Key Results */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="google-calendar-sync-key-results-label"
                id="google-calendar-sync-key-results-label"
              >
                Sync Key Results
              </p>
              <p
                className="text-xs text-gray-500 m-0 mt-0.5"
                data-cy="google-calendar-sync-key-results-description"
                id="google-calendar-sync-key-results-description"
              >
                Create calendar events in Google Calendar for key result milestones and due dates
              </p>
            </div>
            <Switch
              checked={syncKeyResults}
              onChange={setSyncKeyResults}
              disabled={!isConnected}
              data-cy="google-calendar-sync-key-results-switch"
              id="google-calendar-sync-key-results-switch"
            />
          </div>

          {/* Sync Plans */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="google-calendar-sync-plans-label"
                id="google-calendar-sync-plans-label"
              >
                Sync Plans
              </p>
              <p
                className="text-xs text-gray-500 m-0 mt-0.5"
                data-cy="google-calendar-sync-plans-description"
                id="google-calendar-sync-plans-description"
              >
                Sync daily and weekly plans to Google Calendar as calendar events
              </p>
            </div>
            <Switch
              checked={syncPlans}
              onChange={setSyncPlans}
              disabled={!isConnected}
              data-cy="google-calendar-sync-plans-switch"
              id="google-calendar-sync-plans-switch"
            />
          </div>

          {/* Sync Check-ins */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="google-calendar-sync-check-ins-label"
                id="google-calendar-sync-check-ins-label"
              >
                Sync Check-in Reminders
              </p>
              <p
                className="text-xs text-gray-500 m-0 mt-0.5"
                data-cy="google-calendar-sync-check-ins-description"
                id="google-calendar-sync-check-ins-description"
              >
                Add check-in reminders to Google Calendar as events based on check-in rules
              </p>
            </div>
            <Switch
              checked={syncCheckIns}
              onChange={setSyncCheckIns}
              disabled={!isConnected}
              data-cy="google-calendar-sync-check-ins-switch"
              id="google-calendar-sync-check-ins-switch"
            />
          </div>

          <Divider className="my-2" />

          {/* Auto Sync */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="google-calendar-auto-sync-label"
                id="google-calendar-auto-sync-label"
              >
                Automatic Sync
              </p>
              <p
                className="text-xs text-gray-500 m-0 mt-0.5"
                data-cy="google-calendar-auto-sync-description"
                id="google-calendar-auto-sync-description"
              >
                Automatically sync OKR changes to Google Calendar in real-time. When off, you&apos;ll need to sync manually.
              </p>
            </div>
            <Switch
              checked={autoSync}
              onChange={setAutoSync}
              disabled={!isConnected}
              data-cy="google-calendar-auto-sync-switch"
              id="google-calendar-auto-sync-switch"
            />
          </div>
        </div>
      </Card>

      {/* Info Notice */}
      <div
        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg"
        data-cy="google-calendar-settings-info-notice"
        id="google-calendar-settings-info-notice"
      >
        <InfoCircleOutlined className="text-blue-500 text-lg mt-0.5" />
        <div>
          <p
            className="text-sm font-medium text-gray-900 m-0"
            data-cy="google-calendar-settings-info-title"
            id="google-calendar-settings-info-title"
          >
            How Google Calendar Sync Works
          </p>
          <ul className="text-xs text-gray-600 m-0 mt-1 pl-4 space-y-1">
            <li>This is a one-way sync from OKR to Google Calendar</li>
            <li>Objectives and key results with due dates will appear as all-day events in your calendar</li>
            <li>Daily and weekly plans will be synced with their scheduled time slots</li>
            <li>Check-in reminders will be added as calendar notifications</li>
            <li>Changes made in Google Calendar will not affect your OKR data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarSettingsPage;


