'use client';

import React from 'react';
import { Typography, Steps, Tag, Button, Divider } from 'antd';
import {
  CheckCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  BulbOutlined,
  DashboardOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface AIResponseFormatterProps {
  response: string;
  onActionClick?: (action: string) => void;
  compact?: boolean;
}

const AIResponseFormatter: React.FC<AIResponseFormatterProps> = ({
  response,
  onActionClick,
  compact = false,
}) => {
  // Check if the response contains OKR creation instructions
  const isOKRInstructions =
    response.toLowerCase().includes('create an okr') ||
    (response.toLowerCase().includes('okr') && response.includes('steps'));

  // Parse structured content from AI response
  const parseStructuredResponse = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim());
    const steps: Array<{
      title: string;
      description: string;
      icon: React.ReactNode;
    }> = [];

    // Define icons for common OKR steps
    const stepIcons = [
      <DashboardOutlined key="dashboard" className="text-blue-500" />,
      <UserOutlined key="user" className="text-green-500" />,
      <PlusOutlined key="plus" className="text-purple-500" />,
      <EditOutlined key="edit" className="text-orange-500" />,
      <BulbOutlined key="bulb" className="text-yellow-500" />,
      <SaveOutlined key="save" className="text-indigo-500" />,
    ];

    let currentStep = -1;
    let hasStructuredSteps = false;

    for (const line of lines) {
      // Look for numbered steps with various formats
      const stepMatch = line.match(
        /^\d+\.\s*\*\*(.*?)\*\*:?\s*(.*)|^\d+\.\s*(.*?):\s*(.*)|^\d+\.\s+(.*)/,
      );
      if (stepMatch) {
        hasStructuredSteps = true;
        currentStep++;

        let stepTitle = '';
        let stepDescription = '';

        if (stepMatch[1] && stepMatch[2]) {
          // Format: 1. **Title**: Description
          stepTitle = stepMatch[1].trim();
          stepDescription = stepMatch[2].trim();
        } else if (stepMatch[3] && stepMatch[4]) {
          // Format: 1. Title: Description
          stepTitle = stepMatch[3].trim();
          stepDescription = stepMatch[4].trim();
        } else if (stepMatch[5]) {
          // Format: 1. Title/Description
          const fullText = stepMatch[5].trim();
          const colonIndex = fullText.indexOf(':');
          if (colonIndex > 0) {
            stepTitle = fullText.substring(0, colonIndex).trim();
            stepDescription = fullText.substring(colonIndex + 1).trim();
          } else {
            stepTitle = fullText;
            stepDescription = '';
          }
        }

        steps.push({
          title: stepTitle,
          description: stepDescription,
          icon: stepIcons[currentStep] || (
            <CheckCircleOutlined key={currentStep} className="text-gray-500" />
          ),
        });
      } else if (line.trim() && currentStep >= 0 && !line.match(/^\d+\./)) {
        // Add additional description to current step
        const cleanLine = line.replace(/\*\*/g, '').trim();
        if (
          cleanLine &&
          steps[currentStep] &&
          !cleanLine.toLowerCase().includes('follow these steps')
        ) {
          if (steps[currentStep].description) {
            steps[currentStep].description += ` ${cleanLine}`;
          } else {
            steps[currentStep].description = cleanLine;
          }
        }
      }
    }

    return { steps, hasStructuredSteps };
  };

  const { steps, hasStructuredSteps } = parseStructuredResponse(response);

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  // If it's structured OKR instructions, render with enhanced formatting
  if (isOKRInstructions && hasStructuredSteps && steps.length > 0) {
    return (
      <div className="ai-response-formatted">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BulbOutlined className="text-white text-sm" />
          </div>
          <div>
            <Text strong className="text-gray-800 text-sm">
              How to Create OKR
            </Text>
            <div className="flex gap-1 mt-1">
              <Tag
                color="blue"
                className="text-xs px-2 py-0 rounded-full border-0"
                style={{ fontSize: '10px' }}
              >
                {steps.length} Steps
              </Tag>
              <Tag
                color="green"
                className="text-xs px-2 py-0 rounded-full border-0"
                style={{ fontSize: '10px' }}
              >
                Guide
              </Tag>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-4">
          {compact ? (
            // Compact view for chat
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">{step.icon}</div>
                  <div className="flex-1">
                    <Text strong className="text-sm text-gray-800 block mb-1">
                      {index + 1}. {step.title}
                    </Text>
                    {step.description && (
                      <Text className="text-xs text-gray-600 leading-relaxed">
                        {step.description}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Full view
            <Steps
              direction="vertical"
              size="small"
              className="okr-instruction-steps"
              items={steps.map((step) => ({
                title: (
                  <div className="flex items-center gap-2">
                    {step.icon}
                    <span className="font-medium text-gray-800 text-sm">
                      {step.title}
                    </span>
                  </div>
                ),
                description: step.description ? (
                  <div className="mt-2 ml-6">
                    <Paragraph className="text-gray-600 text-xs mb-0 leading-relaxed">
                      {step.description}
                    </Paragraph>
                  </div>
                ) : null,
                status: 'wait',
              }))}
            />
          )}
        </div>

        {/* Action Buttons */}
        {!compact && (
          <>
            <Divider className="my-4" style={{ margin: '16px 0' }} />
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                type="primary"
                size="small"
                icon={<DashboardOutlined />}
                onClick={() => handleActionClick('go-to-dashboard')}
                className="text-xs h-8"
                style={{ fontSize: '11px' }}
              >
                Go to Dashboard
              </Button>
              <Button
                size="small"
                icon={<UserOutlined />}
                onClick={() => handleActionClick('view-my-okr')}
                className="text-xs h-8"
                style={{ fontSize: '11px' }}
              >
                My OKR
              </Button>
            </div>
          </>
        )}

        {/* Quick Action for compact view */}
        {compact && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              type="link"
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={() => handleActionClick('go-to-dashboard')}
              className="text-blue-600 p-0 h-auto text-xs"
            >
              Go to OKR Dashboard
            </Button>
          </div>
        )}

        {/* Pro Tip */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <BulbOutlined className="text-blue-600 text-sm mt-0.5" />
            <div>
              <Text strong className="text-blue-800 text-xs block mb-1">
                💡 Pro Tip
              </Text>
              <Text className="text-blue-700 text-xs leading-relaxed">
                Make your objectives SMART (Specific, Measurable, Achievable,
                Relevant, Time-bound) and ensure key results are quantifiable.
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For non-structured responses, return formatted text
  return (
    <div className="ai-response-text">
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {response.split('\n').map((line, index) => {
          // Format bold text
          const formattedLine = line.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>',
          );

          return (
            <div key={index} className={line.trim() ? 'mb-2' : 'mb-1'}>
              <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIResponseFormatter;
