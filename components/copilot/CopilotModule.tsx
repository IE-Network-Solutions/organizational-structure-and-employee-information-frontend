'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Typography, Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MessageOutlined,
  CloseOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotIntentPanel from './CopilotIntentPanel';
import { sendCopilotChatRequest } from '@/utils/copilotApiService';

const { Title, Text } = Typography;

const COPILOT_HISTORY_KEY = 'selamnew-copilot-chat-history';
const MAX_HISTORY_ITEMS = 50;

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface CopilotModuleProps {
  onClose: () => void;
}

/**
 * Transform raw response data into table format for display
 */
function transformResponseDataToTable(
  data: any,
  intent: string
): { type: string; title: string; columns: Array<{ key: string; title: string; dataIndex: string }>; rows: Array<Record<string, any>> } | undefined {
  // Handle supervisor daily/weekly plans and reports
  const supervisorDataKeys: Record<string, string> = {
    daily_plans: 'supervisor_daily_plans_subordinate_unclosed',
    daily_reports: 'supervisor_daily_reports_subordinate_unclosed',
    weekly_plans: 'supervisor_weekly_plans_subordinate_unclosed',
    weekly_reports: 'supervisor_weekly_reports_subordinate_unclosed',
  };

  const supervisorIntentLabels: Record<string, string> = {
    daily_plans: 'Daily Plans',
    daily_reports: 'Daily Reports',
    weekly_plans: 'Weekly Plans',
    weekly_reports: 'Weekly Reports',
  };

  // Handle users who did not plan
  const userDataKeys: Record<string, string> = {
    users_did_not_plan_daily: 'users_did_not_plan_daily',
    users_did_not_plan_weekly: 'users_did_not_plan_weekly',
    users_did_not_plan_monthly: 'users_did_not_plan_monthly',
  };

  const userIntentLabels: Record<string, string> = {
    users_did_not_plan_daily: 'Daily Plan',
    users_did_not_plan_weekly: 'Weekly Plan',
    users_did_not_plan_monthly: 'Monthly Plan',
  };

  // Handle users who planned late
  const userPlannedLateKeys: Record<string, string> = {
    users_planned_late_daily: 'users_planned_late_daily',
    users_planned_late_weekly: 'users_planned_late_weekly',
  };

  const userPlannedLateLabels: Record<string, string> = {
    users_planned_late_daily: 'Daily Plan',
    users_planned_late_weekly: 'Weekly Plan',
  };

  // Handle users who did not report
  const userReportsKeys: Record<string, string> = {
    users_daily_reports: 'users_daily_reports',
    users_weekly_reports: 'users_weekly_reports',
  };

  const userReportsLabels: Record<string, string> = {
    users_daily_reports: 'Daily Report',
    users_weekly_reports: 'Weekly Report',
  };

  // Employee report intents (backend sends data.items or data.table)
  const employeeIntentConfig: Record<
    string,
    { title: string; columns: Array<{ key: string; title: string; dataIndex: string }> }
  > = {
    active_employee_list: {
      title: 'Active Employee List',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        { key: 'departmentName', title: 'Department', dataIndex: 'departmentName' },
        { key: 'positionName', title: 'Position', dataIndex: 'positionName' },
      ],
    },
    employees_under_probation: {
      title: 'Employees Under Probation',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        { key: 'departmentName', title: 'Department', dataIndex: 'departmentName' },
        { key: 'employmentTypeName', title: 'Employment Type', dataIndex: 'employmentTypeName' },
      ],
    },
    employee_resignation_report: {
      title: 'Employee Resignation Report',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'terminationType', title: 'Type', dataIndex: 'terminationType' },
        { key: 'reason', title: 'Reason', dataIndex: 'reason' },
        { key: 'effectiveDate', title: 'Effective Date', dataIndex: 'effectiveDate' },
      ],
    },
    employee_performance_score_summary: {
      title: 'Performance Score Summary',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'score', title: 'Score', dataIndex: 'score' },
        { key: 'rating', title: 'Rating', dataIndex: 'rating' },
      ],
    },
    headcount_by_department: {
      title: 'Headcount by Department',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'name', title: 'Department', dataIndex: 'name' },
        { key: 'count', title: 'Count', dataIndex: 'count' },
      ],
    },
    headcount_by_role: {
      title: 'Headcount by Role',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'name', title: 'Role', dataIndex: 'name' },
        { key: 'count', title: 'Count', dataIndex: 'count' },
      ],
    },
    headcount_by_location: {
      title: 'Headcount by Location',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'name', title: 'Location', dataIndex: 'name' },
        { key: 'count', title: 'Count', dataIndex: 'count' },
      ],
    },
  };

  // Check employee intents first (data.items from backend)
  const employeeConfig = intent ? employeeIntentConfig[intent] : null;
  if (employeeConfig && data?.items && Array.isArray(data.items)) {
    const rows = data.items.map((item: any, index: number) =>
      typeof item === 'object' && item !== null
        ? { order: index + 1, ...item }
        : { order: index + 1, value: String(item) }
    );
    if (rows.length > 0) {
      return {
        type: 'table',
        title: employeeConfig.title,
        columns: employeeConfig.columns,
        rows,
      };
    }
  }

  // Check for supervisor data first
  const supervisorDataKey = supervisorDataKeys[intent];
  if (supervisorDataKey && data[supervisorDataKey] && Array.isArray(data[supervisorDataKey])) {
    const unclosedData = data[supervisorDataKey];
    const planType = supervisorIntentLabels[intent] || 'Plans';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'supervisor', title: 'Supervisor', dataIndex: 'supervisor' },
    ];

    const rows = unclosedData.map((item: any, index: number) => {
      const supervisor = item?.supervisor || {};
      const parts = [
        supervisor.firstName,
        supervisor.middleName,
        supervisor.lastName,
      ].filter(Boolean);
      const supervisorName = parts.join(' ').trim() || 'Unknown';
      
      return {
        order: index + 1,
        supervisor: supervisorName,
      };
    });

    if (rows.length === 0) {
      return undefined;
    }

    return {
      type: 'table',
      title: `Supervisors with Unclosed ${planType}`,
      columns,
      rows,
    };
  }

  // Check for user data (users who did not plan)
  const userDataKey = userDataKeys[intent];
  if (userDataKey && data[userDataKey] && Array.isArray(data[userDataKey])) {
    const usersData = data[userDataKey];
    const planType = userIntentLabels[intent] || 'Plan';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'user', title: 'Team Member', dataIndex: 'user' },
    ];

    const rows = usersData.map((item: any, index: number) => {
      const user = item?.user || {};
      const parts = [
        user.firstName,
        user.middleName,
        user.lastName,
      ].filter(Boolean);
      const userName = parts.join(' ').trim() || 'Unknown';
      
      return {
        order: index + 1,
        user: userName,
      };
    });

    if (rows.length === 0) {
      return undefined;
    }

    return {
      type: 'table',
      title: `Team Members Who Did Not Submit ${planType}`,
      columns,
      rows,
    };
  }

  // Check for users who planned late
  const userPlannedLateKey = userPlannedLateKeys[intent];
  if (userPlannedLateKey && data[userPlannedLateKey] && Array.isArray(data[userPlannedLateKey])) {
    const usersData = data[userPlannedLateKey];
    const planType = userPlannedLateLabels[intent] || 'Plan';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'user', title: 'Team Member', dataIndex: 'user' },
    ];

    const rows = usersData.map((item: any, index: number) => {
      const user = item?.user || {};
      const parts = [
        user.firstName,
        user.middleName,
        user.lastName,
      ].filter(Boolean);
      const userName = parts.join(' ').trim() || 'Unknown';
      
      return {
        order: index + 1,
        user: userName,
      };
    });

    if (rows.length === 0) {
      return undefined;
    }

    return {
      type: 'table',
      title: `Team Members Who Submitted ${planType} Late`,
      columns,
      rows,
    };
  }

  // Check for users who did not report
  const userReportsKey = userReportsKeys[intent];
  if (userReportsKey && data[userReportsKey] && Array.isArray(data[userReportsKey])) {
    const usersData = data[userReportsKey];
    const reportType = userReportsLabels[intent] || 'Report';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'user', title: 'Team Member', dataIndex: 'user' },
    ];

    const rows = usersData.map((item: any, index: number) => {
      const user = item?.user || {};
      const parts = [
        user.firstName,
        user.middleName,
        user.lastName,
      ].filter(Boolean);
      const userName = parts.join(' ').trim() || 'Unknown';
      
      return {
        order: index + 1,
        user: userName,
      };
    });

    if (rows.length === 0) {
      return undefined;
    }

    return {
      type: 'table',
      title: `Team Members Who Did Not Submit ${reportType}`,
      columns,
      rows,
    };
  }

  return undefined;
}

