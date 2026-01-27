
'use client';
import React from 'react';
import { Modal, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

interface OkrModeSelectionModalProps {
  open: boolean;
  onSuccess: () => void;
  saveOkrMode: (mode: 'Basic' | 'Advanced') => Promise<boolean>;
  loading?: boolean;
}

// 1. IMPROVED CHECKBOX COMPONENT
// Added 'min-w-[20px]' to prevent it from collapsing
// Added 'text-left' to ensure text doesn't center align strangely
const FeatureItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 w-full text-left mb-3">
    {/* The Blue Square - Forced dimensions and color with inline style backup */}
    <div 
      className="min-w-[20px] w-[20px] h-[20px] !bg-blue-600 rounded-[4px] flex items-center justify-center flex-shrink-0 mt-1"
      style={{ backgroundColor: '#2563eb' }}
    >
      <CheckOutlined style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }} />
    </div>
    <span className="text-gray-600 font-medium text-sm leading-6">{text}</span>
  </li>
);

// 2. IMPROVED CARD COMPONENT
// Added '!border-blue-600' (important) to force the border color
// Added 'ring' as a backup for visibility
const OkrOptionCard: React.FC<{
  title: string;
  type: 'Basic' | 'Advanced';
  isSelected: boolean;
  features: string[];
  onSelect: (type: 'Basic' | 'Advanced') => void;
}> = ({ title, type, isSelected, features, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(type)}
      className={`
        relative p-8 rounded-xl cursor-pointer transition-all duration-200 bg-white h-full
        border-2 flex flex-col items-center
        ${
          isSelected
            ? '!border-blue-600 ring-1 ring-blue-600 shadow-xl bg-blue-50/10' // Selected: Force Blue Border
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md' // Unselected
        }
      `}
      data-cy={`okr-mode-${type.toLowerCase()}-card`}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        {title}
      </h3>
      
      {/* Container for list to keep it centered but text aligned left */}
      <div className="w-full pl-2">
        <ul className="flex flex-col">
          {features.map((feature, index) => (
            <FeatureItem key={index} text={feature} />
          ))}
        </ul>
      </div>
    </div>
  );
};

const OkrModeSelectionModal: React.FC<OkrModeSelectionModalProps> = ({
  open,
  onSuccess,
  saveOkrMode,
  loading: externalLoading,
}) => {
  const {
    okrModalSelectedMode: selectedMode,
    setOkrModalSelectedMode: setSelectedMode,
    okrModalIsSaving: isSaving,
    setOkrModalIsSaving: setIsSaving,
  } = useOKRStore();

  const isLoading = externalLoading || isSaving;

  const handleSubmit = async () => {
    if (!selectedMode) return;
    setIsSaving(true);
    try {
      await saveOkrMode(selectedMode);
      setSelectedMode(null);
      onSuccess();
    } catch (error) {
      // Error handled elsewhere
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      centered
      width={900}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      maskStyle={{
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }}
      // Removing default modal padding for cleaner look
      bodyStyle={{ padding: 0 }} 
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      <div className="py-10 px-8 bg-white rounded-2xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-3 text-gray-800">
            Welcome to SelamNew OKR
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Select how you want to track objectives for your organization.
            <br />
            This setting applies to all users but can be changed later by admins.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
          <OkrOptionCard
            title="Basic OKR"
            type="Basic"
            isSelected={selectedMode === 'Basic'}
            onSelect={setSelectedMode}
            features={[
              'Simple Done/ Not Done',
              'No complex metric or weight',
              'Best for starting quickly',
              'Manual Progress Update',
            ]}
          />

          <OkrOptionCard
            title="Advanced OKR"
            type="Advanced"
            isSelected={selectedMode === 'Advanced'}
            onSelect={setSelectedMode}
            features={[
              'Detailed metrics (%, currency, #)',
              'Weighted Key results',
              'Integrated with planning module',
              'Automated scoring and reporting',
            ]}
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center h-14">
          {selectedMode ? (
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              className="bg-blue-600 hover:bg-blue-700 h-12 px-12 text-base font-semibold rounded-lg shadow-lg border-none"
            >
              Get Started with {selectedMode}
            </Button>
          ) : (
            // Placeholder to prevent layout shift when no button is shown
             <div className="h-12"></div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OkrModeSelectionModal;