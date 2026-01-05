'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
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
  const [panelWidth, setPanelWidth] = useState(420);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chat messages
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messages = useMemo(
    () => currentChat?.messages || [],
    [currentChat?.messages],
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    const updatePanelWidth = () => {
      if (typeof window === 'undefined') return;
      const { innerWidth } = window;
      if (innerWidth < 480) {
        setPanelWidth(innerWidth - 24);
      } else if (innerWidth < 768) {
        setPanelWidth(360);
      } else {
        setPanelWidth(420);
      }
    };

    updatePanelWidth();
    window.addEventListener('resize', updatePanelWidth);
    return () => window.removeEventListener('resize', updatePanelWidth);
  }, []);

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

  const suggestedPrompts = [
    'How to create OKR',
    'How do I create a daily plan?',
    'What are OKRs?',
    'How to add team members?',
  ];

  // Chat history menu
  const chatHistoryMenu = (
    <Menu data-cy="chatbot-history-menu">
      {chats.map((chat) => (
        <Menu.Item
          key={chat.id}
          onClick={() => handleChatSelect(chat.id)}
          data-cy={`chatbot-history-item-${chat.id}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-2">
              <Text ellipsis className="text-xs">
                {chat.title}
              </Text>
              <br />
              <Text type="secondary" className="text-[10px]">
                {chat.messages.length} messages
              </Text>
            </div>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
              className="text-[#ff4d4f]"
              data-cy={`chatbot-history-delete-${chat.id}`}
            />
          </div>
        </Menu.Item>
      ))}
      {chats.length > 0 && (
        <>
          <Menu.Divider data-cy="chatbot-history-divider" />
          <Menu.Item
            key="clear-all"
            onClick={handleClearAllChats}
            data-cy="chatbot-history-clear-all"
          >
            <Text type="danger">Clear All Chats</Text>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        role="presentation"
        onClick={handleClose}
        className="fixed inset-0 bg-[rgba(17,24,39,0.35)] backdrop-blur-[6px] z-[1000]"
        data-cy="chatbot-backdrop"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed bottom-6 right-6 z-[1001] flex flex-col rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(17,24,39,0.18)] bg-[#F4F5F9] max-w-[calc(100vw-32px)] max-h-[calc(100vh-48px)] h-[min(700px,calc(100vh-48px))]"
        style={{ width: panelWidth }}
        data-cy="chatbot-modal"
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="px-5 py-4 bg-gradient-to-b from-[#F8F7FF] to-white border-b border-[rgba(229,231,235,0.8)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  src="/icons/512.png"
                  className="bg-white border border-[rgba(91,79,255,0.15)] shadow-[0_4px_12px_rgba(91,79,255,0.2)] p-[6px]"
                  data-cy="chatbot-header-avatar"
                />
                <div>
                  <div className="text-[#2C2F36] text-base font-semibold leading-tight">
                    SelamNew AI
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip title="New Chat">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleNewChat}
                    className="text-[#5B4FFF]"
                    data-cy="chatbot-new-chat-button"
                  />
                </Tooltip>
                {chats.length > 0 && (
                  <Dropdown
                    overlay={chatHistoryMenu}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      className="text-[#5B4FFF]"
                      data-cy="chatbot-history-button"
                    />
                  </Dropdown>
                )}
                <Tooltip title="Close">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={handleClose}
                    className="text-[#8C91A0]"
                    data-cy="chatbot-close-button"
                  />
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 min-h-0">
            {messages.length === 0 ? (
              <div
                className="bg-gradient-to-b from-white to-[#F7F6FF] rounded-[20px] p-8 flex flex-col items-center justify-center text-center gap-[18px] shadow-[0_12px_30px_rgba(91,79,255,0.08)] border border-[rgba(91,79,255,0.08)]"
                data-cy="chatbot-empty-state"
              >
                <div className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center relative shadow-[0_18px_45px_rgba(102,126,234,0.25)]">
                  <Image
                    src="/icons/256.png"
                    alt="SelamNew"
                    width={36}
                    height={36}
                    priority
                  />
                </div>
                <div>
                  <div className="text-lg font-semibold text-[#2C2F36] mb-2">
                    Welcome to SelamNew AI
                  </div>
                  <Text
                    type="secondary"
                    className="text-sm leading-[22px] max-w-[320px] block mx-auto"
                  >
                    Ask anything about planning, reporting, and managing your
                    team. Choose a quick prompt below or start typing your own
                    question.
                  </Text>
                </div>
                <div className="flex flex-wrap gap-[10px] justify-center">
                  {suggestedPrompts.map((suggestion) => (
                    <Button
                      key={suggestion}
                      size="small"
                      type="default"
                      onClick={() => setInputValue(suggestion)}
                      className="text-xs rounded-[16px] border border-[rgba(91,79,255,0.25)] text-[#5B4FFF] bg-[rgba(91,79,255,0.06)]"
                      data-cy={`chatbot-suggested-prompt-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = message.sender === 'user';
                  const userInitial =
                    userData?.firstName?.[0]?.toUpperCase() ||
                    userData?.lastName?.[0]?.toUpperCase() ||
                    'U';
                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-[6px]`}
                      data-cy={`chatbot-message-${message.id}`}
                    >
                      <div
                        className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <Avatar
                          size={36}
                          className={`${isUser ? 'bg-gradient-to-br from-[#F5F7FF] to-[#E9ECFF] text-[#5B4FFF] border border-[rgba(91,79,255,0.2)]' : 'bg-white text-white border border-[rgba(91,79,255,0.15)] p-[6px]'}`}
                          src={isUser ? undefined : '/icons/256.png'}
                          icon={isUser ? undefined : <RobotOutlined />}
                          data-cy={`chatbot-message-avatar-${message.id}`}
                        >
                          {isUser ? userInitial : null}
                        </Avatar>
                        <div
                          className={`max-w-[80%] bg-white ${isUser ? 'rounded-[18px_18px_4px_18px] p-3 border border-[rgba(91,79,255,0.15)] shadow-[0_12px_32px_rgba(91,79,255,0.08)]' : 'rounded-[18px_18px_18px_4px] p-4 border border-[rgba(91,79,255,0.1)] shadow-[0_15px_36px_rgba(102,126,234,0.12)]'} break-words text-sm leading-[22px] text-[#2C2F36]`}
                          data-cy={`chatbot-message-text-${message.id}`}
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
                        className={`text-[11px] text-[#8C91A0] ${isUser ? 'pr-12' : 'pl-12'}`}
                        data-cy={`chatbot-message-timestamp-${message.id}`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div
                    className="flex flex-row items-start gap-3"
                    data-cy="chatbot-loading-container"
                  >
                    <Avatar
                      size={36}
                      className="bg-white border border-[rgba(91,79,255,0.15)] p-[6px] text-white"
                      src="/icons/256.png"
                      icon={<RobotOutlined />}
                      data-cy="chatbot-loading-avatar"
                    />
                    <div className="p-3 rounded-[18px_18px_18px_4px] bg-white border border-[rgba(91,79,255,0.1)] shadow-[0_15px_36px_rgba(102,126,234,0.12)]">
                      <Spin size="small" data-cy="chatbot-loading-spinner" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <div className="px-5 pb-5 pt-4 border-t border-[rgba(91,79,255,0.08)] bg-white shadow-[0_-8px_30px_rgba(91,79,255,0.05)]">
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 rounded-[18px] px-[6px] py-[1px] flex flex-col gap-[10px]">
                <Input.TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="rounded-[12px] text-sm border border-[rgba(91,79,255,0.12)] resize-none px-3 py-[10px] bg-white"
                  disabled={isLoading}
                  data-cy="chatbot-input"
                />
              </div>
              <Button
                type="primary"
                icon={<SendOutlined className="text-white" />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-lg min-w-[50px] h-[46px] flex items-center justify-center bg-[#5B4FFF] border-none shadow-[0_18px_32px_rgba(102,126,234,0.25)] text-lg"
                data-cy="chatbot-send-button"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
