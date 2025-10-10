'use client';

import React from 'react';
import { Button, Badge } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import ChatBot from './ChatBot';
import { useChatBotStore } from '@/store/uistate/features/chatbot/chatbot';
import { useChatBotContextCleanup } from '@/hooks/useChatBotContextCleanup';

const ChatBotButton: React.FC = () => {
  const { isOpen, setIsOpen, chats } = useChatBotStore();

  // Initialize context cleanup
  useChatBotContextCleanup();

  // Count unread messages (messages in non-current chats)
  const unreadCount =
    chats.filter((chat) => chat.messages.length > 0).length - 1;

  return (
    <>
      <Badge count={unreadCount > 0 ? unreadCount : 0} size="small">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined style={{ fontSize: '24px' }} />}
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow =
              '0 12px 32px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow =
              '0 8px 24px rgba(102, 126, 234, 0.4)';
          }}
        />
      </Badge>
      <ChatBot open={isOpen} onClose={() => setIsOpen(false)} />

      <style jsx global>{`
        @media (max-width: 768px) {
          .ant-btn-circle[style*='position: fixed'] {
            bottom: 20px !important;
            right: 20px !important;
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBotButton;
