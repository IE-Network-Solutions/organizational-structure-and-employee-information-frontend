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
          className="flex items-center justify-between text-[#5B4FFF] text-base font-semibold"
        >
          <div
            id="chatbot-title-content"
            data-cy="chatbot-title-content"
            className="flex items-center gap-2"
          >
            <MessageOutlined />
            SelamNew AI
          </div>
          <div
            id="chatbot-title-actions"
            data-cy="chatbot-title-actions"
            className="flex gap-2"
          >
            <Tooltip title="New Chat">
              <Button
                id="chatbot-new-chat-button"
                data-cy="chatbot-new-chat-button"
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleNewChat}
                className="text-[#5B4FFF]"
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
                    className="text-[#5B4FFF]"
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
      closeIcon={<CloseOutlined className="text-[#5B4FFF]" />}
      className="[&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-gray-200 [&_.ant-drawer-header]:p-4 [&_.ant-drawer-header]:bg-gradient-to-b [&_.ant-drawer-header]:from-[#F8F7FF] [&_.ant-drawer-header]:to-white [&_.ant-drawer-body]:p-0 [&_.ant-drawer-body]:flex [&_.ant-drawer-body]:flex-col [&_.ant-drawer-body]:h-[calc(100vh-64px)] [&_.ant-drawer-body]:bg-gradient-to-b [&_.ant-drawer-body]:from-[#F8F7FF] [&_.ant-drawer-body]:to-white"
    >
      <div
        role="dialog"
        aria-modal="true"
        id="chatbot-wrapper-view-space"
        data-cy="chatbot-wrapper-view-space"
        className="flex-1 overflow-y-auto p-5 flex flex-col"
      >
        {messages.length === 0 ? (
          <div
            id="chatbot-empty-state"
            data-cy="chatbot-empty-state"
            className="flex flex-col items-center justify-center h-full text-center gap-5"
          >
            <div
              id="chatbot-empty-avatar-container"
              data-cy="chatbot-empty-avatar-container"
              className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] flex items-center justify-center relative"
            >
              <div
                id="chatbot-empty-avatar-pulse"
                data-cy="chatbot-empty-avatar-pulse"
                className="absolute w-[50px] h-[50px] rounded-full bg-white/20 animate-pulse"
              >
                <div id="chatbot-empty-avatar" data-cy="chatbot-empty-avatar">
                  <Avatar
                    size={40}
                    src="/icons/512.png"
                    className="bg-white border border-[rgba(91,79,255,0.15)] shadow-[0_4px_12px_rgba(91,79,255,0.2)] p-1.5"
                  />
                </div>
              </div>
            </div>
            <div id="chatbot-empty-title" data-cy="chatbot-empty-title">
              <div className="text-[#2C2F36] text-base font-semibold leading-tight">
                SelamNew AI
              </div>
            </div>
            <div
              id="chatbot-empty-actions"
              data-cy="chatbot-empty-actions"
              className="flex gap-2"
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
                  className="text-[#5B4FFF]"
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
                      className="text-[#5B4FFF]"
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
                  className="text-[#8C91A0]"
                />
              </Tooltip>
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
                  className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    id={`chatbot-message-content-${message.id}`}
                    data-cy={`chatbot-message-content-${message.id}`}
                    className={`flex items-end gap-3 w-full ${isUser ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}
                  >
                    <div
                      id={`chatbot-message-avatar-${message.id}`}
                      data-cy={`chatbot-message-avatar-${message.id}`}
                    >
                      <Avatar
                        size={36}
                        className={isUser 
                          ? 'bg-gradient-to-br from-[#F5F7FF] to-[#E9ECFF] text-[#5B4FFF] border border-[rgba(91,79,255,0.2)] p-0' 
                          : 'bg-white text-white border border-[rgba(91,79,255,0.15)] p-1.5'}
                        src={isUser ? undefined : '/icons/256.png'}
                        icon={isUser ? undefined : <RobotOutlined />}
                      >
                        {isUser ? userInitial : null}
                      </Avatar>
                    </div>
                    <div
                      id={`chatbot-message-text-${message.id}`}
                      data-cy={`chatbot-message-text-${message.id}`}
                      className={`max-w-[80%] bg-white break-words text-sm leading-[22px] text-[#2C2F36] ${
                        isUser 
                          ? 'rounded-[18px_18px_4px_18px] p-3 border border-[rgba(91,79,255,0.15)] shadow-[0_12px_32px_rgba(91,79,255,0.08)]' 
                          : 'rounded-[18px_18px_18px_4px] p-4 border border-[rgba(91,79,255,0.1)] shadow-[0_15px_36px_rgba(102,126,234,0.12)]'
                      }`}
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
                    className={`text-[11px] text-[#8C91A0] ${isUser ? 'pr-12 pl-0' : 'pl-12 pr-0'}`}
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
                className="flex flex-row items-start gap-3"
              >
                <div
                  id="chatbot-loading-avatar"
                  data-cy="chatbot-loading-avatar"
                >
                  <Avatar
                    size={36}
                    className="bg-white border border-[rgba(91,79,255,0.15)] p-1.5 text-white"
                    src="/icons/256.png"
                    icon={<RobotOutlined />}
                  />
                </div>
                <div
                  id="chatbot-loading-spinner"
                  data-cy="chatbot-loading-spinner"
                  className="p-3 rounded-[18px_18px_18px_4px] bg-white border border-[rgba(91,79,255,0.1)] shadow-[0_15px_36px_rgba(102,126,234,0.12)]"
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
        className="px-5 pb-5 pt-4 border-t border-gray-200 bg-white"
      >
        <div
          id="chatbot-input-wrapper"
          data-cy="chatbot-input-wrapper"
          className="flex gap-2 items-end"
        >
          <Input.TextArea
            id="chatbot-input"
            data-cy="chatbot-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about SelamNew platform..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 rounded-[20px] py-2.5 px-4 text-sm border border-gray-200 resize-none"
            disabled={isLoading}
          />
          <Button
            id="chatbot-send-button"
            data-cy="chatbot-send-button"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#667EEA] to-[#764BA2] border-none shadow-[0_4px_12px_rgba(102,126,234,0.4)]"
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