/**
 * CopilotModule - Full-width overlay that replaces main content when opened
 *
 * Triggered by the Copilot button (no route). Layout: Header | [Chat | Intents].
 * Intents are collapsible by default so chat area is visible without scrolling.
 */
const CopilotModule: React.FC<CopilotModuleProps> = ({ onClose }) => {
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIntentPanelVisible, setIsIntentPanelVisible] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COPILOT_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSession[];
        const revived = (parsed || []).map((s) => ({
          ...s,
          messages: (s.messages || []).map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setChatHistory(revived.slice(0, MAX_HISTORY_ITEMS));
      }
    } catch {
      setChatHistory([]);
    }
  }, []);

  const saveToHistory = useCallback((msgs: Message[]) => {
    if (msgs.length === 0) return;
    const firstUser = msgs.find((m) => m.sender === 'user');
    const title =
      firstUser?.text && typeof firstUser.text === 'string'
        ? firstUser.text.slice(0, 50) + (firstUser.text.length > 50 ? '...' : '')
        : 'Chat';
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      title,
      messages: msgs,
      createdAt: new Date().toISOString(),
    };
    setChatHistory((prev) => {
      const next = [session, ...prev].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(COPILOT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) saveToHistory(messages);
    setMessages([]);
    setInputValue('');
  }, [messages, saveToHistory]);

  const handleLoadChat = useCallback((session: ChatSession) => {
    const revivedMessages = session.messages.map((m) => ({
      ...m,
      timestamp: typeof m.timestamp === 'string' ? new Date(m.timestamp) : m.timestamp,
    })) as Message[];
    setMessages(revivedMessages);
  }, []);

  const userInitials =
    employeeData?.firstName?.[0]?.toUpperCase() ||
    employeeData?.lastName?.[0]?.toUpperCase() ||
    'U';

  const addMetadata = useCallback((responseText: string): Message['metadata'] => {
    const metadata: Message['metadata'] = {};
    if (
      responseText.includes('attendance records') ||
      responseText.includes('Time & Attendance')
    ) {
      metadata.source = 'Time & Attendance';
      metadata.confidence = 'Based on attendance records';
    } else if (
      responseText.includes('OKR data') ||
      responseText.includes('OKR System')
    ) {
      metadata.source = 'OKR System';
      metadata.confidence = 'From OKR data';
    } else if (
      responseText.includes('organizational structure') ||
      responseText.includes('Employee & Organization')
    ) {
      metadata.source = 'Employee & Organization';
      metadata.confidence = 'Based on organizational structure data';
    } else if (responseText.includes('Authentication successful')) {
      metadata.source = 'Copilot Service';
      metadata.confidence = 'Authenticated with backend';
    }
    return metadata;
  }, []);

  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isLoading) return;

      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        text: query,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const responseText = await sendCopilotChatRequest(query);
        // Parse response to extract answer and table data
        let parsedResponse: { success?: boolean; answer: string; data?: any; intent?: string; error?: string };
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          // Fallback if response is plain text
          parsedResponse = { success: true, answer: responseText };
        }
        
        // Check if the request failed
        if (parsedResponse.success === false || parsedResponse.error) {
          const errorMessage: Message = {
            id: `msg-${Date.now()}-error`,
            text: parsedResponse.answer || parsedResponse.error || 'Unable to fetch data. Please try again.',
            sender: 'copilot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          return;
        }
        
        // Transform raw data to table format if backend doesn't send table structure
        let tableData = parsedResponse.data?.table;
        if (!tableData && parsedResponse.data && parsedResponse.intent) {
          tableData = transformResponseDataToTable(parsedResponse.data, parsedResponse.intent);
        }
        
        // Only show text if no table data is available (hide repeated text when table is shown)
        const copilotMessage: Message = {
          id: `msg-${Date.now()}-copilot`,
          text: tableData ? undefined : (parsedResponse.answer || responseText), // Hide text when table is available
          sender: 'copilot',
          timestamp: new Date(),
          metadata: tableData ? undefined : addMetadata(parsedResponse.answer || responseText),
          tableData: tableData, // Include table data (from backend or transformed)
        };
        setMessages((prev) => [...prev, copilotMessage]);
      } catch (error) {
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          text:
            error instanceof Error
              ? error.message
              : 'Sorry, I encountered an error. Please try again.',
          sender: 'copilot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMetadata]
  );

  const handleSend = useCallback(() => {
    if (inputValue.trim()) sendQuery(inputValue);
  }, [inputValue, sendQuery]);

  const handleIntentSelect = useCallback((intent: string) => {
    setInputValue(intent);
  }, []);

  return (
    <div
      className="flex flex-col h-[calc(100vh-130px)] overflow-hidden bg-gray-50 p-4"
      data-cy="copilot-module"
    >
      {/* Header with New Chat, History, Close */}
      <div className="flex-shrink-0 flex items-start justify-between pb-3">
        <div>
          <Title level={4} className="!mb-0 !text-gray-900">
            SelamNew Copilot
          </Title>
          <Text type="secondary" className="text-xs">
            Ask questions and generate insights from your HR data
          </Text>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip title="New Chat">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleNewChat}
              className="text-gray-500 hover:text-blue-600"
              data-cy="copilot-new-chat-button"
            />
          </Tooltip>
          {chatHistory.length > 0 && (
            <Dropdown
              menu={{
                items: chatHistory.slice(0, 20).map((s) => ({
                  key: s.id,
                  label: s.title,
                  onClick: () => handleLoadChat(s),
                })) as MenuProps['items'],
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip title="History">
                <Button
                  type="text"
                  size="small"
                  icon={<HistoryOutlined />}
                  className="text-gray-500 hover:text-blue-600"
                  data-cy="copilot-history-button"
                />
              </Tooltip>
            </Dropdown>
          )}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            data-cy="copilot-close-button"
            aria-label="Close Copilot"
          />
        </div>
      </div>

      {/* Body: fills all remaining space; both panels scroll independently */}
      <div className="flex flex-1 min-h-0 gap-4 overflow-hidden">
        {/* Chat - full width when intents hidden, scrolls internally */}
        <div className="flex-1 flex flex-col min-w-0 h-full border border-gray-200 rounded-lg bg-white overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <MessageOutlined className="text-3xl text-gray-400" />
                </div>
                <Text className="text-base text-gray-600 block mb-2">
                  Welcome to SelamNew Copilot
                </Text>
                <Text
                  type="secondary"
                  className="text-sm block text-center max-w-md"
                >
                  Ask questions about your HR data, get insights, and manage your
                  work more efficiently. Click an intent on the right to copy it
                  to the input, edit if needed, then send. Or type your question
                  below.
                </Text>
              </div>
            ) : (
              <CopilotMessages
                messages={messages}
                isLoading={isLoading}
                userInitials={userInitials}
              />
            )}
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <CopilotInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              isLoading={isLoading}
              placeholder="Ask for a report... e.g. Monthly attendance, Who's on leave today"
            />
          </div>
        </div>

        {/* Show intents button when panel is hidden - vertical tab outside chat */}
        {!isIntentPanelVisible && (
          <div className="flex-shrink-0 hidden md:flex flex-col justify-start">
            <Button
              type="primary"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setIsIntentPanelVisible(true)}
              className="shadow-lg flex items-center gap-2 h-auto py-3 px-4"
              title="Show available reports"
              data-cy="copilot-show-intents-button"
            >
              Reports
            </Button>
          </div>
        )}

        {/* Right: Intent Panel - toggleable, fixed height, own scroll */}
        {isIntentPanelVisible && (
          <div className="w-[300px] flex-shrink-0 h-full hidden md:flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">
            <CopilotIntentPanel
              onIntentSelect={handleIntentSelect}
              onHide={() => setIsIntentPanelVisible(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile: Show reports button when hidden */}
      {!isIntentPanelVisible && (
        <div className="md:hidden mt-2 flex-shrink-0">
          <Button
            type="primary"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setIsIntentPanelVisible(true)}
            className="w-full shadow-lg flex items-center justify-center gap-2"
            data-cy="copilot-show-intents-button-mobile"
          >
            Show Available Reports
          </Button>
        </div>
      )}

      {/* Mobile: Intent panel below chat, toggleable */}
      {isIntentPanelVisible && (
        <div className="md:hidden mt-2 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden h-[35vh]">
          <CopilotIntentPanel
            onIntentSelect={handleIntentSelect}
            onHide={() => setIsIntentPanelVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

export default CopilotModule;
