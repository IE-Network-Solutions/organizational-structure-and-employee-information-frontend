'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Typography, Button, Dropdown, Tooltip } from 'antd';
import {
  MessageOutlined,
  CloseOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  HistoryOutlined,
  FullscreenOutlined,
  CompressOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotIntentPanel from './CopilotIntentPanel';
import {
  sendCopilotChatRequest,
  normalizeCopilotError,
  normalizeCopilotResponse,
  parseCopilotResponse,
  COPILOT_ERROR_MESSAGES,
} from '@/utils/copilotApiService';
import axios from 'axios';

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
  intent: string,
):
  | {
      type: string;
      title: string;
      columns: Array<{ key: string; title: string; dataIndex: string }>;
      rows: Array<Record<string, any>>;
    }
  | undefined {
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
    {
      title: string;
      columns: Array<{ key: string; title: string; dataIndex: string }>;
    }
  > = {
    active_employee_list: {
      title: 'Active Employee List',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'middleName', title: 'Middle Name', dataIndex: 'middleName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        {
          key: 'departmentName',
          title: 'Department',
          dataIndex: 'departmentName',
        },
        { key: 'positionName', title: 'Position', dataIndex: 'positionName' },
        { key: 'officeName', title: 'Office', dataIndex: 'officeName' },
      ],
    },
    employees_under_probation: {
      title: 'Employees Under Probation',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'middleName', title: 'Middle Name', dataIndex: 'middleName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        {
          key: 'departmentName',
          title: 'Department',
          dataIndex: 'departmentName',
        },
        { key: 'positionName', title: 'Position', dataIndex: 'positionName' },
        { key: 'officeName', title: 'Office', dataIndex: 'officeName' },
        {
          key: 'employmentTypeName',
          title: 'Employment Type',
          dataIndex: 'employmentTypeName',
        },
      ],
    },
    employee_resignation_report: {
      title: 'Employee Resignation Report',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'middleName', title: 'Middle Name', dataIndex: 'middleName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        {
          key: 'departmentName',
          title: 'Department',
          dataIndex: 'departmentName',
        },
        { key: 'positionName', title: 'Position', dataIndex: 'positionName' },
        { key: 'officeName', title: 'Office', dataIndex: 'officeName' },
        {
          key: 'terminationType',
          title: 'Termination Type',
          dataIndex: 'terminationType',
        },
        { key: 'reason', title: 'Reason', dataIndex: 'reason' },
        {
          key: 'effectiveDate',
          title: 'Effective Date',
          dataIndex: 'effectiveDate',
        },
        {
          key: 'resignationSubmittedDate',
          title: 'Resignation Submitted',
          dataIndex: 'resignationSubmittedDate',
        },
      ],
    },
    employee_performance_score_summary: {
      title: 'Performance Score Summary',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'firstName', title: 'First Name', dataIndex: 'firstName' },
        { key: 'middleName', title: 'Middle Name', dataIndex: 'middleName' },
        { key: 'lastName', title: 'Last Name', dataIndex: 'lastName' },
        { key: 'email', title: 'Email', dataIndex: 'email' },
        {
          key: 'departmentName',
          title: 'Department',
          dataIndex: 'departmentName',
        },
        {
          key: 'okrAverageScore',
          title: 'OKR Average Score',
          dataIndex: 'okrAverageScore',
        },
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
    headcount_by_office: {
      title: 'Headcount by Office',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'name', title: 'Office', dataIndex: 'name' },
        { key: 'count', title: 'Count', dataIndex: 'count' },
      ],
    },
    headcount_by_location: {
      title: 'Headcount by Office',
      columns: [
        { key: 'order', title: '', dataIndex: 'order' },
        { key: 'name', title: 'Office', dataIndex: 'name' },
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
        : { order: index + 1, value: String(item) },
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
  if (
    supervisorDataKey &&
    data[supervisorDataKey] &&
    Array.isArray(data[supervisorDataKey])
  ) {
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
      const parts = [user.firstName, user.middleName, user.lastName].filter(
        Boolean,
      );
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
  if (
    userPlannedLateKey &&
    data[userPlannedLateKey] &&
    Array.isArray(data[userPlannedLateKey])
  ) {
    const usersData = data[userPlannedLateKey];
    const planType = userPlannedLateLabels[intent] || 'Plan';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'user', title: 'Team Member', dataIndex: 'user' },
    ];

    const rows = usersData.map((item: any, index: number) => {
      const user = item?.user || {};
      const parts = [user.firstName, user.middleName, user.lastName].filter(
        Boolean,
      );
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
  if (
    userReportsKey &&
    data[userReportsKey] &&
    Array.isArray(data[userReportsKey])
  ) {
    const usersData = data[userReportsKey];
    const reportType = userReportsLabels[intent] || 'Report';

    const columns = [
      { key: 'order', title: '', dataIndex: 'order' },
      { key: 'user', title: 'Team Member', dataIndex: 'user' },
    ];

    const rows = usersData.map((item: any, index: number) => {
      const user = item?.user || {};
      const parts = [user.firstName, user.middleName, user.lastName].filter(
        Boolean,
      );
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
        ? firstUser.text.slice(0, 50) +
          (firstUser.text.length > 50 ? '...' : '')
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
      timestamp:
        typeof m.timestamp === 'string' ? new Date(m.timestamp) : m.timestamp,
    })) as Message[];
    setMessages(revivedMessages);
  }, []);

  const handleDeleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setChatHistory((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        localStorage.setItem(COPILOT_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const handleClearAllHistory = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem(COPILOT_HISTORY_KEY);
  }, []);

  const userInitials =
    employeeData?.firstName?.[0]?.toUpperCase() ||
    employeeData?.lastName?.[0]?.toUpperCase() ||
    'U';

  const addMetadata = useCallback(
    (responseText: string): Message['metadata'] => {
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
    },
    [],
  );

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
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const responseText = await sendCopilotChatRequest(
          query,
          undefined,
          signal,
        );
        const { parsed, parseError } = parseCopilotResponse(responseText);
        if (parseError) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-error`,
              text: COPILOT_ERROR_MESSAGES.UNEXPECTED,
              sender: 'copilot',
              timestamp: new Date(),
              messageType: 'error',
            },
          ]);
          return;
        }

        const normalized = normalizeCopilotResponse(parsed);

        if (!normalized.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-error`,
              text: normalized.displayText,
              sender: 'copilot',
              timestamp: new Date(),
              ...(normalized.messageType && {
                messageType: normalized.messageType,
              }),
              ...(normalized.backend_errors?.length && {
                backend_errors: normalized.backend_errors,
              }),
            },
          ]);
          return;
        }

        let tableData = normalized.tableData;
        if (!tableData && normalized.rawData && normalized.intent) {
          tableData = transformResponseDataToTable(
            normalized.rawData as Record<string, unknown>,
            normalized.intent,
          );
        }
        if (
          tableData &&
          (!Array.isArray(tableData.rows) || tableData.rows.length === 0)
        ) {
          tableData = undefined;
        }
        const displayText = tableData
          ? undefined
          : normalized.displayText || COPILOT_ERROR_MESSAGES.NO_DATA;
        const copilotMessage: Message = {
          id: `msg-${Date.now()}-copilot`,
          text: displayText,
          sender: 'copilot',
          timestamp: new Date(),
          metadata: tableData
            ? undefined
            : normalized.answerForMetadata
              ? addMetadata(normalized.answerForMetadata)
              : undefined,
          tableData: tableData ?? undefined,
        };
        setMessages((prev) => [...prev, copilotMessage]);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
          return;
        }
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          text: normalizeCopilotError(error),
          sender: 'copilot',
          timestamp: new Date(),
          messageType: 'error',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMetadata],
  );

  const handleSend = useCallback(() => {
    if (inputValue.trim()) sendQuery(inputValue);
  }, [inputValue, sendQuery]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleIntentSelect = useCallback((intent: string) => {
    setInputValue(intent);
  }, []);

  const content = (
    <div
      className={`flex flex-col overflow-hidden bg-gray-50 p-4 ${isFullScreen ? 'h-full' : 'h-[calc(100vh-130px)]'}`}
      id="copilot-module"
      data-cy="copilot-module"
    >
      {/* Header with New Chat, History, Full-screen, Close (Azure-style) */}
      <div
        className="flex-shrink-0 flex items-start justify-between pb-3"
        data-cy="copilot-module-header"
      >
        <div data-cy="copilot-module-header-title">
          <Title level={4} className="!mb-0 !text-gray-900">
            SelamNew Copilot
          </Title>
          <Text type="secondary" className="text-xs">
            Ask questions and generate insights from your HR data
          </Text>
        </div>
        <div
          className="flex items-center gap-1"
          data-cy="copilot-module-header-actions"
        >
          <Tooltip title="New Chat">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleNewChat}
              className="text-gray-500 hover:text-blue-600"
              id="copilot-new-chat-button"
              data-cy="copilot-new-chat-button"
            />
          </Tooltip>
          {chatHistory.length > 0 && (
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{ zIndex: 10000 }}
              dropdownRender={() => (
                <div
                  className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[240px] max-w-[320px]"
                  data-cy="copilot-history-dropdown"
                >
                  <div className="max-h-[280px] overflow-y-auto">
                    {chatHistory.slice(0, 20).map((s) => (
                      <div
                        key={s.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleLoadChat(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLoadChat(s);
                          }
                        }}
                        className="flex items-start justify-between gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer group"
                        data-cy={`copilot-history-item-${s.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {s.title || 'New Chat'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.messages?.length ?? 0} messages
                          </p>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="opacity-70 group-hover:opacity-100 flex-shrink-0"
                          aria-label="Delete this chat"
                          data-cy={`copilot-history-delete-${s.id}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2 px-3">
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-sm text-red-600 hover:text-red-700 font-medium w-full text-left"
                      data-cy="copilot-history-clear-all"
                    >
                      Clear All Chats
                    </button>
                  </div>
                </div>
              )}
            >
              <Tooltip title="History">
                <Button
                  type="text"
                  size="small"
                  icon={<HistoryOutlined />}
                  className="text-gray-500 hover:text-blue-600"
                  id="copilot-history-button"
                  data-cy="copilot-history-button"
                />
              </Tooltip>
            </Dropdown>
          )}
          <Tooltip title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
            <Button
              type="text"
              size="small"
              icon={
                isFullScreen ? <CompressOutlined /> : <FullscreenOutlined />
              }
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="text-gray-500 hover:text-blue-600"
              id="copilot-fullscreen-button"
              data-cy="copilot-fullscreen-button"
              aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
            />
          </Tooltip>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            id="copilot-close-button"
            data-cy="copilot-close-button"
            aria-label="Close Copilot"
          />
        </div>
      </div>

      {/* Body: fills all remaining space; both panels scroll independently */}
      <div
        className="flex flex-1 min-h-0 gap-4 overflow-hidden"
        data-cy="copilot-module-body"
      >
        {/* Chat - full width when intents hidden, scrolls internally */}
        <div
          className="flex-1 flex flex-col min-w-0 h-full border border-gray-200 rounded-lg bg-white overflow-hidden"
          data-cy="copilot-module-chat-container"
        >
          <div
            className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 p-4"
            data-cy="copilot-module-chat-messages"
          >
            {messages.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full min-h-[200px] py-8 px-4"
                data-cy="copilot-module-empty-state"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4"
                  data-cy="copilot-module-empty-state-icon"
                >
                  <MessageOutlined className="text-3xl text-gray-400" />
                </div>
                <Text className="text-base text-gray-600 block mb-2">
                  Welcome to SelamNew Copilot
                </Text>
                <Text
                  type="secondary"
                  className="text-sm block text-center max-w-md mb-1"
                >
                  Ask questions about your HR data, get insights, and manage
                  your work more efficiently.
                </Text>
                <Text
                  type="secondary"
                  className="text-xs block text-center max-w-md mb-4"
                >
                  Ready to explore? Click an intent on the right or type your
                  question below.
                </Text>
                <span
                  className="text-[11px] text-gray-400"
                  data-cy="copilot-disclaimer"
                >
                  AI-generated content may be incorrect.
                </span>
              </div>
            ) : (
              <CopilotMessages
                messages={messages}
                isLoading={isLoading}
                userInitials={userInitials}
              />
            )}
          </div>
          <div
            className="flex-shrink-0 border-t border-gray-200 bg-white"
            data-cy="copilot-module-chat-input-container"
          >
            {messages.length > 0 && (
              <p
                className="text-[11px] text-gray-400 px-4 pt-2 pb-0"
                data-cy="copilot-disclaimer-inline"
              >
                AI-generated content may be incorrect.
              </p>
            )}
            <CopilotInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              onStop={handleStop}
              isLoading={isLoading}
              placeholder="Ask for a report... e.g. Monthly attendance, Who's on leave today"
            />
          </div>
        </div>

        {/* Show intents button when panel is hidden - vertical tab outside chat */}
        {!isIntentPanelVisible && (
          <div
            className="flex-shrink-0 hidden md:flex flex-col justify-start"
            data-cy="copilot-module-show-intents-desktop"
          >
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
          <div
            className="w-[300px] flex-shrink-0 h-full hidden md:flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden"
            data-cy="copilot-module-intent-panel-desktop"
          >
            <CopilotIntentPanel
              onIntentSelect={handleIntentSelect}
              onHide={() => setIsIntentPanelVisible(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile: Show reports button when hidden */}
      {!isIntentPanelVisible && (
        <div
          className="md:hidden mt-2 flex-shrink-0"
          data-cy="copilot-module-show-intents-mobile"
        >
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
        <div
          className="md:hidden mt-2 flex-shrink-0 flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden h-[35vh]"
          data-cy="copilot-module-intent-panel-mobile"
        >
          <CopilotIntentPanel
            onIntentSelect={handleIntentSelect}
            onHide={() => setIsIntentPanelVisible(false)}
          />
        </div>
      )}
    </div>
  );

  return isFullScreen ? (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen bg-gray-50 flex flex-col overflow-hidden"
      data-cy="copilot-module-fullscreen-wrapper"
    >
      {content}
    </div>
  ) : (
    content
  );
};

export default CopilotModule;
