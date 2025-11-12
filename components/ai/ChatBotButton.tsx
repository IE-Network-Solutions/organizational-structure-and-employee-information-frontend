'use client';

import React from 'react';
import { Button, Badge, Tooltip, Avatar } from 'antd';
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
      <Tooltip title="Chat with SelamNew AI">
        <Badge count={unreadCount > 0 ? unreadCount : 0} size="small">
          <Button
            type="text"
            shape="circle"
            size="large"
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              width: '68px',
              height: '68px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              border: '2px solid rgba(91, 79, 255, 0.5)',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
              zIndex: 1000,
              transition: 'all 0.3s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow =
                '0 18px 40px rgba(102, 126, 234, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 12px 32px rgba(102, 126, 234, 0.25)';
            }}
          >
            <Avatar
              src="/icons/512.png"
              alt="SelamNew AI"
              size={48}
              style={{
                background: 'transparent',
              }}
            />
          </Button>
        </Badge>
      </Tooltip>
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
