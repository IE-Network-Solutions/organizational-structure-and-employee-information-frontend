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
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotWorkspaceEmptyState from './CopilotWorkspaceEmptyState';
import CopilotSavedChatsPanel from './CopilotSavedChatsPanel';
import { COPILOT_THEME } from './copilotTheme';
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
  resolveCopilotShareUrl,
  type SharePayloadV1,
  reviveMessagesFromPayload,
} from '@/utils/copilotShare';
import { fetchCopilotShareById } from '@/utils/copilotApiService';
import { useGetCopilotPrompts } from '@/store/server/features/copilot/prompts/queries';
import {
  useCreateCopilotPrompt,
  useUpdateCopilotPrompt,
  useDeleteCopilotPrompt,
} from '@/store/server/features/copilot/prompts/mutation';
import {
  getCopilotPromptLabel,
  getPersonalCopilotPrompts,
  mapPersonalCopilotPromptsToSavedSessions,
} from '@/store/server/features/copilot/prompts/interface';

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
  const { userId, tenantId } = useAuthenticationStore();
  const { data: employeeData } = useGetEmployee(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedView, setSharedView] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { data: copilotPromptsRaw, isLoading: savedChatsLoading } =
    useGetCopilotPrompts(!!userId);
  const { mutate: createSavedPrompt } = useCreateCopilotPrompt({ silent: true });
  const { mutate: updateSavedPrompt } = useUpdateCopilotPrompt({ silent: true });
  const { mutate: deleteSavedPrompt } = useDeleteCopilotPrompt();

  const savedChats = useMemo(() => {
    const personal = getPersonalCopilotPrompts(
      copilotPromptsRaw,
      userId,
      tenantId,
    );
    return mapPersonalCopilotPromptsToSavedSessions(personal);
  }, [copilotPromptsRaw, userId, tenantId]);

  const activeStarterPrompt = useMemo(() => {
    const v = inputValue.trim();
    return v || null;
  }, [inputValue]);

  useEffect(() => {
    try {
      localStorage.removeItem(COPILOT_LEGACY_HISTORY_KEY);
      localStorage.removeItem(COPILOT_SAVED_CHATS_KEY);
    } catch {
      /* ignore */
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

  /** Auto-save user question as a personal copilot-prompt when sending. */
  const upsertSavedChatFromUserMessage = useCallback(
    (userMsg: Message) => {
      if (sharedView) return;
      const raw = (userMsg.text || '').trim();
      if (!raw) return;
      const lower = raw.toLowerCase();
      const personal = getPersonalCopilotPrompts(
        copilotPromptsRaw,
        userId,
        tenantId,
      );
      const existing = personal.find(
        (p) => getCopilotPromptLabel(p).trim().toLowerCase() === lower,
      );
      if (existing) {
        updateSavedPrompt({ id: existing.id, title: raw, content: raw });
        return;
      }
      createSavedPrompt({ title: raw, content: raw });
    },
    [
      copilotPromptsRaw,
      createSavedPrompt,
      sharedView,
      tenantId,
      updateSavedPrompt,
      userId,
    ],
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

  const handleRenameSavedChat = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateSavedPrompt(
        { id, title: trimmed, content: trimmed },
        {
          onSuccess: () => message.success('Saved chat renamed.'),
        },
      );
    },
    [updateSavedPrompt],
  );

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
      deleteSavedPrompt(id, {
        onSuccess: () => message.success('Saved chat removed'),
      });
    },
    [deleteSavedPrompt],
  );

  const userInitials =
    employeeData?.firstName?.[0]?.toUpperCase() ||
    employeeData?.lastName?.[0]?.toUpperCase() ||
    'U';
  const userAvatarUrl =
    typeof employeeData?.profileImage === 'string'
      ? employeeData.profileImage
      : undefined;

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
      upsertSavedChatFromUserMessage(userMessage);
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
    [isLoading, addMetadata, sharedView, upsertSavedChatFromUserMessage],
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
      queueMicrotask(() => {
        const wrap = document.getElementById('copilot-input-wrapper');
        const inner = wrap?.querySelector<HTMLInputElement>('input');
        inner?.focus();
      });
    },
    [sharedView],
  );

  const content = (
    <div
      className="flex h-[calc(100vh-130px)] flex-col overflow-hidden bg-white"
      id="copilot-module"
      data-cy="copilot-module"
    >
      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        id="copilot-module-body"
        data-cy="copilot-module-body"
      >
        <div
          className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white"
          id="copilot-module-chat-container"
          data-cy="copilot-module-chat-container"
        >
          <div
            className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto bg-white ${
              messages.length === 0 ? 'flex flex-col' : ''
            }`}
            id="copilot-module-chat-messages"
            data-cy="copilot-module-chat-messages"
          >
            {messages.length === 0 ? (
              <CopilotWorkspaceEmptyState
                onPromptSelect={handleIntentSelect}
                activePrompt={activeStarterPrompt}
              />
            ) : (
              <div className="flex min-h-full flex-col justify-end px-6 py-4 md:px-8 md:pb-6 md:pt-4">
                <CopilotMessages
                  variant="workspace"
                  messages={messages}
                  isLoading={isLoading}
                  userInitials={userInitials}
                  userAvatarUrl={userAvatarUrl}
                  readOnlyShared={sharedView}
                  onShareExchange={handleShareExchange}
                />
              </div>
            )}
          </div>
          <div
            className="flex-shrink-0 border-t border-transparent bg-white"
            id="copilot-module-chat-input-container"
            data-cy="copilot-module-chat-input-container"
          >
            {sharedView ? (
              <div
                className="px-2 pb-3 pt-2"
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

        <div
          className="hidden h-full shrink-0 md:flex md:items-stretch md:justify-end md:pr-4"
          style={{
            width: COPILOT_THEME.workspaceRailWidthPx,
            minWidth: COPILOT_THEME.workspaceRailWidthPx,
          }}
          id="copilot-module-saved-chats-desktop"
          data-cy="copilot-module-saved-chats-desktop"
        >
          <CopilotSavedChatsPanel
            variant="desktop"
            compact
            savedChats={savedChats}
            isLoading={savedChatsLoading}
            onOpenSavedChat={handleOpenSavedChat}
            onDeleteSavedChat={handleDeleteSavedChat}
            sharedView={sharedView}
            onRenameSavedChat={handleRenameSavedChat}
          />
        </div>
      </div>

      <div
        className="mt-0 flex h-[32vh] shrink-0 flex-col overflow-hidden border-t md:hidden"
        style={{
          borderColor: COPILOT_THEME.workspaceRailBorder,
          backgroundColor: COPILOT_THEME.workspaceRailBg,
        }}
        id="copilot-module-saved-chats-mobile"
        data-cy="copilot-module-saved-chats-mobile"
      >
        <CopilotSavedChatsPanel
          variant="mobile"
          savedChats={savedChats}
          isLoading={savedChatsLoading}
          onOpenSavedChat={handleOpenSavedChat}
          onDeleteSavedChat={handleDeleteSavedChat}
          sharedView={sharedView}
          onRenameSavedChat={handleRenameSavedChat}
        />
      </div>
    </div>
  );

  return content;
};

export default CopilotModule;
