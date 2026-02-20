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
} from 'antd';
import { COPILOT_ERROR_MESSAGES } from '@/utils/copilotApiService';
import {
  UserOutlined,
  RobotOutlined,
  ExpandOutlined,
  CompressOutlined,
  WarningOutlined,
  InfoCircleOutlined,
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
  backend_errors?: string[];
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
}

interface CopilotMessagesProps {
  messages: Message[];
  isLoading: boolean;
  userInitials?: string;
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
const CopilotMessages: React.FC<CopilotMessagesProps> = ({
  messages,
  isLoading,
  userInitials = 'U',
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
      hour12: true,
    });
  };

  const renderTable = (
    tableData: NonNullable<Message['tableData']>,
    isFullScreen: boolean,
  ) => (
    <>
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: isFullScreen ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.08)',
          background: '#fff',
          minWidth: '100%',
        }}
        data-cy="copilot-table-wrapper"
      >
        <Table
          data-cy="copilot-table"
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
                      color: '#1890ff',
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
        data-cy="copilot-table-styles"
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
                background: #1890ff !important;
                border-color: #1890ff !important;
              }
              .copilot-table .ant-pagination-item-active a {
                color: #fff !important;
              }
            `,
        }}
      />
    </>
  );

  const renderMessageContent = (message: Message) => {
    const text = message.text;
    const tableData = message.tableData;
    const isPermissionDenied = message.messageType === 'permission_denied';
    const isError = message.messageType === 'error';
    const hasBackendErrors =
      Array.isArray(message.backend_errors) &&
      message.backend_errors.length > 0;

    return (
      <div data-cy="copilot-message-content">
        {text &&
          (isPermissionDenied ? (
            <Alert
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              message="Access denied"
              description={text}
              className="mb-3"
              data-cy="copilot-message-permission-denied"
            />
          ) : isError ? (
            <div className="mb-3">
              <Text
                className="text-sm leading-relaxed whitespace-pre-wrap block text-gray-700"
                data-cy="copilot-message-error-text"
              >
                {text}
              </Text>
            </div>
          ) : (
            <Text
              className="text-sm leading-relaxed whitespace-pre-wrap block mb-3"
              data-cy="copilot-message-text"
            >
              {text}
            </Text>
          ))}

        {/* Render table only when there are rows; otherwise show friendly no-data message */}
        {tableData &&
          tableData.type === 'table' &&
          tableData.columns &&
          Array.isArray(tableData.rows) &&
          tableData.rows.length > 0 && (
            <div
              className="mt-4 mb-3 relative z-0"
              data-cy="copilot-message-table-container"
            >
              {tableData.title && (
                <Text
                  strong
                  className="text-base block mb-3"
                  style={{ color: '#262626' }}
                  data-cy="copilot-message-table-title"
                >
                  {tableData.title}
                </Text>
              )}
              {renderTable(tableData, false)}
              <Button
                type="link"
                size="small"
                icon={<ExpandOutlined />}
                onClick={() => setFullScreenTableMessageId(message.id)}
                className="p-0 h-auto mt-2 text-gray-500 hover:text-blue-600 relative z-10"
                data-cy="copilot-table-maximize"
              >
                Maximize
              </Button>
            </div>
          )}
        {tableData &&
          tableData.type === 'table' &&
          (!Array.isArray(tableData.rows) || tableData.rows.length === 0) && (
            <Text
              type="secondary"
              className="text-sm block mt-2 mb-3 text-gray-600"
              data-cy="copilot-message-no-data"
            >
              {message.text?.trim() || COPILOT_ERROR_MESSAGES.NO_DATA}
            </Text>
          )}

        {message.metadata?.source && (
          <div className="mt-2" data-cy="copilot-message-metadata-source">
            <Tag color="default" className="text-xs">
              {message.metadata.source}
            </Tag>
          </div>
        )}
        {message.metadata?.confidence && (
          <div className="mt-1" data-cy="copilot-message-metadata-confidence">
            <Text type="secondary" className="text-xs italic">
              {message.metadata.confidence}
            </Text>
          </div>
        )}
        {hasBackendErrors && (
          <Collapse
            ghost
            size="small"
            className="mt-2 copilot-details-for-support"
            items={[
              {
                key: 'support',
                label: (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <InfoCircleOutlined />
                    Details for support
                  </span>
                ),
                children: (
                  <pre
                    className="text-xs text-gray-600 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded border border-gray-200"
                    data-cy="copilot-message-backend-errors"
                  >
                    {message.backend_errors!.join('\n')}
                  </pre>
                ),
              },
            ]}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="h-full overflow-y-auto px-4 py-4 space-y-4"
      id="copilot-messages"
      data-cy="copilot-messages"
    >
      {messages.map((message) => {
        const isUser = message.sender === 'user';
        const isPermissionDenied = message.messageType === 'permission_denied';
        const isError = message.messageType === 'error';
        const bubbleClass = isUser
          ? 'bg-blue-50 border border-blue-100'
          : isPermissionDenied
            ? 'bg-amber-50 border-2 border-amber-400 shadow-sm'
            : isError
              ? 'bg-red-50/70 border border-red-200 shadow-sm'
              : 'bg-white border border-gray-200 shadow-sm';
        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
            data-cy={`copilot-message-${message.id}`}
          >
            {!isUser && (
              <Avatar
                size={32}
                icon={<RobotOutlined />}
                className="bg-gray-100 text-gray-600 flex-shrink-0"
                data-cy="copilot-message-avatar-robot"
              />
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2.5 ${bubbleClass}`}
              data-cy={`copilot-message-bubble-${isUser ? 'user' : 'copilot'}`}
            >
              {renderMessageContent(message)}
              <div className="mt-1.5" data-cy="copilot-message-timestamp">
                <Text type="secondary" className="text-xs">
                  {formatTime(message.timestamp)}
                </Text>
              </div>
            </div>
            {isUser && (
              <Avatar
                size={32}
                icon={<UserOutlined />}
                className="bg-blue-100 text-blue-600 flex-shrink-0"
                data-cy="copilot-message-avatar-user"
              >
                {userInitials}
              </Avatar>
            )}
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-start gap-3" data-cy="copilot-loading">
          <Avatar
            size={32}
            icon={<RobotOutlined />}
            className="bg-gray-100 text-gray-600"
            data-cy="copilot-loading-avatar"
          />
          <div
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm"
            data-cy="copilot-loading-spinner"
          >
            <Spin size="small" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} data-cy="copilot-messages-end" />

      {/* Full screen table modal - zIndex above full-screen Copilot wrapper (9999) so Maximize stays clickable */}
      <Modal
        open={!!fullScreenTableMessageId}
        onCancel={() => setFullScreenTableMessageId(null)}
        zIndex={10000}
        footer={
          <Button
            icon={<CompressOutlined />}
            onClick={() => setFullScreenTableMessageId(null)}
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
        data-cy="copilot-table-modal"
      >
        {fullScreenTableMessageId &&
          (() => {
            const msg = messages.find((m) => m.id === fullScreenTableMessageId);
            const tableData = msg?.tableData;
            if (
              !tableData ||
              tableData.type !== 'table' ||
              !tableData.columns ||
              !tableData.rows
            )
              return null;
            return renderTable(tableData, true);
          })()}
      </Modal>
    </div>
  );
};

export default CopilotMessages;
