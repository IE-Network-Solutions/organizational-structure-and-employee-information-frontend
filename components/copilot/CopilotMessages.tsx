'use client';

import React, { useRef, useEffect } from 'react';
import {
  Avatar,
  Typography,
  Tag,
  Table,
  Button,
  Alert,
  Collapse,
  Tooltip,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  COPILOT_ERROR_MESSAGES,
  exportCopilotTableToExcel,
  normalizeCopilotTableForDisplay,
  type CopilotTableData,
} from '@/utils/copilotApiService';
import CopilotAiIcon from './CopilotAiIcon';
import CopilotGeneratingDotsIcon from './CopilotGeneratingDotsIcon';
import {
  WarningOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  LinkOutlined,
  FileExcelOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { COPILOT_THEME } from './copilotTheme';

const { Text } = Typography;

function formatMessageTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export interface Message {
  id: string;
  text?: string; // Made optional - can be undefined when table is shown
  sender: 'user' | 'copilot';
  timestamp: Date;
  /** 'permission_denied' = access denied styling; 'error' = generic error styling */
  messageType?: 'permission_denied' | 'error';
  /** Optional backend error details for "Details for support" (developers/support only) */
  backendErrors?: string[];
  metadata?: {
    source?: string;
    confidence?: string;
  };
  tableData?: {
    type: string;
    title?: string;
    columns: Array<{ key: string; title: string; dataIndex: string }>;
    rows: Array<Record<string, any>>;
  };
  /** Backend hint: show as table, list, or summary. When "summary", answer text is primary; when "list", render rows as list. */
  responseType?: 'table' | 'summary' | 'list';
}

interface CopilotMessagesProps {
  messages: Message[];
  isLoading: boolean;
  userInitials?: string;
  userAvatarUrl?: string;
  variant?: 'default' | 'workspace';
  /** Shared read-only thread: hide share on answers */
  readOnlyShared?: boolean;
  /** Share link for this Q&A pair only */
  onShareExchange?: (
    userMessage: Message,
    copilotMessage: Message,
  ) => void | Promise<void>;
}

/**
 * CopilotMessages - Displays conversation messages
 *
 * Features:
 * - User messages (right-aligned, blue accent)
 * - Copilot messages (left-aligned, neutral)
 * - Support for metadata (source, confidence cues)
 * - Auto-scroll to bottom
 * - Loading indicator
 *
 * Future-ready for:
 * - Structured insights (bullets, highlights)
 * - Action suggestions
 * - Charts and tables
 */
function findPrecedingUserMessage(
  messages: Message[],
  copilotIndex: number,
): Message | null {
  for (let i = copilotIndex - 1; i >= 0; i--) {
    if (messages[i].sender === 'user') return messages[i];
  }
  return null;
}

const CopilotMessages: React.FC<CopilotMessagesProps> = ({
  messages,
  isLoading,
  userInitials = 'U',
  userAvatarUrl,
  variant = 'default',
  readOnlyShared = false,
  onShareExchange,
}) => {
  const isWorkspace = variant === 'workspace';
  const showThreadLoading = isLoading && !isWorkspace;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  const safeInstanceKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, '_');

  const renderTable = (
    tableData: NonNullable<Message['tableData']>,
    instanceKey: string,
  ) => {
    const ik = safeInstanceKey(instanceKey);
    return (
      <>
        <div
          className="scrollbar-hide"
          style={{
            overflowX: 'auto',
            maxWidth: '100%',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB',
            background: '#fff',
            width: '100%',
          }}
          id={`copilot-table-wrapper-${ik}`}
          data-cy={`copilot-table-wrapper-${ik}`}
        >
          <Table
            id={`copilot-table-${ik}`}
            data-cy={`copilot-table-${ik}`}
            dataSource={tableData.rows}
            scroll={{ x: 'max-content' }}
            columns={tableData.columns.map((col) => {
              const isFullNameCol =
                col.dataIndex === 'fullName' || col.key === 'fullName';
              return {
                title: col.dataIndex === 'order' ? '' : col.title,
                dataIndex: col.dataIndex,
                key: col.key,
                onHeaderCell: () =>
                  ({
                    'data-column-key': String(col.dataIndex),
                  }) as React.HTMLAttributes<HTMLTableCellElement>,
                onCell: () =>
                  ({
                    'data-column-key': String(col.dataIndex),
                  }) as React.HTMLAttributes<HTMLTableCellElement>,
                ellipsis: false,
                render: (text: any, record: Record<string, unknown>) => {
                  if (col.dataIndex === 'order') {
                    return (
                      <span
                        style={{
                          fontWeight: 600,
                          color: '#1E40AF',
                          display: 'inline-block',
                          minWidth: '30px',
                        }}
                        data-cy="copilot-table-order-cell"
                      >
                        {text}
                      </span>
                    );
                  }

                  if (isFullNameCol) {
                    const url =
                      (record.profileImage as string | undefined) ||
                      (record.profile_image as string | undefined) ||
                      (record.profileUrl as string | undefined) ||
                      (record.profilePictureUrl as string | undefined) ||
                      (record.profilePicture as string | undefined) ||
                      (record.photoUrl as string | undefined) ||
                      (record.avatarUrl as string | undefined) ||
                      (record.avatar as string | undefined) ||
                      (record.imageUrl as string | undefined);
                    const name =
                      String(text ?? '').trim() ||
                      [record.firstName, record.middleName, record.lastName]
                        .filter(
                          (v) => typeof v === 'string' && v.trim().length > 0,
                        )
                        .join(' ')
                        .trim() ||
                      '—';
                    return (
                      <span
                        className="copilot-table-name-cell inline-flex max-w-none items-center gap-2.5 whitespace-nowrap"
                        data-cy="copilot-table-name-cell"
                      >
                        {url ? (
                          <Avatar
                            src={url}
                            size={32}
                            className="shrink-0"
                            alt=""
                          />
                        ) : (
                          <Avatar
                            size={32}
                            icon={<UserOutlined className="text-sm" />}
                            className="shrink-0"
                            style={{
                              backgroundColor: '#E5E7EB',
                              color: '#6B7280',
                            }}
                          />
                        )}
                        <span
                          className="whitespace-nowrap text-[13px] font-medium text-[#374151]"
                          data-cy="copilot-table-name-text"
                        >
                          {name}
                        </span>
                      </span>
                    );
                  }

                  let display: any = text;

                  if (display && typeof display === 'object') {
                    const userLike =
                      'firstName' in display ||
                      'middleName' in display ||
                      'lastName' in display;

                    if (userLike) {
                      const first = (display as any).firstName ?? '';
                      const middle = (display as any).middleName ?? '';
                      const last = (display as any).lastName ?? '';
                      display = [first, middle, last]
                        .map((v) => String(v || '').trim())
                        .filter(Boolean)
                        .join(' ');
                    } else {
                      try {
                        display = JSON.stringify(display);
                      } catch {
                        display = String(display);
                      }
                    }
                  }

                  if (display == null || display === '') {
                    display = '-';
                  }

                  return (
                    <span
                      className="copilot-table-cell-inner block whitespace-nowrap"
                      data-cy="copilot-table-data-cell"
                    >
                      {display}
                    </span>
                  );
                },
                ...(col.dataIndex === 'order'
                  ? {
                      width: 56,
                      align: 'center' as const,
                    }
                  : isFullNameCol
                    ? {
                        minWidth: 200,
                        align: 'left' as const,
                      }
                    : {
                        minWidth: 96,
                      }),
              };
            })}
            pagination={
              tableData.rows.length > 10
                ? {
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    style: { marginTop: '12px', textAlign: 'center' },
                  }
                : false
            }
            size="small"
            className="copilot-table copilot-table-compact"
            rowKey={(record, index) => `row-${index}`}
            bordered={false}
            style={{
              backgroundColor: '#fff',
              tableLayout: 'auto',
              width: '100%',
            }}
          />
        </div>
        <style
          id={`copilot-table-styles-${ik}`}
          data-cy={`copilot-table-styles-${ik}`}
          dangerouslySetInnerHTML={{
            __html: `
              .copilot-table.copilot-table-compact .ant-table {
                table-layout: auto !important;
                width: max-content !important;
                min-width: 100% !important;
                max-width: none !important;
                font-size: 13px !important;
                line-height: 1.45 !important;
              }
              .copilot-table .ant-table-container,
              .copilot-table .ant-table-content,
              .copilot-table .ant-table-body {
                overflow-x: auto !important;
              }
              .copilot-table .ant-table-container {
                min-width: 0 !important;
                border: none !important;
              }
              .copilot-table .ant-table-cell {
                border-inline-end: none !important;
              }
              .copilot-table .ant-table-thead > tr:first-child > th:first-child {
                border-top-left-radius: 10px !important;
              }
              .copilot-table .ant-table-thead > tr:first-child > th:last-child {
                border-top-right-radius: 10px !important;
              }
              .copilot-table .ant-table-thead > tr > th {
                background: #F3F4F6 !important;
                color: #374151 !important;
                font-weight: 600 !important;
                text-align: left !important;
                border-bottom: 1px solid #E0E0E0 !important;
                border-right: none !important;
                border-left: none !important;
                border-top: none !important;
                padding: 10px 14px !important;
                white-space: nowrap !important;
                vertical-align: middle !important;
                font-size: 13px !important;
              }
              .copilot-table .ant-table-tbody > tr > td {
                padding: 10px 14px !important;
                text-align: left !important;
                color: #374151 !important;
                background: #fff !important;
                border-bottom: 1px solid #E0E0E0 !important;
                border-right: none !important;
                border-left: none !important;
                white-space: nowrap !important;
                overflow: visible !important;
                vertical-align: middle !important;
                font-size: 13px !important;
              }
              .copilot-table .ant-table-thead > tr > th[data-column-key="order"],
              .copilot-table .ant-table-tbody > tr > td[data-column-key="order"] {
                width: 1% !important;
                min-width: 48px !important;
                max-width: 72px !important;
                text-align: center !important;
                white-space: nowrap !important;
              }
              .copilot-table .ant-table-tbody > tr:last-child > td {
                border-bottom: none !important;
              }
              .copilot-table .ant-table-thead > tr > th[data-column-key="user"],
              .copilot-table .ant-table-tbody > tr > td[data-column-key="user"] {
                width: auto !important;
                min-width: 0 !important;
              }
              .copilot-table .ant-table-thead > tr > th[data-column-key="supervisor"],
              .copilot-table .ant-table-tbody > tr > td[data-column-key="supervisor"] {
                width: auto !important;
                min-width: 0 !important;
              }
              .copilot-table .ant-table-tbody > tr:hover > td {
                background: #fff !important;
              }
              .copilot-table .ant-pagination-item {
                border-radius: 4px;
              }
              .copilot-table .ant-pagination-item-active {
                background: #1E40AF !important;
                border-color: #1E40AF !important;
              }
              .copilot-table .ant-pagination-item-active a {
                color: #fff !important;
              }
            `,
          }}
        />
      </>
    );
  };

  const renderMessageContent = (message: Message) => {
    const text = message.text;
    const rawTableData = message.tableData;
    const tableData =
      rawTableData?.type === 'table' &&
      Array.isArray(rawTableData.columns) &&
      rawTableData.columns.length > 0
        ? normalizeCopilotTableForDisplay(rawTableData as CopilotTableData)
        : rawTableData;
    const responseType = message.responseType;
    const isPermissionDenied = message.messageType === 'permission_denied';
    const isError = message.messageType === 'error';
    const hasBackendErrors =
      Array.isArray(message.backendErrors) && message.backendErrors.length > 0;
    const mid = safeInstanceKey(message.id);

    return (
      <div
        id={`copilot-message-content-${mid}`}
        data-cy={`copilot-message-content-${mid}`}
      >
        {text &&
          (isPermissionDenied ? (
            <Alert
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              message="Access denied"
              description={text}
              className="mb-3"
              id={`copilot-message-permission-denied-${mid}`}
              data-cy={`copilot-message-permission-denied-${mid}`}
            />
          ) : isError ? (
            <div
              className="mb-3"
              id={`copilot-message-error-wrapper-${mid}`}
              data-cy={`copilot-message-error-wrapper-${mid}`}
            >
              <Text
                className="text-sm leading-relaxed whitespace-pre-wrap block text-gray-700"
                id={`copilot-message-error-text-${mid}`}
                data-cy={`copilot-message-error-text-${mid}`}
              >
                {text}
              </Text>
            </div>
          ) : (
            <Text
              className="copilot-assistant-body mb-3 block whitespace-pre-wrap text-[15px] font-normal leading-[1.5] text-[#333333]"
              id={`copilot-message-text-${mid}`}
              data-cy={`copilot-message-text-${mid}`}
            >
              {text}
            </Text>
          ))}

        {/* Summary: show answer as primary; table optional in collapsible */}
        {responseType === 'summary' &&
          tableData &&
          tableData.type === 'table' &&
          Array.isArray(tableData.rows) &&
          tableData.rows.length > 0 && (
            <div
              id={`copilot-summary-collapse-wrap-${mid}`}
              data-cy={`copilot-summary-collapse-wrap-${mid}`}
            >
              <Collapse
                ghost
                size="small"
                className="mt-2 mb-3"
                items={[
                  {
                    key: 'table',
                    label: (
                      <span
                        className="text-sm text-gray-600"
                        id={`copilot-summary-show-table-${mid}`}
                        data-cy={`copilot-summary-show-table-${mid}`}
                      >
                        Show table ({tableData.rows.length} rows)
                      </span>
                    ),
                    children: (
                      <div
                        className="relative z-0"
                        id={`copilot-summary-table-content-${mid}`}
                        data-cy={`copilot-summary-table-content-${mid}`}
                      >
                        {renderTable(tableData, `${message.id}-summary`)}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}

        {/* List: render rows as bullet list when user asked for list format */}
        {responseType === 'list' &&
          tableData &&
          tableData.type === 'table' &&
          Array.isArray(tableData.rows) &&
          tableData.rows.length > 0 && (
            <div
              className="mt-3 mb-3"
              id={`copilot-message-list-container-${mid}`}
              data-cy={`copilot-message-list-container-${mid}`}
            >
              {tableData.title && (
                <Text
                  strong
                  className="text-base block mb-2"
                  style={{ color: '#262626' }}
                  id={`copilot-message-list-title-${mid}`}
                  data-cy={`copilot-message-list-title-${mid}`}
                >
                  {tableData.title}
                </Text>
              )}
              <ul
                className="list-disc pl-5 space-y-1 text-sm text-gray-700"
                id={`copilot-message-list-${mid}`}
                data-cy={`copilot-message-list-${mid}`}
              >
                {tableData.rows.map((row, idx) => {
                  const rowFullName =
                    typeof row.fullName === 'string' ? row.fullName.trim() : '';
                  const userObj = row.user ?? row.userId;
                  let label: string;
                  if (rowFullName) {
                    label = rowFullName;
                  } else if (
                    userObj &&
                    typeof userObj === 'object' &&
                    'firstName' in userObj
                  ) {
                    label = [
                      userObj.firstName,
                      userObj.middleName,
                      userObj.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ');
                  } else {
                    // Prefer explicit person-name fields in flattened rows.
                    const flatName = [
                      row.firstName as string | undefined,
                      row.middleName as string | undefined,
                      row.lastName as string | undefined,
                    ]
                      .filter(
                        (v) => typeof v === 'string' && v.trim().length > 0,
                      )
                      .join(' ');
                    if (flatName) {
                      label = flatName;
                    } else {
                      const firstDataCol = tableData.columns.find(
                        (c) =>
                          !['order', '#'].includes(
                            (c.dataIndex || c.key || '').toLowerCase(),
                          ),
                      );
                      const val = firstDataCol
                        ? row[firstDataCol.dataIndex ?? firstDataCol.key]
                        : row.order;
                      label =
                        typeof val === 'object' && val !== null
                          ? String((val as { name?: string }).name ?? '—')
                          : String(val ?? '—');
                    }
                  }
                  return (
                    <li
                      key={idx}
                      id={`copilot-list-item-${mid}-${idx}`}
                      data-cy={`copilot-list-item-${mid}-${idx}`}
                    >
                      {label || '—'}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        {/* Table: default when responseType is table or unspecified */}
        {responseType !== 'summary' &&
          responseType !== 'list' &&
          tableData &&
          tableData.type === 'table' &&
          tableData.columns &&
          Array.isArray(tableData.rows) &&
          tableData.rows.length > 0 && (
            <div
              className="mt-3 mb-0 relative z-0"
              id={`copilot-message-table-container-${mid}`}
              data-cy={`copilot-message-table-container-${mid}`}
            >
              {tableData.title ? (
                <Text
                  strong
                  className="mb-2 block text-[13px] font-semibold"
                  style={{ color: '#374151' }}
                  id={`copilot-message-table-title-${mid}`}
                  data-cy={`copilot-message-table-title-${mid}`}
                >
                  {tableData.title}
                </Text>
              ) : null}
              {renderTable(tableData, message.id)}
            </div>
          )}
        {tableData &&
          tableData.type === 'table' &&
          (!Array.isArray(tableData.rows) || tableData.rows.length === 0) && (
            <Text
              type="secondary"
              className="text-sm block mt-2 mb-3 text-gray-600"
              id={`copilot-message-no-data-${mid}`}
              data-cy={`copilot-message-no-data-${mid}`}
            >
              {message.text?.trim() || COPILOT_ERROR_MESSAGES.NO_DATA}
            </Text>
          )}

        {message.metadata?.source && (
          <div
            className="mt-2"
            id={`copilot-message-metadata-source-${mid}`}
            data-cy={`copilot-message-metadata-source-${mid}`}
          >
            <Tag color="default" className="text-xs">
              {message.metadata.source}
            </Tag>
          </div>
        )}
        {message.metadata?.confidence && (
          <div
            className="mt-1"
            id={`copilot-message-metadata-confidence-${mid}`}
            data-cy={`copilot-message-metadata-confidence-${mid}`}
          >
            <Text
              type="secondary"
              className="text-xs italic"
              id={`copilot-message-metadata-confidence-text-${mid}`}
              data-cy={`copilot-message-metadata-confidence-text-${mid}`}
            >
              {message.metadata.confidence}
            </Text>
          </div>
        )}
        {hasBackendErrors && (
          <div
            id={`copilot-message-support-collapse-wrap-${mid}`}
            data-cy={`copilot-message-support-collapse-wrap-${mid}`}
          >
            <Collapse
              ghost
              size="small"
              className="mt-2 copilot-details-for-support"
              items={[
                {
                  key: 'support',
                  label: (
                    <span
                      className="text-xs text-gray-500 flex items-center gap-1"
                      id={`copilot-message-support-label-${mid}`}
                      data-cy={`copilot-message-support-label-${mid}`}
                    >
                      <InfoCircleOutlined />
                      Details for support
                    </span>
                  ),
                  children: (
                    <pre
                      className="text-xs text-gray-600 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded border border-gray-200"
                      id={`copilot-message-backend-errors-${mid}`}
                      data-cy={`copilot-message-backend-errors-${mid}`}
                    >
                      {message.backendErrors!.join('\n')}
                    </pre>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={
        isWorkspace
          ? 'flex min-h-full w-full flex-col justify-end space-y-4'
          : 'scrollbar-hide mx-auto h-full w-full max-w-[980px] space-y-6 overflow-y-auto px-1 py-2 sm:px-2'
      }
      id="copilot-messages"
      data-cy="copilot-messages"
    >
      {messages.map((message, messageIndex) => {
        const isUser = message.sender === 'user';
        const isPermissionDenied = message.messageType === 'permission_denied';
        const isError = message.messageType === 'error';
        const assistantBubbleSurface = isPermissionDenied
          ? 'border border-amber-300 bg-amber-50/90'
          : isError
            ? 'border border-red-200 bg-red-50/80'
            : 'border border-[#E0E0E0] bg-white';

        if (isUser) {
          const mid = safeInstanceKey(message.id);
          const reportAccent = COPILOT_THEME.userReportCardAccent;

          if (isWorkspace) {
            return (
              <div
                key={message.id}
                className="flex items-end justify-end gap-3"
                id={`copilot-message-${mid}`}
                data-cy={`copilot-message-${message.id}`}
              >
                <div
                  className="max-w-[min(75%,22rem)] min-w-0 rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: COPILOT_THEME.workspaceUserBubbleBg,
                  }}
                  id={`copilot-message-bubble-user-${mid}`}
                  data-cy={`copilot-message-bubble-user-${mid}`}
                >
                  <p
                    className="text-left text-[15px] font-medium leading-snug text-[#1F2937] whitespace-pre-wrap"
                    id={`copilot-user-prompt-text-${mid}`}
                    data-cy={`copilot-user-prompt-text-${mid}`}
                  >
                    {message.text}
                  </p>
                  <span
                    className="mt-2 block text-left text-[12px] font-medium tabular-nums"
                    style={{ color: COPILOT_THEME.workspaceUserBubbleTime }}
                    id={`copilot-user-message-time-${mid}`}
                    data-cy={`copilot-user-message-time-${mid}`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <span
                  id={`copilot-message-avatar-user-${mid}`}
                  data-cy={`copilot-message-avatar-user-${mid}`}
                  className="inline-flex shrink-0"
                >
                  <Avatar
                    size={36}
                    src={userAvatarUrl || undefined}
                    icon={
                      !userAvatarUrl ? (
                        <UserOutlined
                          className="text-[15px]"
                          style={{ color: COPILOT_THEME.userMessageAvatarIcon }}
                        />
                      ) : undefined
                    }
                    className="border-0"
                    style={{
                      backgroundColor: COPILOT_THEME.userMessageAvatarBg,
                    }}
                    aria-label={`User (${userInitials})`}
                  />
                </span>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className="flex justify-end items-start gap-4"
              id={`copilot-message-${mid}`}
              data-cy={`copilot-message-${message.id}`}
            >
              <div
                className="max-w-[min(70%,20rem)] min-w-0 overflow-hidden border"
                style={{
                  borderRadius: COPILOT_THEME.userReportCardRadius,
                  borderColor: COPILOT_THEME.userReportCardBorder,
                  borderWidth: 1,
                  backgroundColor: COPILOT_THEME.userReportCardBg,
                }}
                id={`copilot-message-bubble-user-${mid}`}
                data-cy={`copilot-message-bubble-user-${mid}`}
              >
                <div
                  className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2"
                  data-cy={`copilot-user-message-header-${mid}`}
                >
                  <span
                    className="text-xs font-medium tabular-nums"
                    style={{ color: reportAccent }}
                    id={`copilot-user-message-time-${mid}`}
                    data-cy={`copilot-user-message-time-${mid}`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
                <div
                  className="px-3 pb-3 pt-2.5"
                  data-cy={`copilot-user-message-body-${mid}`}
                >
                  <Text
                    className="block text-left text-[15px] font-medium leading-snug whitespace-pre-wrap"
                    style={{ color: reportAccent }}
                    id={`copilot-user-prompt-text-${mid}`}
                    data-cy={`copilot-user-prompt-text-${mid}`}
                  >
                    {message.text}
                  </Text>
                </div>
              </div>
              <span
                id={`copilot-message-avatar-user-${mid}`}
                data-cy={`copilot-message-avatar-user-${mid}`}
                className="inline-flex shrink-0"
              >
                <Avatar
                  size={COPILOT_THEME.userMessageAvatarSize}
                  icon={
                    <UserOutlined
                      className="text-[16px]"
                      style={{ color: COPILOT_THEME.userMessageAvatarIcon }}
                    />
                  }
                  className="border-0"
                  style={{
                    backgroundColor: COPILOT_THEME.userMessageAvatarBg,
                  }}
                  aria-label={`User (${userInitials})`}
                />
              </span>
            </div>
          );
        }

        const precedingUser = findPrecedingUserMessage(messages, messageIndex);
        const showShareOnly =
          !readOnlyShared && precedingUser && onShareExchange;
        const mid = safeInstanceKey(message.id);
        const shareableTable =
          message.tableData?.type === 'table' &&
          Array.isArray(message.tableData.rows) &&
          message.tableData.rows.length > 0;
        const shareMenuItems: MenuProps['items'] = [
          {
            key: 'link',
            label: 'Copy share link',
            icon: <LinkOutlined />,
          },
          ...(shareableTable
            ? [
                {
                  key: 'excel',
                  label: 'Export table to Excel',
                  icon: <FileExcelOutlined />,
                },
              ]
            : []),
        ];

        return (
          <div
            key={message.id}
            className="flex justify-start items-start gap-4"
            id={`copilot-message-${mid}`}
            data-cy={`copilot-message-${message.id}`}
          >
            <span
              id={`copilot-message-avatar-assistant-${mid}`}
              data-cy={`copilot-message-avatar-assistant-${mid}`}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center"
            >
              <Avatar
                size={COPILOT_THEME.assistantAvatarSize}
                icon={
                  <CopilotAiIcon
                    size={24}
                    color={COPILOT_THEME.assistantAvatarGlyph}
                    aria-hidden
                  />
                }
                className="border-0"
                style={{
                  backgroundColor: COPILOT_THEME.assistantAvatarOutlinedBg,
                }}
              />
            </span>
            <div
              className={`min-w-0 w-full max-w-[calc(100%-4rem)] px-4 py-3 sm:px-5 sm:py-4 ${assistantBubbleSurface}`}
              style={{
                borderRadius: COPILOT_THEME.assistantBubbleRadius,
              }}
              id={`copilot-message-bubble-copilot-${mid}`}
              data-cy={`copilot-message-bubble-copilot-${mid}`}
            >
              <div
                className="mb-3 flex h-[22px] items-center gap-[10px] p-0"
                data-cy={`copilot-assistant-message-header-${mid}`}
              >
                <span
                  className="h-[22px] text-xs tabular-nums leading-[22px] text-[#9CA3AF]"
                  id={`copilot-assistant-message-time-${mid}`}
                  data-cy={`copilot-assistant-message-time-${mid}`}
                >
                  {formatMessageTime(message.timestamp)}
                </span>
                <div
                  className="ml-auto flex h-[22px] items-center"
                  data-cy={`copilot-assistant-message-actions-${mid}`}
                >
                  {showShareOnly ? (
                    <Dropdown
                      trigger={['click']}
                      placement="bottomRight"
                      menu={{
                        items: shareMenuItems,
                        onClick: ({ key }) => {
                          if (
                            key === 'link' &&
                            onShareExchange &&
                            precedingUser
                          ) {
                            void onShareExchange(precedingUser, message);
                          }
                          if (
                            key === 'excel' &&
                            message.tableData?.type === 'table'
                          ) {
                            void exportCopilotTableToExcel(
                              normalizeCopilotTableForDisplay(
                                message.tableData as CopilotTableData,
                              ),
                            );
                          }
                        },
                      }}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={
                          <ShareAltOutlined className="text-base text-[#9CA3AF]" />
                        }
                        className="!h-8 !min-w-0 !px-2 !text-[#9CA3AF] hover:!bg-transparent"
                        id={`copilot-share-exchange-button-${mid}`}
                        data-cy={`copilot-share-exchange-button-${mid}`}
                        aria-label="Share or export"
                      />
                    </Dropdown>
                  ) : null}
                </div>
              </div>
              {renderMessageContent(message)}
            </div>
          </div>
        );
      })}
      {showThreadLoading && (
        <div
          className="flex justify-start items-start gap-4"
          id="copilot-loading"
          data-cy="copilot-loading"
          aria-busy="true"
        >
          <span
            id="copilot-loading-avatar"
            data-cy="copilot-loading-avatar"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <Avatar
              size={COPILOT_THEME.assistantAvatarSize}
              icon={
                <CopilotAiIcon
                  size={24}
                  color={COPILOT_THEME.assistantAvatarGlyph}
                  aria-hidden
                />
              }
              className="border-0"
              style={{
                backgroundColor: COPILOT_THEME.assistantAvatarOutlinedBg,
              }}
            />
          </span>
          <div
            className="flex h-[32px] w-[31px] shrink-0 items-center justify-center border bg-white"
            style={{ borderRadius: '5.5px', borderColor: '#D9D9D9' }}
            id="copilot-loading-generating-box"
            data-cy="copilot-loading-generating-box"
          >
            <div
              className="flex items-center justify-center"
              data-cy="copilot-loading-dots-wrap"
            >
              <CopilotGeneratingDotsIcon />
            </div>
          </div>
        </div>
      )}
      <div
        ref={messagesEndRef}
        id="copilot-messages-end"
        data-cy="copilot-messages-end"
      />
    </div>
  );
};

export default CopilotMessages;
