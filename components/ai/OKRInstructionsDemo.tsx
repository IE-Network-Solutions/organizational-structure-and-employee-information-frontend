'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Divider } from 'antd';
import { PlayCircleOutlined, MessageOutlined } from '@ant-design/icons';
import OKRInstructionsDisplay from './OKRInstructionsDisplay';
import AIResponseFormatter from './AIResponseFormatter';

const { Title, Paragraph } = Typography;

const OKRInstructionsDemo: React.FC = () => {
  const [showFullDisplay, setShowFullDisplay] = useState(false);
  const [showChatFormat, setShowChatFormat] = useState(false);

  // Sample backend response text
  const sampleResponse = `How to create OKR
03:41 PM
To create an OKR, follow these steps: 1. **Go to the OKR Dashboard**: Access the dashboard where you can manage your objectives and key results. 2. **Click "My OKR"**: Select this option to view your personal objectives and key results. 3. **Click "Set Objective"**: This will allow you to create and define a new objective for your OKR plan. 4. **Define Your Objective**: Clearly state what you want to achieve. Make sure it is specific, measurable, achievable, relevant, and time-bound (SMART). 5. **Add Key Results**: For each objective, define key results that will help measure your progress. Key results should also be specific and quantifiable. 6. **Save Your OKR**: Once you have defined your objective and key results, save your OKR to keep track of your goals. By following these steps, you can effectively create your OKR.
03:41 PM`;

  return (
    <div className="p-6 max-w-6xl mx-auto" data-cy="okr-instructions-demo">
      <div className="mb-8" data-cy="okr-instructions-demo-header">
        <Title
          level={2}
          className="text-center mb-4"
          data-cy="okr-instructions-demo-title"
        >
          OKR Instructions Display Demo
        </Title>
        <Paragraph
          className="text-center text-gray-600"
          data-cy="okr-instructions-demo-description"
        >
          This demo shows how backend AI responses about OKR creation are
          professionally formatted and displayed in the UI.
        </Paragraph>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        data-cy="okr-instructions-demo-content"
      >
        {/* Raw Response */}
        <Card title="Raw Backend Response" className="h-fit">
          <div
            className="bg-gray-50 p-4 rounded-lg border"
            data-cy="okr-instructions-demo-raw-response"
          >
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {sampleResponse}
            </pre>
          </div>
        </Card>

        {/* Formatted Displays */}
        <div className="space-y-6" data-cy="okr-instructions-demo-formatted">
          {/* Chat Format Preview */}
          <Card title="Chat Bot Format (Compact)" className="h-fit">
            <div
              className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg"
              data-cy="okr-instructions-demo-chat-format-container"
            >
              <div
                className="bg-white p-4 rounded-lg shadow-sm"
                data-cy="okr-instructions-demo-chat-format-content"
              >
                <AIResponseFormatter
                  response={sampleResponse}
                  compact={true}
                  onActionClick={() => {
                    // console.log('Demo action clicked');
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => setShowChatFormat(!showChatFormat)}
                size="small"
              >
                {showChatFormat ? 'Hide' : 'Show'} in Chat Context
              </Button>
            </div>
          </Card>

          {/* Full Display Preview */}
          <Card title="Full Display Format" className="h-fit">
            <div className="mb-4">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => setShowFullDisplay(!showFullDisplay)}
              >
                {showFullDisplay ? 'Hide' : 'Show'} Full Display
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Chat Context Demo */}
      {showChatFormat && (
        <Card title="Chat Bot Context Demo" className="mt-6">
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border">
            <div className="max-w-md mx-auto">
              {/* Simulated chat messages */}
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-transparent border border-gray-200 rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                    <p className="text-sm text-gray-700">How to create OKR</p>
                    <p className="text-xs text-gray-500 mt-1">03:41 PM</p>
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-4 max-w-xs shadow-sm border">
                    <AIResponseFormatter
                      response={sampleResponse}
                      compact={true}
                      onActionClick={() => {
                        // console.log('Demo action clicked');
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">03:41 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Full Display Demo */}
      {showFullDisplay && (
        <div className="mt-6">
          <Divider />
          <Title level={3} className="text-center mb-6">
            Full Display Format
          </Title>
          <div className="max-w-4xl mx-auto">
            <OKRInstructionsDisplay
              instructionText={sampleResponse}
              onActionClick={() => {
                // console.log('Demo action clicked');
              }}
            />
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <Card title="Implementation Guide" className="mt-6">
        <div className="space-y-4">
          <div>
            <Title level={4}>For Chat Bot Integration:</Title>
            <Paragraph>
              Use <code>AIResponseFormatter</code> with{' '}
              <code>compact=true</code> to display AI responses in the chat
              interface. This provides a clean, structured view that fits well
              within chat bubbles.
            </Paragraph>
          </div>

          <div>
            <Title level={4}>For Full Page Display:</Title>
            <Paragraph>
              Use <code>OKRInstructionsDisplay</code> for dedicated pages or
              modals where you want to show comprehensive OKR creation
              instructions with full formatting and action buttons.
            </Paragraph>
          </div>

          <div>
            <Title level={4}>Backend Integration:</Title>
            <Paragraph>
              Both components automatically parse structured text from your
              backend AI responses. They look for numbered steps and format them
              professionally with icons and proper spacing.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OKRInstructionsDemo;
