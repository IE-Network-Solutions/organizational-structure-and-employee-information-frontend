'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Avatar,
  Typography,
  Spin,
  Tag,
  Table,
  Button,
  Modal,
  Alert,
  Collapse,
  Tooltip,
} from 'antd';
import {
  COPILOT_ERROR_MESSAGES,
  exportCopilotTableToExcel,
} from '@/utils/copilotApiService';
import {
  RobotOutlined,
  ExpandOutlined,
  CompressOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

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
  /** Shared read-only thread: hide save/share on answers */
  readOnlyShared?: boolean;
  /** User clicked save on their question — sidebar shows draft to confirm */
  onSaveUserQuestion?: (userMessage: Message) => void;
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
  readOnlyShared = false,
  onSaveUserQuestion,
  onShareExchange,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullScreenTableMessageId, setFullScreenTableMessageId] = useState<
    string | null
  >(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const safeInstanceKey = (key: string) => key.replace(/[^a-zA-Z0-9_-]/g, '_');

  const renderTable = (
    tableData: NonNullable<Message['tableData']>,
    isFullScreen: boolean,
    instanceKey: string,
  ) => {
    const ik = safeInstanceKey(instanceKey);
    return (
      <>
        <div
          style={{
            overflowX: 'auto',
            borderRadius: '8px',
            boxShadow: isFullScreen ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)',
            background: '#fff',
            minWidth: '100%',
          }}
          id={`copilot-table-wrapper-${ik}`}
          data-cy={`copilot-table-wrapper-${ik}`}
        >
          <Table
            id={`copilot-table-${ik}`}
            data-cy={`copilot-table-${ik}`}
            dataSource={tableData.rows}
            columns={tableData.columns.map((col) => ({
              title: col.dataIndex === 'order' ? '' : col.title,
              dataIndex: col.dataIndex,
              key: col.key,
              render: (text: any) => {
                // Special styling for the order column
                if (col.dataIndex === 'order') {
                  return (
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#3636F0',
                        display: 'inline-block',
                        minWidth: '30px',
                      }}
                      data-cy="copilot-table-order-cell"
                    >
                      {text}
                    </span>
                  );
                }

                // Normalize complex cell values (e.g. nested objects) to readable text
                let display: any = text;

                // If the cell is a user object, render full name
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
                    // Fallback: stringify generic objects
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
                    style={{ display: 'inline-block', minWidth: '200px' }}
                    data-cy="copilot-table-data-cell"
                  >
                    {display}
                  </span>
                );
              },
              ...(col.dataIndex === 'order'
                ? {
                    width: 80,
                    align: 'center' as const,
                    fixed: 'left' as const,
                  }
                : {
                    width: 'auto',
                    ellipsis: false,
                  }),
            }))}
            pagination={
              tableData.rows.length > 10
                ? {
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    style: { marginTop: '16px', textAlign: 'center' },
                  }
                : false
            }
            size="middle"
            className="copilot-table"
            rowKey={(record, index) => `row-${index}`}
            bordered={false}
            style={{
              backgroundColor: '#fff',
              tableLayout: 'fixed',
              width: '100%',
            }}
          />
        </div>
        <style
          id={`copilot-table-styles-${ik}`}
          data-cy={`copilot-table-styles-${ik}`}
          dangerouslySetInnerHTML={{
            __html: `
              .copilot-table .ant-table {
                table-layout: fixed !important;
                width: 100% !important;
                min-width: 400px !important;
              }
              .copilot-table .ant-table-container {
                min-width: 100% !important;
              }
              .copilot-table .ant-table-thead > tr > th {
                background: #fafafa !important;
                font-weight: 600 !important;
                border-bottom: 2px solid #e8e8e8 !important;
                padding: 12px 16px !important;
                white-space: nowrap !important;
              }
              .copilot-table .ant-table-thead > tr > th:first-child {
                width: 80px !important;
                min-width: 80px !important;
                max-width: 80px !important;
              }
              .copilot-table .ant-table-thead > tr > th:last-child {
                width: auto !important;
                min-width: 300px !important;
              }
              .copilot-table .ant-table-tbody > tr > td {
                padding: 12px 16px !important;
                border-bottom: 1px solid #f0f0f0 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
              }
              .copilot-table .ant-table-tbody > tr > td:first-child {
                width: 80px !important;
                min-width: 80px !important;
                max-width: 80px !important;
                text-align: center !important;
              }
              .copilot-table .ant-table-tbody > tr > td:last-child {
                width: auto !important;
                min-width: 300px !important;
              }
              .copilot-table .ant-table-thead > tr > th[data-column-key="user"],
              .copilot-table .ant-table-tbody > tr > td[data-column-key="user"] {
                width: auto !important;
                min-width: 300px !important;
              }
              .copilot-table .ant-table-thead > tr > th[data-column-key="supervisor"],
              .copilot-table .ant-table-tbody > tr > td[data-column-key="supervisor"] {
                width: auto !important;
                min-width: 300px !important;
              }
              .copilot-table .ant-table-tbody > tr:hover > td {
                background: #f5f5f5 !important;
              }
              .copilot-table .ant-pagination-item {
                border-radius: 4px;
              }
              .copilot-table .ant-pagination-item-active {
                background: #3636F0 !important;
                border-color: #3636F0 !important;
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
    const tableData = message.tableData;
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
              className="text-sm leading-relaxed whitespace-pre-wrap block mb-3"
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
                        <div
                          className="flex items-center justify-end gap-2 mb-2"
                          id={`copilot-summary-table-actions-${mid}`}
                          data-cy={`copilot-summary-table-actions-${mid}`}
                        >
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => exportCopilotTableToExcel(tableData)}
                            id={`copilot-table-export-excel-summary-${mid}`}
                            data-cy={`copilot-table-export-excel-summary-${mid}`}
                          >
                            Export to Excel
                          </Button>
                          <Button
                            type="link"
                            size="small"
                            icon={<ExpandOutlined />}
                            onClick={() =>
                              setFullScreenTableMessageId(message.id)
                            }
                            id={`copilot-table-maximize-summary-${mid}`}
                            data-cy={`copilot-table-maximize-summary-${mid}`}
                          >
                            Maximize
                          </Button>
                        </div>
                        {renderTable(tableData, false, `${message.id}-summary`)}
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
                  const userObj = row.user ?? row.userId;
                  let label: string;
                  if (
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
              <div
                className="mt-2"
                id={`copilot-message-list-actions-${mid}`}
                data-cy={`copilot-message-list-actions-${mid}`}
              >
                <Button
                  type="link"
                  size="small"
                  onClick={() => exportCopilotTableToExcel(tableData)}
                  className="p-0 h-auto !text-primary"
                  id={`copilot-table-export-excel-list-${mid}`}
                  data-cy={`copilot-table-export-excel-list-${mid}`}
                >
                  Export to Excel
                </Button>
              </div>
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
              className="mt-4 mb-3 relative z-0"
              id={`copilot-message-table-container-${mid}`}
              data-cy={`copilot-message-table-container-${mid}`}
            >
              <div
                className="flex items-center justify-between mb-3 gap-3"
                id={`copilot-message-table-header-${mid}`}
                data-cy={`copilot-message-table-header-${mid}`}
              >
                {tableData.title && (
                  <Text
                    strong
                    className="text-base"
                    style={{ color: '#262626' }}
                    id={`copilot-message-table-title-${mid}`}
                    data-cy={`copilot-message-table-title-${mid}`}
                  >
                    {tableData.title}
                  </Text>
                )}
                <div
                  className="flex items-center gap-3 ml-auto"
                  id={`copilot-message-table-actions-${mid}`}
                  data-cy={`copilot-message-table-actions-${mid}`}
                >
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => exportCopilotTableToExcel(tableData)}
                    className="h-auto border-none bg-primary px-3 text-white hover:brightness-105"
                    id={`copilot-table-export-excel-${mid}`}
                    data-cy={`copilot-table-export-excel-${mid}`}
                  >
                    Export to Excel
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<ExpandOutlined />}
                    onClick={() => setFullScreenTableMessageId(message.id)}
                    className="relative z-10 h-auto p-0 text-slate-500 hover:!text-primary"
                    id={`copilot-table-maximize-${mid}`}
                    data-cy={`copilot-table-maximize-${mid}`}
                  >
                    Maximize
                  </Button>
                </div>
              </div>
              {renderTable(tableData, false, message.id)}
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
      className="mx-auto h-full max-w-4xl space-y-5 overflow-y-auto px-2 py-4 md:px-4"
      id="copilot-messages"
      data-cy="copilot-messages"
    >
      {messages.map((message, messageIndex) => {
        const isUser = message.sender === 'user';
        const isPermissionDenied = message.messageType === 'permission_denied';
        const isError = message.messageType === 'error';
        const assistantBubbleClass = isPermissionDenied
          ? 'border-amber-300 bg-amber-50/90 shadow-sm'
          : isError
            ? 'border-red-200 bg-red-50/80 shadow-sm'
            : 'border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]';

        if (isUser) {
          const canSaveQuestion =
            !readOnlyShared && onSaveUserQuestion && message.text?.trim();
          const mid = safeInstanceKey(message.id);
          return (
            <div
              key={message.id}
              className="flex justify-end gap-3"
              id={`copilot-message-${mid}`}
              data-cy={`copilot-message-${message.id}`}
            >
              <div
                className="max-w-[min(75%,36rem)] overflow-hidden rounded-[12px] border border-[#2563EB] bg-[#E3EDFF] shadow-sm"
                id={`copilot-message-bubble-user-${mid}`}
                data-cy={`copilot-message-bubble-user-${mid}`}
              >
                <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                  <Text
                    className="text-xs font-normal"
                    style={{ color: '#2563EB' }}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                  {canSaveQuestion ? (
                    <Tooltip title="Save this question to Saved reports">
                      <button
                        type="button"
                        onClick={() => onSaveUserQuestion(message)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-[#2563EB] transition-colors hover:bg-[#2563EB]/10"
                        aria-label="Save question to Saved reports"
                        id={`copilot-user-message-save-${mid}`}
                        data-cy={`copilot-user-message-save-${mid}`}
                      >
                        <DownloadOutlined className="text-lg" />
                      </button>
                    </Tooltip>
                  ) : (
                    <span className="h-8 w-8 shrink-0" aria-hidden />
                  )}
                </div>
                <div className="px-3 pb-3 pt-0.5">
                  <Text
                    className="block text-sm font-medium leading-relaxed whitespace-pre-wrap"
                    style={{ color: '#2563EB' }}
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
                <Avatar size={36} className="bg-slate-200 text-slate-600">
                  {userInitials}
                </Avatar>
              </span>
            </div>
          );
        }

        const precedingUser = findPrecedingUserMessage(messages, messageIndex);
        const showShareOnly =
          !readOnlyShared && precedingUser && onShareExchange;
        const mid = safeInstanceKey(message.id);

        return (
          <div
            key={message.id}
            className="flex justify-start gap-3"
            id={`copilot-message-${mid}`}
            data-cy={`copilot-message-${message.id}`}
          >
            <span
              id={`copilot-message-avatar-robot-${mid}`}
              data-cy={`copilot-message-avatar-robot-${mid}`}
              className="inline-flex shrink-0"
            >
              <Avatar
                size={36}
                icon={<RobotOutlined />}
                className="bg-slate-200 text-slate-600"
              />
            </span>
            <div
              className={`max-w-[min(85%,48rem)] rounded-xl border px-4 py-3 ${assistantBubbleClass}`}
              id={`copilot-message-bubble-copilot-${mid}`}
              data-cy={`copilot-message-bubble-copilot-${mid}`}
            >
              {renderMessageContent(message)}
              <div
                className="mt-2 border-t border-slate-100 pt-2"
                id={`copilot-message-timestamp-${mid}`}
                data-cy={`copilot-message-timestamp-${mid}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Text
                    type="secondary"
                    className="text-xs text-slate-500"
                    id={`copilot-message-timestamp-text-${mid}`}
                    data-cy={`copilot-message-timestamp-text-${mid}`}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                  {showShareOnly && (
                    <div
                      className="flex items-center gap-0.5"
                      id={`copilot-exchange-actions-${mid}`}
                      data-cy={`copilot-exchange-actions-${mid}`}
                    >
                      <Tooltip title="Copy share link (this Q&A only)">
                        <Button
                          type="text"
                          size="small"
                          icon={
                            <LinkOutlined className="text-primary text-base" />
                          }
                          onClick={() =>
                            void onShareExchange(precedingUser!, message)
                          }
                          className="!text-primary hover:!bg-primary/10"
                          id={`copilot-share-exchange-button-${mid}`}
                          data-cy={`copilot-share-exchange-button-${mid}`}
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <div
          className="flex justify-start gap-3"
          id="copilot-loading"
          data-cy="copilot-loading"
        >
          <span
            id="copilot-loading-avatar"
            data-cy="copilot-loading-avatar"
            className="inline-flex shrink-0"
          >
            <Avatar
              size={36}
              icon={<RobotOutlined />}
              className="bg-slate-200 text-slate-600"
            />
          </span>
          <div
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            id="copilot-loading-spinner"
            data-cy="copilot-loading-spinner"
          >
            <Spin size="small" />
          </div>
        </div>
      )}
      <div
        ref={messagesEndRef}
        id="copilot-messages-end"
        data-cy="copilot-messages-end"
      />

      {/* Full screen table modal - zIndex above full-screen Copilot wrapper (9999) so Maximize stays clickable */}
      <Modal
        open={!!fullScreenTableMessageId}
        onCancel={() => setFullScreenTableMessageId(null)}
        zIndex={10000}
        footer={
          <Button
            icon={<CompressOutlined />}
            onClick={() => setFullScreenTableMessageId(null)}
            id="copilot-table-minimize"
            data-cy="copilot-table-minimize"
          >
            Minimize
          </Button>
        }
        width="95vw"
        styles={{ body: { maxHeight: '85vh', overflow: 'auto' } }}
        title={(() => {
          const msg = messages.find((m) => m.id === fullScreenTableMessageId);
          return msg?.tableData?.title || 'Table';
        })()}
        destroyOnClose
      >
        <div
          id="copilot-table-modal"
          data-cy="copilot-table-modal"
          className="copilot-table-modal-inner"
        >
          {fullScreenTableMessageId &&
            (() => {
              const msg = messages.find(
                (m) => m.id === fullScreenTableMessageId,
              );
              const tableData = msg?.tableData;
              if (
                !tableData ||
                tableData.type !== 'table' ||
                !tableData.columns ||
                !tableData.rows
              )
                return null;
              return renderTable(
                tableData,
                true,
                `${fullScreenTableMessageId}-fullscreen`,
              );
            })()}
        </div>
      </Modal>
    </div>
  );
};

export default CopilotMessages;
