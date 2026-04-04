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
    ? 'Change to Advanced OKR'
    : 'Change to Basic OKR';

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="min(621px, calc(100vw - 32px))"
      wrapClassName="okr-settings-modal-responsive-wrap"
      styles={{
        content: {
          padding: '20px 24px',
          borderRadius: 8,
          minHeight: 276,
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
        },
      }}
      closable={!loading}
      closeIcon={<CloseOutlined className="text-[#8c8c8c]" />}
      maskClosable={!loading}
      data-cy="okr-mode-confirmation-modal"
    >
      <div
        className="flex flex-col gap-6 min-w-0 max-w-full"
        data-cy="okr-mode-confirmation-modal-content"
      >
        {/* Header with Icon */}
        <div
          className="flex items-center gap-3"
          data-cy="okr-mode-confirmation-modal-header"
        >
          <WarningFilled
            className="text-[#faad14] text-[24px]"
            data-cy="okr-mode-confirmation-modal-icon"
          />
          <h3
            className="text-[20px] font-bold text-[#262626] m-0 leading-none"
            data-cy="okr-mode-confirmation-modal-title"
          >
            {title}
          </h3>
        </div>

        {/* Content Section */}
        <div
          className="flex flex-col gap-4 pr-0 sm:pr-4 min-w-0"
          data-cy="okr-mode-confirmation-modal-content-section"
        >
          {isBasicToAdvanced ? (
            <>
              <p
                className="text-[14px] font-normal text-[rgba(0,0,0,0.7)] leading-[1.6]"
                data-cy="okr-mode-confirmation-modal-basic-to-advanced-p1"
              >
                You are about to switch to Advanced OKR. All Key Results will
                enter Advanced mode while still being Achieved / Not Achieved
                metrics.
              </p>
              <p
                className="text-[14px] font-normal text-[rgba(0,0,0,0.7)] leading-[1.6]"
                data-cy="okr-mode-confirmation-modal-basic-to-advanced-p2"
              >
                If a Key Result previously used Advanced metrics, its
                configuration and progress history will be{' '}
                <span
                  className="font-normal text-[rgba(0,0,0,0.7)]"
                  data-cy="okr-mode-confirmation-modal-restoration-text"
                >
                  available for restoration
                </span>
                . You may also assign new metrics (
                <span
                  className="font-normal text-[rgba(0,0,0,0.7)]"
                  data-cy="okr-mode-confirmation-modal-metrics-text"
                >
                  Numeric, Percentage, Milestone, Currency, Done / Not Done
                </span>
                ) to existing Key Results.
              </p>
            </>
          ) : (
            <>
              <p
                className="text-[14px] font-bold text-[rgba(0,0,0,0.7)] leading-[1.6]"
                data-cy="okr-mode-confirmation-modal-advanced-to-basic-p1"
              >
                Please review your Objectives and Key Results before switching
                to Basic OKR.
              </p>
              <p
                className="text-[14px] font-normal text-[rgba(0,0,0,0.7)] leading-[1.6]"
                data-cy="okr-mode-confirmation-modal-advanced-to-basic-p2"
              >
                Switching to Basic OKR will convert all Key Results to{' '}
                <span
                  className="font-bold text-[rgba(0,0,0,0.7)]"
                  data-cy="okr-mode-confirmation-modal-achieved-text"
                >
                  Achieved / Not Achieved
                </span>
                . Metric types, targets, milestones, weights, and progress
                percentages will be disabled. Your previous Advanced metric
                configurations and progress history will be safely stored and{' '}
                <span
                  className="font-bold text-[rgba(0,0,0,0.7)]"
                  data-cy="okr-mode-confirmation-modal-restore-text"
                >
                  can be restored
                </span>{' '}
                if you switch back to Advanced mode.
              </p>
            </>
          )}
          <p
            className="text-[14px] font-bold text-[rgba(0,0,0,0.7)]"
            data-cy="okr-mode-confirmation-modal-question"
          >
            Do you wish to continue with this process ?
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className="flex justify-end gap-[8px] min-w-0"
          data-cy="okr-mode-confirmation-modal-actions"
        >
          <Button
            type="default"
            onClick={onCancel}
            disabled={loading}
            className="h-[32px] w-[68px] px-0 py-0 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium flex items-center justify-center"
            id="okr-mode-confirmation-cancel-button"
            data-cy="okr-mode-confirmation-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            loading={loading}
            className="h-[32px] w-[68px] px-0 py-0 rounded-lg bg-[#1E40AF] hover:bg-[#1E40AF] focus:bg-[#1E40AF] border-none font-medium flex items-center justify-center"
            id="okr-mode-confirmation-confirm-button"
            data-cy="okr-mode-confirmation-confirm-button"
          >
            Change
          </Button>
        </div>
      </div>

      <style jsx global data-cy="okr-mode-confirmation-modal-styles">{`
        .okr-settings-modal-responsive-wrap .ant-modal {
          max-width: calc(100vw - 32px) !important;
          padding: 0 !important;
        }
        .ant-modal-content {
          border-radius: 8px !important;
        }
        /* Force button dimensions (AntD may override widths via min-width/padding) */
        .ant-modal[data-cy='okr-mode-confirmation-modal'] .ant-btn {
          height: 32px !important;
          width: 68px !important;
          min-width: 68px !important;
          padding: 0 !important;
        }
        .ant-modal-close {
          top: 20px !important;
          right: 24px !important;
        }
        @media (max-width: 480px) {
          .okr-settings-modal-responsive-wrap .ant-modal-content {
            padding: 16px !important;
          }
          .okr-settings-modal-responsive-wrap .ant-modal-close {
            top: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default OkrModeConfirmationModal;
