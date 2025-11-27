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
    <Menu>
      {chats.map((chat) => (
        <Menu.Item key={chat.id} onClick={() => handleChatSelect(chat.id)}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, marginRight: '8px' }}>
              <Text ellipsis style={{ fontSize: '12px' }}>
                {chat.title}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '10px' }}>
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
              style={{ color: '#ff4d4f' }}
            />
          </div>
        </Menu.Item>
      ))}
      {chats.length > 0 && (
        <>
          <Menu.Divider />
          <Menu.Item key="clear-all" onClick={handleClearAllChats}>
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
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 24, 39, 0.35)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        id="chatbot-wrapper-view-space"
        data-cy="chatbot-wrapper-view-space"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1001,
          width: panelWidth,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 48px)',
          height: 'min(700px, calc(100vh - 48px))',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(17, 24, 39, 0.18)',
          background: '#F4F5F9',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(180deg, #F8F7FF 0%, #FFFFFF 100%)',
              borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
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
                <div>
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
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Tooltip
                  title="New Chat"
                  id="chatbot-new-chat-tooltip-wrapper-view-space"
                  data-cy="chatbot-new-chat-tooltip-wrapper-view-space"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleNewChat}
                    style={{ color: '#5B4FFF' }}
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
                      style={{ color: '#5B4FFF' }}
                    />
                  </Dropdown>
                )}
                <Tooltip
                  title="Close"
                  id="chatbot-close-tooltip-wrapper-view-space"
                  data-cy="chatbot-close-tooltip-wrapper-view-space"
                >
                  <Button
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

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: 0,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #F7F6FF 100%)',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '18px',
                  boxShadow: '0 12px 30px rgba(91, 79, 255, 0.08)',
                  border: '1px solid rgba(91, 79, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 18px 45px rgba(102, 126, 234, 0.25)',
                  }}
                >
                  <Image
                    src="/icons/256.png"
                    alt="SelamNew"
                    width={36}
                    height={36}
                    priority
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#2C2F36',
                      marginBottom: '8px',
                    }}
                  >
                    Welcome to SelamNew AI
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      lineHeight: '22px',
                      maxWidth: '320px',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  >
                    Ask anything about planning, reporting, and managing your
                    team. Choose a quick prompt below or start typing your own
                    question.
                  </Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                  }}
                >
                  {suggestedPrompts.map((suggestion) => (
                    <Button
                      key={suggestion}
                      size="small"
                      type="default"
                      onClick={() => setInputValue(suggestion)}
                      style={{
                        fontSize: '12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(91, 79, 255, 0.25)',
                        color: '#5B4FFF',
                        background: 'rgba(91, 79, 255, 0.06)',
                      }}
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
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: '12px',
                          width: '100%',
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                        }}
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
                        <div
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
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
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
                    <div
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
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div
            style={{
              padding: '16px 20px 20px',
              borderTop: '1px solid rgba(91, 79, 255, 0.08)',
              background: '#FFFFFF',
              boxShadow: '0 -8px 30px rgba(91, 79, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  flex: 1,
                  borderRadius: '18px',
                  padding: '1px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <Input.TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: '1px solid rgba(91, 79, 255, 0.12)',
                    resize: 'none',
                    padding: '10px 12px',
                    background: '#FFFFFF',
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="primary"
                icon={<SendOutlined style={{ color: '#FFFFFF' }} />}
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  borderRadius: '8px',
                  minWidth: '50px',
                  height: '46px',
                  display: 'block',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#5B4FFF',
                  border: 'none',
                  boxShadow: '0 18px 32px rgba(102, 126, 234, 0.25)',
                  fontSize: '18px',
                }}
              />
            </div>
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
      </div>
    </>
  );
};

export default ChatBot;
