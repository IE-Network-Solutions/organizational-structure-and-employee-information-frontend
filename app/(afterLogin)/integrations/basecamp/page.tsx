'use client';

import React, { useState } from 'react';
import { Card, Switch, Button, Tag, Divider, Collapse } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  BellOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { TbBuildingCommunity } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';

const BasecampIntegrationPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [pingsEnabled, setPingsEnabled] = useState(true);
  const [projectPostsEnabled, setProjectPostsEnabled] = useState(true);
  const [todosEnabled, setTodosEnabled] = useState(true);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const pingsModules = [
    'Job Application Management',
    'Applicant Status Management',
    'Employee Onboarding',
    'Employee Promotion / Position Change',
    'Employment Type Management (probation → permanent)',
    'Salary & Compensation Changes',
    'Resignation Management',
    'Delegation Assignment',
    'Absence / Absenteeism Tracking',
    'Leave Request Submission',
    'Leave Approval / Rejection',
    'Payroll Generation (per employee visibility)',
    'Payroll Slip Generation',
    'Allowance / Benefit Management',
    'Deduction Management',
    'Incentive Management',
    'Daily Plan Submission',
    'Weekly Plan Submission',
    'Recognition Issued',
    'Course Assignment',
  ];

  return (
    <div
      className="min-h-screen bg-[#fafafa] p-3"
      data-cy="basecamp-page-container"
      id="basecamp-page-container"
    >
      <PageHeader
        title="Basecamp Integration"
        description="Connect Selamnew modules with Basecamp — Pings, Project Posts, and To-dos"
        data-cy="basecamp-page-header"
      />
      <div className="mt-3">
        <div
          className="p-6 bg-white rounded-lg"
          data-cy="basecamp-settings-container"
          id="basecamp-settings-container"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6"
            data-cy="basecamp-settings-header"
            id="basecamp-settings-header"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50">
                <TbBuildingCommunity
                  className="text-xl text-orange-500"
                  data-cy="basecamp-settings-header-icon"
                  id="basecamp-settings-header-icon"
                />
              </div>
              <div>
                <h2
                  className="text-xl font-semibold text-gray-900 m-0"
                  data-cy="basecamp-settings-title"
                  id="basecamp-settings-title"
                >
                  Basecamp Integration
                </h2>
                <p
                  className="text-sm text-gray-500 m-0"
                  data-cy="basecamp-settings-subtitle"
                  id="basecamp-settings-subtitle"
                >
                  Connect Selamnew modules with Basecamp — Pings, Project Posts, and To-dos
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
              data-cy="basecamp-settings-connection-status"
              id="basecamp-settings-connection-status"
            >
              {isConnected ? 'Connected' : 'Not Connected'}
            </Tag>
          </div>

          <Divider className="my-4" />

          {/* Connection Card */}
          <Card
            className="mb-6"
            data-cy="basecamp-settings-connection-card"
            id="basecamp-settings-connection-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  className="text-base font-semibold text-gray-900 m-0 mb-1"
                  data-cy="basecamp-connection-title"
                  id="basecamp-connection-title"
                >
                  Basecamp Account Connection
                </h3>
                <p
                  className="text-sm text-gray-500 m-0"
                  data-cy="basecamp-connection-description"
                  id="basecamp-connection-description"
                >
                  {isConnected
                    ? 'Basecamp is connected. Notifications and assignments will sync based on your preferences below.'
                    : 'Connect your Basecamp account to enable Pings (personal notifications), Project Posts (public notifications), and To-dos (your assignments) from Selamnew modules.'}
                </p>
              </div>
              <div className="ml-4">
                {isConnected ? (
                  <Button
                    danger
                    onClick={handleDisconnect}
                    data-cy="basecamp-disconnect-button"
                    id="basecamp-disconnect-button"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    loading={isConnecting}
                    onClick={handleConnect}
                    className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                    data-cy="basecamp-connect-button"
                    id="basecamp-connect-button"
                  >
                    Connect Basecamp
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Integration categories */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <InfoCircleOutlined className="text-orange-500" />
                <span
                  className="text-base font-semibold"
                  data-cy="basecamp-integration-categories-title"
                  id="basecamp-integration-categories-title"
                >
                  Modules to Integrate with Basecamp
                </span>
              </div>
            }
            className="mb-6"
            data-cy="basecamp-integration-categories-card"
            id="basecamp-integration-categories-card"
          >
            <div className="space-y-4">
              {/* Pings */}
              <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BellOutlined className="text-orange-500" />
                    <span
                      className="text-sm font-semibold text-gray-900"
                      data-cy="basecamp-pings-label"
                      id="basecamp-pings-label"
                    >
                      Pings (Personal Notifications)
                    </span>
                  </div>
                  <p
                    className="text-xs text-gray-500 m-0 mb-2"
                    data-cy="basecamp-pings-description"
                    id="basecamp-pings-description"
                  >
                    HR & Employment Lifecycle, Leave & Attendance, Payroll, Performance & Work Management events will generate personal pings in Basecamp.
                  </p>
                  <Collapse
                    ghost
                    size="small"
                    items={[
                      {
                        key: 'pings',
                        label: 'View modules',
                        children: (
                          <ul className="text-xs text-gray-600 pl-4 list-disc space-y-0.5">
                            {pingsModules.map((name) => (
                              <li key={name}>{name}</li>
                            ))}
                          </ul>
                        ),
                      },
                    ]}
                  />
                </div>
                <Switch
                  checked={pingsEnabled}
                  onChange={setPingsEnabled}
                  disabled={!isConnected}
                  data-cy="basecamp-pings-switch"
                  id="basecamp-pings-switch"
                />
              </div>

              {/* Project Posts */}
              <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-orange-500" />
                    <span
                      className="text-sm font-semibold text-gray-900"
                      data-cy="basecamp-project-posts-label"
                      id="basecamp-project-posts-label"
                    >
                      Project Posts (Public Notifications)
                    </span>
                  </div>
                  <p
                    className="text-xs text-gray-500 m-0"
                    data-cy="basecamp-project-posts-description"
                    id="basecamp-project-posts-description"
                  >
                    Organisational Structure Updates and Quarter Completion Announcements will create public project posts in Basecamp.
                  </p>
                </div>
                <Switch
                  checked={projectPostsEnabled}
                  onChange={setProjectPostsEnabled}
                  disabled={!isConnected}
                  data-cy="basecamp-project-posts-switch"
                  id="basecamp-project-posts-switch"
                />
              </div>

              {/* To-dos */}
              <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UnorderedListOutlined className="text-orange-500" />
                    <span
                      className="text-sm font-semibold text-gray-900"
                      data-cy="basecamp-todos-label"
                      id="basecamp-todos-label"
                    >
                      To-dos (&quot;Your Assignments&quot;)
                    </span>
                  </div>
                  <p
                    className="text-xs text-gray-500 m-0"
                    data-cy="basecamp-todos-description"
                    id="basecamp-todos-description"
                  >
                    Daily Plans and Weekly Plans (when not reported) will appear as assignments in Basecamp To-dos.
                  </p>
                </div>
                <Switch
                  checked={todosEnabled}
                  onChange={setTodosEnabled}
                  disabled={!isConnected}
                  data-cy="basecamp-todos-switch"
                  id="basecamp-todos-switch"
                />
              </div>
            </div>
          </Card>

          {/* Info Notice */}
          <div
            className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg"
            data-cy="basecamp-settings-info-notice"
            id="basecamp-settings-info-notice"
          >
            <InfoCircleOutlined className="text-orange-500 text-lg mt-0.5" />
            <div>
              <p
                className="text-sm font-medium text-gray-900 m-0"
                data-cy="basecamp-settings-info-title"
                id="basecamp-settings-info-title"
              >
                How Basecamp Integration Works
              </p>
              <ul className="text-xs text-gray-600 m-0 mt-1 pl-4 space-y-1">
                <li><strong>Pings</strong> — Personal notifications for HR, leave, payroll, and performance events</li>
                <li><strong>Project Posts</strong> — Public announcements for org updates and quarter completion</li>
                <li><strong>To-dos</strong> — Daily and weekly plans surface as &quot;Your Assignments&quot; in Basecamp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasecampIntegrationPage;
