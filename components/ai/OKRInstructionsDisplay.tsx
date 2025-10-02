'use client';

import React from 'react';
import { Card, Steps, Typography, Tag, Button, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  SaveOutlined,
  BulbOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface OKRInstructionsDisplayProps {
  instructionText: string;
  title?: string;
  showAsCard?: boolean;
  onActionClick?: (action: string) => void;
}

const OKRInstructionsDisplay: React.FC<OKRInstructionsDisplayProps> = ({
  instructionText,
  title = "How to Create OKR",
  showAsCard = true,
  onActionClick
}) => {
  // Parse the instruction text to extract structured information
  const parseInstructions = (text: string) => {
    // Split by numbered steps and clean up
    const lines = text.split('\n').filter(line => line.trim());
    const steps: Array<{ title: string; description: string; icon: React.ReactNode }> = [];
    
    // Define icons for each step
    const stepIcons = [
      <DashboardOutlined key="dashboard" className="text-blue-600" />,
      <UserOutlined key="user" className="text-green-600" />,
      <PlusOutlined key="plus" className="text-purple-600" />,
      <EditOutlined key="edit" className="text-orange-600" />,
      <BulbOutlined key="bulb" className="text-yellow-600" />,
      <SaveOutlined key="save" className="text-indigo-600" />
    ];

    let currentStep = -1;
    
    for (const line of lines) {
      // Check if line starts with a number (step indicator)
      const stepMatch = line.match(/^\d+\.\s*\*\*(.*?)\*\*:\s*(.*)/);
      if (stepMatch) {
        currentStep++;
        const stepTitle = stepMatch[1].trim();
        const stepDescription = stepMatch[2].trim();
        
        steps.push({
          title: stepTitle,
          description: stepDescription,
          icon: stepIcons[currentStep] || <CheckCircleOutlined key={currentStep} className="text-gray-600" />
        });
      } else if (line.includes('**') && currentStep >= 0) {
        // Handle additional content for current step
        const cleanLine = line.replace(/\*\*/g, '').trim();
        if (cleanLine && steps[currentStep]) {
          steps[currentStep].description += ` ${cleanLine}`;
        }
      }
    }

    // If no structured steps found, create a fallback structure
    if (steps.length === 0) {
      const fallbackSteps = [
        "Go to the OKR Dashboard",
        "Click \"My OKR\"",
        "Click \"Set Objective\"",
        "Define Your Objective",
        "Add Key Results",
        "Save Your OKR"
      ];

      fallbackSteps.forEach((step, index) => {
        steps.push({
          title: step,
          description: getStepDescription(step),
          icon: stepIcons[index] || <CheckCircleOutlined key={index} className="text-gray-600" />
        });
      });
    }

    return steps;
  };

  const getStepDescription = (stepTitle: string): string => {
    const descriptions: { [key: string]: string } = {
      "Go to the OKR Dashboard": "Access the dashboard where you can manage your objectives and key results.",
      "Click \"My OKR\"": "Select this option to view your personal objectives and key results.",
      "Click \"Set Objective\"": "This will allow you to create and define a new objective for your OKR plan.",
      "Define Your Objective": "Clearly state what you want to achieve. Make sure it is specific, measurable, achievable, relevant, and time-bound (SMART).",
      "Add Key Results": "For each objective, define key results that will help measure your progress. Key results should also be specific and quantifiable.",
      "Save Your OKR": "Once you have defined your objective and key results, save your OKR to keep track of your goals."
    };
    return descriptions[stepTitle] || "Follow this step to proceed with OKR creation.";
  };

  const steps = parseInstructions(instructionText);

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  const content = (
    <div className="okr-instructions-content">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BulbOutlined className="text-white text-xl" />
          </div>
          <div>
            <Title level={4} className="mb-1 text-gray-800">
              {title}
            </Title>
            <Text type="secondary" className="text-sm">
              Follow these steps to create your OKR effectively
            </Text>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-2 mb-4">
          <Tag color="blue" className="rounded-full px-3 py-1">
            {steps.length} Steps
          </Tag>
          <Tag color="green" className="rounded-full px-3 py-1">
            SMART Goals
          </Tag>
          <Tag color="purple" className="rounded-full px-3 py-1">
            Measurable Results
          </Tag>
        </div>
      </div>

      {/* Steps Section */}
      <div className="mb-6">
        <Steps
          direction="vertical"
          size="small"
          className="okr-instruction-steps"
          items={steps.map((step, index) => ({
            title: (
              <div className="flex items-center gap-2">
                {step.icon}
                <span className="font-medium text-gray-800">{step.title}</span>
              </div>
            ),
            description: (
              <div className="mt-2 ml-6">
                <Paragraph className="text-gray-600 text-sm mb-0 leading-relaxed">
                  {step.description}
                </Paragraph>
              </div>
            ),
            status: 'wait'
          }))}
        />
      </div>

      <Divider className="my-6" />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          type="primary"
          size="large"
          icon={<DashboardOutlined />}
          onClick={() => handleActionClick('go-to-dashboard')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Go to OKR Dashboard
        </Button>
        <Button
          size="large"
          icon={<UserOutlined />}
          onClick={() => handleActionClick('view-my-okr')}
          className="border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
        >
          View My OKR
        </Button>
        <Button
          size="large"
          icon={<PlusOutlined />}
          onClick={() => handleActionClick('create-objective')}
          className="border-purple-300 text-purple-600 hover:border-purple-500 hover:text-purple-700"
        >
          Create Objective
        </Button>
      </div>

      {/* Footer Tip */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <BulbOutlined className="text-blue-600 mt-1" />
          <div>
            <Text strong className="text-blue-800 block mb-1">
              💡 Pro Tip
            </Text>
            <Text className="text-blue-700 text-sm">
              Make your objectives specific and time-bound. Each key result should be measurable and contribute to achieving your objective. 
              Remember to review and update your OKRs regularly to track progress.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAsCard) {
    return (
      <Card
        className="okr-instructions-card shadow-lg border-0"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {content}
      </Card>
    );
  }

  return (
    <div className="okr-instructions-wrapper p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {content}
    </div>
  );
};

export default OKRInstructionsDisplay;
