'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Input,
  Button,
  Spin,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
  Avatar,
} from 'antd';
import {
  SendOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  MessageOutlined,
  HistoryOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  fetchCopilotResponse,
  ChatContext,
  UserInfo,
  UsageInfo,
} from '@/utils/aiService';
import { useChatBotStore } from '@/store/uistate/features/chatbot/chatbot';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AIResponseFormatter from './AIResponseFormatter';

const { Text } = Typography;

interface ChatBotProps {
  open: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ open, onClose }) => {
  const {
    chats,
    currentChatId,
    createNewChat,
    setCurrentChat,
    addMessage,
    deleteChat,
    clearAllChats,
    setIsOpen,
  } = useChatBotStore();

  const { userId, tenantId, userData } = useAuthenticationStore();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat messages
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Create new chat when component opens
  useEffect(() => {
    if (open && !currentChatId) {
      createNewChat();
    }
  }, [open, currentChatId, createNewChat]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    addMessage({
      text: inputValue,
      sender: 'user',
    });

    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context from current chat
      const context: ChatContext = {
        messages: messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
      };

      // Prepare user information for copilot usage tracking
      const userInfo: UserInfo = {
        userId,
        tenantId,
        role: userData?.role?.slug || userData?.role?.name,
      };

      // Prepare usage information for analytics
      const usageInfo: UsageInfo = {
        sessionId: `session_${Date.now()}`, // Generate session ID
        chatId: currentChatId || 'unknown',
        messageCount: messages.length + 1, // Include the current message
      };

      // Prepare memory array (can be enhanced based on chat history or user preferences)
      const memory =
        messages.length > 0
          ? [
              {
                chatHistory: messages.slice(-5).map((msg) => ({
                  sender: msg.sender,
                  text: msg.text,
                  timestamp: msg.timestamp,
                })),
              },
            ]
          : [];

      const response = await fetchCopilotResponse(userInput, context, {
        memory,
        top_k: 3,
        userInfo,
        usage: usageInfo,
      });

      // Add bot response
      addMessage({
        text: response,
        sender: 'bot',
      });
    } catch (error) {
      addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
  };

  const handleClearAllChats = () => {
    clearAllChats();
  };

  const handleClose = () => {
    onClose();
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Chat history menu
  const chatHistoryMenu = (
    <Menu id="chatbot-history-menu" data-cy="chatbot-history-menu">
      {chats.map((chat) => (
        <Menu.Item
          key={chat.id}
          id={`chatbot-history-item-${chat.id}`}
          data-cy={`chatbot-history-item-${chat.id}`}
          onClick={() => handleChatSelect(chat.id)}
        >
          <div
            id={`chatbot-history-item-content-${chat.id}`}
            data-cy={`chatbot-history-item-content-${chat.id}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              id={`chatbot-history-item-text-${chat.id}`}
              data-cy={`chatbot-history-item-text-${chat.id}`}
              style={{ flex: 1, marginRight: '8px' }}
            >
              <Text ellipsis style={{ fontSize: '12px' }}>
                {chat.title}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '10px' }}>
                {chat.messages.length} messages
              </Text>
            </div>
            <Button
              id={`chatbot-history-delete-${chat.id}`}
              data-cy={`chatbot-history-delete-${chat.id}`}
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
              style={{ color: '#ff4d4f' }}
            />
          </div>
        </Menu.Item>
      ))}
      {chats.length > 0 && (
        <>
          <Menu.Divider
            id="chatbot-history-divider"
            data-cy="chatbot-history-divider"
          />
          <Menu.Item
            key="clear-all"
            id="chatbot-history-clear-all"
            data-cy="chatbot-history-clear-all"
            onClick={handleClearAllChats}
          >
            <Text type="danger">Clear All Chats</Text>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Drawer
      id="chatbot-drawer"
      data-cy="chatbot-drawer"
      title={
        <div
          id="chatbot-title-wrapper"
          data-cy="chatbot-title-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#5B4FFF',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          <div
            id="chatbot-title-content"
            data-cy="chatbot-title-content"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <MessageOutlined />
            SelamNew AI
          </div>
          <div
            id="chatbot-title-actions"
            data-cy="chatbot-title-actions"
            style={{ display: 'flex', gap: '8px' }}
          >
            <Tooltip title="New Chat">
              <Button
                id="chatbot-new-chat-button"
                data-cy="chatbot-new-chat-button"
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleNewChat}
                style={{ color: '#5B4FFF' }}
              />
            </Tooltip>
            {chats.length > 0 && (
              <div
                id="chatbot-history-dropdown"
                data-cy="chatbot-history-dropdown"
              >
                <Dropdown
                  overlay={chatHistoryMenu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    id="chatbot-history-button"
                    data-cy="chatbot-history-button"
                    type="text"
                    size="small"
                    icon={<HistoryOutlined />}
                    style={{ color: '#5B4FFF' }}
                  />
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      width={400}
      closeIcon={<CloseOutlined style={{ color: '#5B4FFF' }} />}
      styles={{
        header: {
          borderBottom: '1px solid #E5E7EB',
          padding: '16px',
          background: 'linear-gradient(180deg, #F8F7FF 0%, #FFFFFF 100%)',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          background: 'linear-gradient(180deg, #F8F7FF 0%, #FFFFFF 100%)',
        },
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        id="chatbot-wrapper-view-space"
        data-cy="chatbot-wrapper-view-space"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 ? (
          <div
            id="chatbot-empty-state"
            data-cy="chatbot-empty-state"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              gap: '20px',
            }}
          >
            <div
              id="chatbot-empty-avatar-container"
              data-cy="chatbot-empty-avatar-container"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                id="chatbot-empty-avatar-pulse"
                data-cy="chatbot-empty-avatar-pulse"
                style={{
                  position: 'absolute',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  animation: 'pulse 2s infinite',
                }}
              >
                <div id="chatbot-empty-avatar" data-cy="chatbot-empty-avatar">
                  <Avatar
                    size={40}
                    src="/icons/512.png"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(91, 79, 255, 0.15)',
                      boxShadow: '0 4px 12px rgba(91, 79, 255, 0.2)',
                      padding: '6px',
                    }}
                  />
                </div>
              </div>
              <div id="chatbot-empty-title" data-cy="chatbot-empty-title">
                <div
                  style={{
                    color: '#2C2F36',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  SelamNew AI
                </div>
              </div>
              <div
                id="chatbot-empty-actions"
                data-cy="chatbot-empty-actions"
                style={{ display: 'flex', gap: '8px' }}
              >
                <Tooltip
                  title="New Chat"
                  id="chatbot-new-chat-tooltip-wrapper-view-space"
                  data-cy="chatbot-new-chat-tooltip-wrapper-view-space"
                >
                  <Button
                    id="chatbot-empty-new-chat-button"
                    data-cy="chatbot-empty-new-chat-button"
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleNewChat}
                    style={{ color: '#5B4FFF' }}
                  />
                </Tooltip>
                {chats.length > 0 && (
                  <div
                    id="chatbot-empty-history-dropdown"
                    data-cy="chatbot-empty-history-dropdown"
                  >
                    <Dropdown
                      overlay={chatHistoryMenu}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        id="chatbot-empty-history-button"
                        data-cy="chatbot-empty-history-button"
                        type="text"
                        size="small"
                        icon={<HistoryOutlined />}
                        style={{ color: '#5B4FFF' }}
                      />
                    </Dropdown>
                  </div>
                )}
                <Tooltip
                  title="Close"
                  id="chatbot-close-tooltip-wrapper-view-space"
                  data-cy="chatbot-close-tooltip-wrapper-view-space"
                >
                  <Button
                    id="chatbot-empty-close-button"
                    data-cy="chatbot-empty-close-button"
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={handleClose}
                    style={{ color: '#8C91A0' }}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div
            id="chatbot-messages-container"
            data-cy="chatbot-messages-container"
          >
            {messages.map((message) => {
              const isUser = message.sender === 'user';
              const userInitial =
                userData?.firstName?.[0]?.toUpperCase() ||
                userData?.lastName?.[0]?.toUpperCase() ||
                'U';

              return (
                <div
                  key={message.id}
                  id={`chatbot-message-${message.id}`}
                  data-cy={`chatbot-message-${message.id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '6px',
                  }}
                >
                  <div
                    id={`chatbot-message-content-${message.id}`}
                    data-cy={`chatbot-message-content-${message.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: '12px',
                      width: '100%',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      id={`chatbot-message-avatar-${message.id}`}
                      data-cy={`chatbot-message-avatar-${message.id}`}
                    >
                      <Avatar
                        size={36}
                        style={{
                          background: isUser
                            ? 'linear-gradient(135deg, #F5F7FF 0%, #E9ECFF 100%)'
                            : '#FFFFFF',
                          color: isUser ? '#5B4FFF' : '#FFFFFF',
                          border: isUser
                            ? '1px solid rgba(91, 79, 255, 0.2)'
                            : '1px solid rgba(91, 79, 255, 0.15)',
                          padding: isUser ? 0 : '6px',
                        }}
                        src={isUser ? undefined : '/icons/256.png'}
                        icon={isUser ? undefined : <RobotOutlined />}
                      >
                        {isUser ? userInitial : null}
                      </Avatar>
                    </div>
                    <div
                      id={`chatbot-message-text-${message.id}`}
                      data-cy={`chatbot-message-text-${message.id}`}
                      style={{
                        maxWidth: '80%',
                        background: isUser ? '#FFFFFF' : '#FFFFFF',
                        borderRadius: isUser
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        padding: isUser ? '12px 16px' : '16px',
                        border: isUser
                          ? '1px solid rgba(91, 79, 255, 0.15)'
                          : '1px solid rgba(91, 79, 255, 0.1)',
                        boxShadow: isUser
                          ? '0 12px 32px rgba(91, 79, 255, 0.08)'
                          : '0 15px 36px rgba(102, 126, 234, 0.12)',
                        wordBreak: 'break-word',
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: '#2C2F36',
                      }}
                    >
                      {isUser ? (
                        message.text
                      ) : (
                        <AIResponseFormatter
                          response={message.text}
                          compact={true}
                          onActionClick={() => {
                            // Handle action clicks - could navigate to different parts of the app
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div
                    id={`chatbot-message-timestamp-${message.id}`}
                    data-cy={`chatbot-message-timestamp-${message.id}`}
                    style={{
                      fontSize: '11px',
                      color: '#8C91A0',
                      paddingLeft: isUser ? '0' : '48px',
                      paddingRight: isUser ? '48px' : '0',
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div
                id="chatbot-loading-container"
                data-cy="chatbot-loading-container"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  id="chatbot-loading-avatar"
                  data-cy="chatbot-loading-avatar"
                >
                  <Avatar
                    size={36}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(91, 79, 255, 0.15)',
                      padding: '6px',
                      color: '#FFFFFF',
                    }}
                    src="/icons/256.png"
                    icon={<RobotOutlined />}
                  />
                </div>
                <div
                  id="chatbot-loading-spinner"
                  data-cy="chatbot-loading-spinner"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(91, 79, 255, 0.1)',
                    boxShadow: '0 15px 36px rgba(102, 126, 234, 0.12)',
                  }}
                >
                  <Spin size="small" />
                </div>
              </div>
            )}
            <div
              id="chatbot-messages-end"
              data-cy="chatbot-messages-end"
              ref={messagesEndRef}
            />
          </div>
        )}
      </div>

      <div
        id="chatbot-input-container"
        data-cy="chatbot-input-container"
        style={{
          padding: '16px 20px 20px',
          borderTop: '1px solid #E5E7EB',
          background: 'white',
        }}
      >
        <div
          id="chatbot-input-wrapper"
          data-cy="chatbot-input-wrapper"
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          <Input.TextArea
            id="chatbot-input"
            data-cy="chatbot-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about SelamNew platform..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              flex: 1,
              borderRadius: '20px',
              padding: '10px 16px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              resize: 'none',
            }}
            disabled={isLoading}
          />
          <Button
            id="chatbot-send-button"
            data-cy="chatbot-send-button"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            style={{
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </Drawer>
  );
};

export default ChatBot;
