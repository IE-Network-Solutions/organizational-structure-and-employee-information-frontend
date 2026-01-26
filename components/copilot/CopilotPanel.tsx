'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Drawer } from 'antd';
import CopilotHeader from './CopilotHeader';
import CopilotMessages, { Message } from './CopilotMessages';
import CopilotInput from './CopilotInput';
import CopilotEmptyState from './CopilotEmptyState';

interface CopilotPanelProps {
  open: boolean;
  onClose: () => void;
  userInitials?: string;
}

/**
 * CopilotPanel - Main Copilot UI component
 * 
 * Architecture:
 * - Uses Ant Design Drawer for right-side panel
 * - Width: ~400px (responsive)
 * - Full height (minus header)
 * - Non-blocking overlay (allows dashboard context)
 * 
 * State Management:
 * - Messages stored locally (can be moved to global store later)
 * - Loading state for async operations
 * 
 * Extension Points:
 * - handleSend: Replace with actual AI API call
 * - Mock responses: Replace with real AI responses
 * - Message metadata: Add source tracking, confidence cues
 */
const CopilotPanel: React.FC<CopilotPanelProps> = ({
  open,
  onClose,
  userInitials,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);

  // Responsive width handling
  useEffect(() => {
    const updateWidth = () => {
      if (typeof window === 'undefined') return;
      const { innerWidth } = window;
      if (innerWidth < 480) {
        setDrawerWidth(innerWidth);
      } else if (innerWidth < 768) {
        setDrawerWidth(380);
      } else {
        setDrawerWidth(400);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  /**
   * Mock response generator
   * TODO: Replace with actual AI API integration
   * 
   * Expected API signature:
   * async function fetchCopilotResponse(
   *   query: string,
   *   context: { messages: Message[], userRole: string, tenantId: string }
   * ): Promise<{ text: string, metadata?: { source: string, confidence: string } }>
   */
  const generateMockResponse = useCallback((userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();

    // Time & Attendance responses
    if (lowerQuery.includes('late') || lowerQuery.includes('attendance')) {
      return `Based on attendance records, I found 3 employees who were late today:\n\n• John Doe (Engineering) - 15 minutes late\n• Jane Smith (Sales) - 8 minutes late\n• Bob Johnson (Marketing) - 22 minutes late\n\n⚠️ Note: Bob Johnson has been late 3 times this week.`;
    }

    if (lowerQuery.includes('leave') || lowerQuery.includes('approval')) {
      return `You have 2 pending leave approvals:\n\n• Sarah Williams - Vacation (Jan 30 - Feb 5)\n• Mike Davis - Sick Leave (Jan 27)\n\n✅ Both requests are within policy guidelines.`;
    }

    // Employee & Organization responses
    if (lowerQuery.includes('report') || lowerQuery.includes('team')) {
      return `Your direct reports:\n\n• Engineering Team (5 members)\n• Product Team (3 members)\n• Design Team (2 members)\n\nFrom OKR data (Q1 2026), all teams are on track with their objectives.`;
    }

    if (lowerQuery.includes('department') || lowerQuery.includes('organization')) {
      return `The Engineering department has 25 employees across 3 teams:\n\n• Backend Team: 10 members\n• Frontend Team: 8 members\n• DevOps Team: 7 members\n\nBased on organizational structure data.`;
    }

    // OKR responses
    if (lowerQuery.includes('okr') || lowerQuery.includes('objective')) {
      return `Your team's OKR progress for Q1 2026:\n\n✅ On Track:\n• Increase user engagement by 20% (75% complete)\n• Reduce support tickets by 15% (80% complete)\n\n⚠️ At Risk:\n• Launch new feature by end of Q1 (45% complete)\n\nFrom OKR data (Q1 2026).`;
    }

    // Default response
    return `I understand you're asking about "${userQuery}". This is a mock response.\n\nIn production, I'll connect to the SelamNew AI service to provide role-aware, secure responses based on your system data.\n\nResponses are role-aware and based on system data.`;
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // const response = await fetchCopilotResponse(query, {
      //   messages: [...messages, userMessage],
      //   userRole: userData?.role,
      //   tenantId: tenantId,
      // });

      const responseText = generateMockResponse(query);

      // Determine metadata based on response content
      const metadata: Message['metadata'] = {};
      if (responseText.includes('attendance records')) {
        metadata.source = 'Time & Attendance';
        metadata.confidence = 'Based on attendance records';
      } else if (responseText.includes('OKR data')) {
        metadata.source = 'OKR System';
        metadata.confidence = 'From OKR data (Q1 2026)';
      } else if (responseText.includes('organizational structure')) {
        metadata.source = 'Employee & Organization';
        metadata.confidence = 'Based on organizational structure data';
      }

      const copilotMessage: Message = {
        id: `msg-${Date.now()}-copilot`,
        text: responseText,
        sender: 'copilot',
        timestamp: new Date(),
        metadata,
      };

      setMessages((prev) => [...prev, copilotMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'copilot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, generateMockResponse]);

  const handlePromptSelect = useCallback((prompt: string) => {
    setInputValue(prompt);
    // Auto-focus input (handled by browser)
  }, []);

  return (
    <Drawer
      title={null}
      placement="right"
      onClose={onClose}
      open={open}
      width={drawerWidth}
      closable={false}
      mask={false}
      className="copilot-drawer"
      style={{
        zIndex: 1001,
      }}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)', // Full height minus header (typical header height)
          overflow: 'hidden', // Prevent body from scrolling
        },
      }}
      data-cy="copilot-panel"
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="px-4 pt-4 bg-white border-b border-gray-200 flex-shrink-0">
          <CopilotHeader onClose={onClose} />
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <CopilotEmptyState onPromptSelect={handlePromptSelect} />
          ) : (
            <CopilotMessages
              messages={messages}
              isLoading={isLoading}
              userInitials={userInitials}
            />
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <CopilotInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Responses are role-aware and based on system data.
          </p>
        </div>
      </div>
    </Drawer>
  );
};

export default CopilotPanel;
