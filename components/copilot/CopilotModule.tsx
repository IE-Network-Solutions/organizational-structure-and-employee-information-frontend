'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { message, Alert } from 'antd';
import CopilotReportsPanelToggle from './CopilotReportsPanelToggle';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotIntentPanel from './CopilotIntentPanel';
import { COPILOT_INTENTS } from './intents';
import {
  sendCopilotChatRequest,
  normalizeCopilotError,
  normalizeCopilotResponse,
  normalizeCopilotTableForDisplay,
  parseCopilotResponse,
  COPILOT_ERROR_MESSAGES,
} from '@/utils/copilotApiService';
import axios from 'axios';
import {
  decodeSharePayload,
  COPILOT_SHARE_QUERY,
  COPILOT_SHARE_REF_QUERY,
  COPILOT_SAVED_CHATS_KEY,
  COPILOT_LEGACY_HISTORY_KEY,
  MAX_SAVED_CHATS,
  reviveSavedSessions,
  resolveCopilotShareUrl,
  type SavedChatSession,
  type SharePayloadV1,
  reviveMessagesFromPayload,
} from '@/utils/copilotShare';
import { fetchCopilotShareById } from '@/utils/copilotApiService';

function persistSavedChats(chats: SavedChatSession[]) {
  const toStore = chats.map((s) => ({
    ...s,
    messages: s.messages.map((m) => ({
      ...m,
      timestamp:
        m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    })),
  }));
  localStorage.setItem(COPILOT_SAVED_CHATS_KEY, JSON.stringify(toStore));
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
const CopilotModule: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIntentPanelVisible, setIsIntentPanelVisible] = useState(true);
  const [savedChats, setSavedChats] = useState<SavedChatSession[]>([]);
  const [sharedView, setSharedView] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeIntentLabel = useMemo(() => {
    const v = inputValue.trim();
    if (!v) return null;
    const lower = v.toLowerCase();
    for (const cat of COPILOT_INTENTS) {
      const hit = cat.intents.find((i) => i.toLowerCase() === lower);
      if (hit) return hit;
    }
    return null;
  }, [inputValue]);

  useEffect(() => {
    try {
      localStorage.removeItem(COPILOT_LEGACY_HISTORY_KEY);
    } catch {
      /* ignore */
    }
    try {
      const stored = localStorage.getItem(COPILOT_SAVED_CHATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        setSavedChats(reviveSavedSessions(parsed).slice(0, MAX_SAVED_CHATS));
      }
    } catch {
      setSavedChats([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const shareRef = params.get(COPILOT_SHARE_REF_QUERY);

    const stripShareParams = () => {
      params.delete(COPILOT_SHARE_QUERY);
      params.delete(COPILOT_SHARE_REF_QUERY);
      const q = params.toString();
      const nextUrl = q ? `${pathname}?${q}` : pathname;
      router.replace(nextUrl, { scroll: false });
    };

    let cancelled = false;

    if (shareRef) {
      const id = shareRef.trim();
      void fetchCopilotShareById(id).then((payload) => {
        if (cancelled) return;
        if (!payload) {
          message.error('This shared link could not be loaded or has expired.');
          return;
        }
        const msgs = reviveMessagesFromPayload(payload as SharePayloadV1);
        if (!msgs?.length) {
          message.error(
            'This shared link could not be loaded or contains no messages.',
          );
          return;
        }
        stripShareParams();
        setMessages(msgs);
        setSharedView(true);
        setInputValue('');
      });
      return () => {
        cancelled = true;
      };
    }

    const raw = params.get(COPILOT_SHARE_QUERY);
    if (!raw) return;

    const msgs = decodeSharePayload(raw);
    if (!msgs?.length) {
      message.error(
        'This shared link could not be loaded or contains no messages.',
      );
      return;
    }
    stripShareParams();
    setMessages(msgs);
    setSharedView(true);
    setInputValue('');
  }, [router, pathname]);

  /** Save icon on user bubble: add this question to Saved immediately (no confirm step). */
  const handleRequestSaveUserQuestion = useCallback(
    (userMsg: Message) => {
      if (sharedView) return;
      const raw = (userMsg.text || '').trim();
      if (!raw) return;
      const session: SavedChatSession = {
        id: `saved_${Date.now()}`,
        title: raw,
        messages: [
          {
            ...userMsg,
            timestamp: new Date(userMsg.timestamp),
          },
        ],
        savedAt: new Date().toISOString(),
      };
      setSavedChats((prev) => {
        const next = [session, ...prev].slice(0, MAX_SAVED_CHATS);
        persistSavedChats(next);
        return next;
      });
      setIsIntentPanelVisible(true);
      message.success('Question saved to Saved reports.');
    },
    [sharedView],
  );

  const handleShareExchange = useCallback(
    async (userMsg: Message, copilotMsg: Message) => {
      const pair: Message[] = [
        { ...userMsg, timestamp: new Date(userMsg.timestamp) },
        { ...copilotMsg, timestamp: new Date(copilotMsg.timestamp) },
      ];
      const { url, error } = await resolveCopilotShareUrl(pair);
      if (error === 'too_large') {
        message.warning('This Q&A is too long to share as a link.');
        return;
      }
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        message.success('Link copied (this question and answer only).');
      } catch {
        message.error('Could not copy to clipboard.');
      }
    },
    [],
  );

  const handleRenameSavedChat = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSavedChats((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, title: trimmed } : s,
      );
      persistSavedChats(next);
      return next;
    });
    message.success('Saved chat renamed.');
  }, []);

  /** Saved pill click: put the question in the composer (do not replace the chat). */
  const handleOpenSavedChat = useCallback(
    (id: string) => {
      const s = savedChats.find((x) => x.id === id);
      if (!s) return;
      const firstUser = s.messages.find((m) => m.sender === 'user');
      const fromUser =
        typeof firstUser?.text === 'string' ? firstUser.text.trim() : '';
      const prompt = (s.title || '').trim() || fromUser;
      if (!prompt) return;
      setSharedView(false);
      setInputValue(prompt);
      queueMicrotask(() => {
        const wrap = document.getElementById('copilot-input-wrapper');
        const inner = wrap?.querySelector<HTMLInputElement>('input');
        inner?.focus();
      });
    },
    [savedChats],
  );

  const handleDeleteSavedChat = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSavedChats((prev) => {
        const next = prev.filter((s) => s.id !== id);
        persistSavedChats(next);
        return next;
      });
      message.success('Saved chat removed');
    },
    [],
  );

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
      if (sharedView) return;
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
              ...(normalized.backendErrors?.length && {
                backendErrors: normalized.backendErrors,
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
        if (tableData) {
          tableData = normalizeCopilotTableForDisplay(tableData);
        }
        const responseType = normalized.responseType;
        const displayText =
          responseType === 'summary'
            ? normalized.answerForMetadata ||
              normalized.displayText ||
              COPILOT_ERROR_MESSAGES.NO_DATA
            : tableData
              ? undefined
              : normalized.displayText || COPILOT_ERROR_MESSAGES.NO_DATA;
        const copilotMessage: Message = {
          id: `msg-${Date.now()}-copilot`,
          text: displayText,
          sender: 'copilot',
          timestamp: new Date(),
          metadata:
            tableData && responseType !== 'summary'
              ? undefined
              : normalized.answerForMetadata
                ? addMetadata(normalized.answerForMetadata)
                : undefined,
          tableData: tableData ?? undefined,
          responseType,
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
    [isLoading, addMetadata, sharedView],
  );

  const handleSend = useCallback(() => {
    if (sharedView) return;
    if (inputValue.trim()) sendQuery(inputValue);
  }, [inputValue, sendQuery, sharedView]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleIntentSelect = useCallback(
    (intent: string) => {
      if (sharedView) {
        message.info(
          'Start a new conversation from the side panel to use available reports.',
        );
        return;
      }
      setInputValue(intent);
    },
    [sharedView],
  );

  const content = (
    <div
      className="flex h-[calc(100vh-130px)] flex-col overflow-hidden bg-white px-2 pb-2 pt-2"
      id="copilot-module"
      data-cy="copilot-module"
    >
      <div
        className="flex min-h-0 flex-1 gap-4 overflow-hidden md:gap-6"
        id="copilot-module-body"
        data-cy="copilot-module-body"
      >
        <div
          className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white"
          id="copilot-module-chat-container"
          data-cy="copilot-module-chat-container"
        >
          <div
            className="min-h-0 flex-1 overflow-y-auto bg-white px-2 py-4 md:px-3 md:py-6"
            id="copilot-module-chat-messages"
            data-cy="copilot-module-chat-messages"
          >
            {messages.length === 0 ? (
              <div
                className="flex h-full min-h-[240px] flex-col items-center justify-center px-4 text-center"
                id="copilot-module-empty-state"
                data-cy="copilot-module-empty-state"
              >
                <p
                  className="max-w-[40rem] text-[15px] font-medium leading-7 text-black md:text-[16px] md:leading-8"
                  id="copilot-module-empty-state-greeting"
                  data-cy="copilot-module-empty-state-greeting"
                >
                  Ask your copilot to get started, Use the available Reports.
                </p>
              </div>
            ) : (
              <CopilotMessages
                messages={messages}
                isLoading={isLoading}
                userInitials={userInitials}
                readOnlyShared={sharedView}
                onSaveUserQuestion={handleRequestSaveUserQuestion}
                onShareExchange={handleShareExchange}
              />
            )}
          </div>
          <div
            className="flex-shrink-0 bg-white"
            id="copilot-module-chat-input-container"
            data-cy="copilot-module-chat-input-container"
          >
            {sharedView ? (
              <div
                className="border-t border-slate-200 px-2 pb-3 pt-2"
                id="copilot-shared-readonly-banner-wrap"
                data-cy="copilot-shared-readonly-banner-wrap"
              >
                <Alert
                  type="info"
                  showIcon
                  message="Read-only shared conversation"
                  description="You can only view this thread. Sign in to continue privately, or close and reopen Copilot to start fresh."
                  className="rounded-xl border-slate-200"
                  id="copilot-shared-readonly-banner"
                  data-cy="copilot-shared-readonly-banner"
                />
              </div>
            ) : (
              <CopilotInput
                variant="workspace"
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                onStop={handleStop}
                isLoading={isLoading}
                placeholder="Ask Your Copilot"
              />
            )}
          </div>
        </div>

        {!isIntentPanelVisible && (
          <div
            className="hidden shrink-0 flex-col items-center justify-start pt-2 md:flex"
            id="copilot-module-reports-toggle-desktop-wrap"
            data-cy="copilot-module-reports-toggle-desktop-wrap"
          >
            <CopilotReportsPanelToggle
              expanded={false}
              onToggle={() => setIsIntentPanelVisible(true)}
              id="copilot-show-intents-button"
            />
          </div>
        )}

        {isIntentPanelVisible && (
          <div
            className="hidden h-full w-[min(320px,22vw)] min-w-[260px] max-w-[340px] shrink-0 flex-col overflow-hidden md:flex"
            id="copilot-module-intent-panel-desktop"
            data-cy="copilot-module-intent-panel-desktop"
          >
            <CopilotIntentPanel
              variant="desktop"
              onIntentSelect={handleIntentSelect}
              onHide={() => setIsIntentPanelVisible(false)}
              activeIntentLabel={activeIntentLabel}
              savedChats={savedChats}
              onOpenSavedChat={handleOpenSavedChat}
              onDeleteSavedChat={handleDeleteSavedChat}
              sharedView={sharedView}
              onRenameSavedChat={handleRenameSavedChat}
            />
          </div>
        )}
      </div>

      {!isIntentPanelVisible && (
        <div
          className="mt-2 flex shrink-0 flex-col items-center gap-2 md:hidden"
          id="copilot-module-show-intents-mobile"
          data-cy="copilot-module-show-intents-mobile"
        >
          <CopilotReportsPanelToggle
            expanded={false}
            onToggle={() => setIsIntentPanelVisible(true)}
            id="copilot-show-intents-button-mobile"
          />
        </div>
      )}

      {isIntentPanelVisible && (
        <div
          className="mt-2 flex h-[38vh] shrink-0 flex-col overflow-hidden md:hidden"
          id="copilot-module-intent-panel-mobile"
          data-cy="copilot-module-intent-panel-mobile"
        >
          <CopilotIntentPanel
            variant="mobile"
            onIntentSelect={handleIntentSelect}
            onHide={() => setIsIntentPanelVisible(false)}
            activeIntentLabel={activeIntentLabel}
            savedChats={savedChats}
            onOpenSavedChat={handleOpenSavedChat}
            onDeleteSavedChat={handleDeleteSavedChat}
            sharedView={sharedView}
            onRenameSavedChat={handleRenameSavedChat}
          />
        </div>
      )}
    </div>
  );

  return content;
};

export default CopilotModule;
