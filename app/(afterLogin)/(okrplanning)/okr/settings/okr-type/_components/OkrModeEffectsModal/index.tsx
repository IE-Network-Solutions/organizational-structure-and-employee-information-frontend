'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface OkrModeEffectsModalProps {
  open: boolean;
  transitionDirection: 'BasicToAdvanced' | 'AdvancedToBasic';
  onClose: () => void;
}

const OkrModeEffectsModal: React.FC<OkrModeEffectsModalProps> = ({
  open,
  transitionDirection,
  onClose,
}) => {
  const isBasicToAdvanced = transitionDirection === 'BasicToAdvanced';

  const title = isBasicToAdvanced
    ? 'Mode Changed to Advanced'
    : 'Mode Changed to Basic';

  const messages = isBasicToAdvanced
    ? [
        'All existing Objectives and Key Results have been preserved.',
        'Your previous Done / Not Done KRs are now mapped to Achieved / Not Achieved.',
        'Advanced metrics are now available for all KRs.',
      ]
    : [
        'All existing Objectives and Key Results have been preserved.',
        'Fully achieved KRs and milestones are now marked Done.',
        'Partially completed or Not Achieved KRs are now marked Not Done.',
        'Advanced metrics and milestone details will not be available.',
      ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      closable={true}
      maskClosable={true}
      data-cy="okr-mode-effects-modal"
    >
      <div className="py-4">
        <div className="flex items-start gap-4 mb-6">
          <InfoCircleOutlined
            className="text-blue-500 text-2xl mt-1"
            data-cy="okr-mode-effects-modal-info-icon"
            id="okr-mode-effects-modal-info-icon"
          />
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 mb-4"
              data-cy="okr-mode-effects-modal-title"
              id="okr-mode-effects-modal-title"
            >
              {title}
            </h3>
            <ul className="space-y-2">
              {messages.map((message, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                  data-cy={`okr-mode-effects-modal-message-${index}`}
                  id={`okr-mode-effects-modal-message-${index}`}
                >
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            type="primary"
            onClick={onClose}
            data-cy="okr-mode-effects-modal-ok-button"
            id="okr-mode-effects-modal-ok-button"
          >
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OkrModeEffectsModal;
