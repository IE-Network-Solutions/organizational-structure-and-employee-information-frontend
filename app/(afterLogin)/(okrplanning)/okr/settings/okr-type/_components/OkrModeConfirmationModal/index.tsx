'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface OkrModeConfirmationModalProps {
  open: boolean;
  transitionDirection: 'BasicToAdvanced' | 'AdvancedToBasic';
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const OkrModeConfirmationModal: React.FC<OkrModeConfirmationModalProps> = ({
  open,
  transitionDirection,
  onConfirm,
  onCancel,
  loading,
}) => {
  const isBasicToAdvanced = transitionDirection === 'BasicToAdvanced';

  const title = isBasicToAdvanced
    ? 'Switching to Advanced Mode?'
    : 'Switching to Basic Mode?';

  const messages = isBasicToAdvanced
    ? [
        'All existing Objectives and Key Results remain intact.',
        'Done / Not Done KRs will be mapped to Achieved / Not Achieved.',
        'Advanced metrics (Numeric, Percentage, Currency, Weights) will be available.',
      ]
    : [
        'All existing Objectives and Key Results remain intact.',
        'Fully achieved KRs and milestones will be marked Done.',
        'Partially completed or Not Achieved KRs will be marked Not Done.',
        'Advanced metrics and milestone details will not be available.',
      ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={500}
      closable={!loading}
      maskClosable={!loading}
      data-cy="okr-mode-confirmation-modal"
    >
      <div className="py-4">
        <div className="flex items-start gap-4 mb-6">
          <ExclamationCircleOutlined
            className="text-yellow-500 text-2xl mt-1"
            data-cy="okr-mode-confirmation-modal-warning-icon"
            id="okr-mode-confirmation-modal-warning-icon"
          />
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-gray-900 mb-4"
              data-cy="okr-mode-confirmation-modal-title"
              id="okr-mode-confirmation-modal-title"
            >
              {title}
            </h3>
            <ul className="space-y-2">
              {messages.map((message, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                  data-cy={`okr-mode-confirmation-modal-message-${index}`}
                  id={`okr-mode-confirmation-modal-message-${index}`}
                >
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onCancel}
            disabled={loading}
            data-cy="okr-mode-confirmation-modal-cancel-button"
            id="okr-mode-confirmation-modal-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            loading={loading}
            data-cy="okr-mode-confirmation-modal-ok-button"
            id="okr-mode-confirmation-modal-ok-button"
          >
            OK
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OkrModeConfirmationModal;
