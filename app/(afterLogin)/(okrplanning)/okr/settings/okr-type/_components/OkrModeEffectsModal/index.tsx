'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons';

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
      width={600}
      closable={true}
      closeIcon={<CloseOutlined className="text-[#8c8c8c]" />}
      data-cy="okr-mode-effects-modal"
    >
      <div className="py-2" data-cy="okr-mode-effects-modal-content">
        {/* Header Section */}
        <div
          className="flex items-center gap-3 mb-6"
          data-cy="okr-mode-effects-modal-header"
        >
          <CheckCircleFilled
            className="text-[#52c41a] text-[24px]"
            data-cy="okr-mode-effects-modal-icon"
          />
          <h3
            className="text-[20px] font-bold text-[#262626] m-0 leading-none"
            data-cy="okr-mode-effects-modal-title"
          >
            {title}
          </h3>
        </div>

        {/* Content Section */}
        <div
          className="space-y-4 mb-8"
          data-cy="okr-mode-effects-modal-content-section"
        >
          <ul
            className="space-y-3 m-0 p-0 list-none"
            data-cy="okr-mode-effects-modal-messages-list"
          >
            {messages.map((message, index) => (
              <li
                key={index}
                className="text-[15px] text-[#595959] flex items-start gap-2 leading-relaxed"
                data-cy={`okr-mode-effects-modal-message-${index}`}
              >
                <span
                  className="text-[#2b54ad] font-bold"
                  data-cy={`okr-mode-effects-modal-bullet-${index}`}
                >
                  •
                </span>
                <span data-cy={`okr-mode-effects-modal-message-text-${index}`}>
                  {message}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div
          className="flex justify-end"
          data-cy="okr-mode-effects-modal-actions"
        >
          <Button
            type="primary"
            onClick={onClose}
            className="h-10 px-10 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
            id="okr-mode-effects-modal-ok-button"
            data-cy="okr-mode-effects-modal-ok-button"
          >
            Success
          </Button>
        </div>
      </div>

      <style jsx global data-cy="okr-mode-effects-modal-styles">{`
        .ant-modal-content {
          border-radius: 12px !important;
          padding: 32px !important;
        }
        .ant-modal-close {
          top: 24px !important;
          right: 24px !important;
        }
      `}</style>
    </Modal>
  );
};

export default OkrModeEffectsModal;
