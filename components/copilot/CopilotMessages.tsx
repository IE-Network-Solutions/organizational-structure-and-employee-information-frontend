'use client';

import React, { useRef, useEffect } from 'react';
import { Avatar, Typography, Spin, Tag, Table } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface Message {
  id: string;
  text?: string; // Made optional - can be undefined when table is shown
  sender: 'user' | 'copilot';
  timestamp: Date;
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

  const renderMessageContent = (message: Message) => {
    const text = message.text;
    const tableData = message.tableData;
    
    return (
      <div>
        {text && (
          <Text className="text-sm leading-relaxed whitespace-pre-wrap block mb-3">
            {text}
          </Text>
        )}
        
        {/* Render table if table data is available */}
        {tableData && tableData.type === 'table' && tableData.columns && tableData.rows && (
          <div className="mt-4 mb-3">
            {tableData.title && (
              <Text strong className="text-base block mb-3" style={{ color: '#262626' }}>
                {tableData.title}
              </Text>
            )}
            <div 
              style={{
                overflowX: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                background: '#fff',
                minWidth: '100%',
              }}
            >
              <Table
                dataSource={tableData.rows}
              columns={tableData.columns.map((col) => ({
                title: col.dataIndex === 'order' ? '' : col.title, // Remove header for order number column
                dataIndex: col.dataIndex,
                key: col.key,
                render: (text: any) => {
                  if (col.dataIndex === 'order') {
                    return <span style={{ fontWeight: 600, color: '#1890ff', display: 'inline-block', minWidth: '30px' }}>{text}</span>;
                  }
                  // Handle both 'supervisor' and 'user' columns
                  return <span style={{ display: 'inline-block', minWidth: '200px' }}>{text ?? '-'}</span>;
                },
                // Fixed width for order column - wider to accommodate 2-digit numbers
                ...(col.dataIndex === 'order' ? {
                  width: 80,
                  align: 'center' as const,
                  fixed: 'left' as const,
                } : {
                  width: 'auto',
                  ellipsis: false,
                }),
              }))}
                pagination={tableData.rows.length > 10 ? { 
                  pageSize: 10,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  style: { marginTop: '16px', textAlign: 'center' },
                } : false}
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
            <style dangerouslySetInnerHTML={{ __html: `
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
            `}} />
          </div>
        )}
        
        {message.metadata?.source && (
          <div className="mt-2">
            <Tag color="default" className="text-xs">
              {message.metadata.source}
            </Tag>
          </div>
        )}
        {message.metadata?.confidence && (
          <div className="mt-1">
            <Text type="secondary" className="text-xs italic">
              {message.metadata.confidence}
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => {
        const isUser = message.sender === 'user';
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
              />
            )}
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                isUser
                  ? 'bg-blue-50 border border-blue-100'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {renderMessageContent(message)}
              <div className="mt-1.5">
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
          />
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
            <Spin size="small" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default CopilotMessages;
