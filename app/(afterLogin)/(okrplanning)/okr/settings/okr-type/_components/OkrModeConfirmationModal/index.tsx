'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { WarningFilled, CloseOutlined } from '@ant-design/icons';

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
      <div
        className="py-4"
        data-cy="okr-mode-confirmation-modal-content"
        id="okr-mode-confirmation-modal-content"
      >
        <div
          className="flex items-start gap-4 mb-6"
          data-cy="okr-mode-confirmation-modal-header"
          id="okr-mode-confirmation-modal-header"
        >
          <ExclamationCircleOutlined
            className="text-yellow-500 text-2xl mt-1"
            data-cy="okr-mode-confirmation-modal-warning-icon"
            id="okr-mode-confirmation-modal-warning-icon"
          />
          <div
            className="flex-1"
            data-cy="okr-mode-confirmation-modal-text-container"
            id="okr-mode-confirmation-modal-text-container"
          >
            <h3
              className="text-lg font-semibold text-gray-900 mb-4"
              data-cy="okr-mode-confirmation-modal-title"
              id="okr-mode-confirmation-modal-title"
            >
              {title}
            </h3>
            <ul
              className="space-y-2"
              data-cy="okr-mode-confirmation-modal-messages-list"
              id="okr-mode-confirmation-modal-messages-list"
            >
              {messages.map((message, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start gap-2"
                  data-cy={`okr-mode-confirmation-modal-message-${index}`}
                  id={`okr-mode-confirmation-modal-message-${index}`}
                >
                  <span
                    className="text-gray-400 mt-1"
                    data-cy={`okr-mode-confirmation-modal-bullet-${index}`}
                    id={`okr-mode-confirmation-modal-bullet-${index}`}
                  >
                    •
                  </span>
                  <span
                    data-cy={`okr-mode-confirmation-modal-message-text-${index}`}
                    id={`okr-mode-confirmation-modal-message-text-${index}`}
                  >
                    {message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="flex justify-end gap-3"
          data-cy="okr-mode-confirmation-modal-actions"
        >
          <Button
            type="default"
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
            id="okr-mode-confirmation-cancel-button"
            data-cy="okr-mode-confirmation-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            loading={loading}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
            id="okr-mode-confirmation-confirm-button"
            data-cy="okr-mode-confirmation-confirm-button"
          >
            Change
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OkrModeConfirmationModal;
