'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Spin } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchCopilotResponse } from '@/utils/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  open: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetchCopilotResponse(inputValue);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Drawer
      title={
        <div style={{ 
          textAlign: 'center', 
          color: '#5B4FFF',
          fontSize: '16px',
          fontWeight: 600 
        }}>
          ChatBot
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={350}
      closeIcon={<CloseOutlined style={{ color: '#5B4FFF' }} />}
      styles={{
        header: {
          borderBottom: 'none',
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
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            gap: '20px',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                animation: 'pulse 2s infinite',
              }} />
              <svg 
                width="30" 
                height="30" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" 
                  fill="white"
                />
                <path 
                  d="M8 10.5C8.82843 10.5 9.5 9.82843 9.5 9C9.5 8.17157 8.82843 7.5 8 7.5C7.17157 7.5 6.5 8.17157 6.5 9C6.5 9.82843 7.17157 10.5 8 10.5Z" 
                  fill="white"
                />
                <path 
                  d="M16 10.5C16.8284 10.5 17.5 9.82843 17.5 9C17.5 8.17157 16.8284 7.5 16 7.5C15.1716 7.5 14.5 8.17157 14.5 9C14.5 9.82843 15.1716 10.5 16 10.5Z" 
                  fill="white"
                />
                <path 
                  d="M12 17.5C14.33 17.5 16.31 16.04 17.11 14H15.45C14.76 15.19 13.48 16 12 16C10.52 16 9.24 15.19 8.55 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z" 
                  fill="white"
                />
              </svg>
            </div>
            <div style={{
              color: '#6B7280',
              fontSize: '14px',
              lineHeight: '20px',
              maxWidth: '250px',
            }}>
              Welcome to the selamnew chatbot! I am here to help you with any thing you need with the platform.
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: message.sender === 'user' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px',
                    background: message.sender === 'user'
                      ? 'transparent'
                      : 'white',
                    border: message.sender === 'user' 
                      ? '1px solid #E5E7EB' 
                      : 'none',
                    color: message.sender === 'user' ? '#374151' : '#374151',
                    fontSize: '14px',
                    lineHeight: '20px',
                    boxShadow: message.sender === 'bot' 
                      ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
                      : 'none',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.text}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    marginTop: '4px',
                    paddingLeft: message.sender === 'user' ? '0' : '4px',
                    paddingRight: message.sender === 'user' ? '4px' : '0',
                  }}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

      <div style={{
        padding: '16px 20px 20px',
        borderTop: '1px solid #E5E7EB',
        background: 'white',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
        }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about selamnew"
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
          0%, 100% {
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

