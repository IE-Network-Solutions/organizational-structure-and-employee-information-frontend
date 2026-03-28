'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons';

interface UnreportedUsersModalProps {
  open: boolean;
  onClose: () => void;
  onViewList: () => void;
  transitionDirection: 'BasicToAdvanced' | 'AdvancedToBasic';
}

const UnreportedUsersModal: React.FC<UnreportedUsersModalProps> = ({
  open,
  onClose,
  onViewList,
  transitionDirection,
}) => {
  const isBasicToAdvanced = transitionDirection === 'BasicToAdvanced';
  const title = isBasicToAdvanced
    ? 'Change to Advanced OKR'
    : 'Change to Basic OKR';

  const handleViewList = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewList();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="min(650px, calc(100vw - 32px))"
      wrapClassName="okr-settings-modal-responsive-wrap"
      styles={{
        content: {
          padding: '20px 24px',
          borderRadius: 8,
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
        },
      }}
      closable={true}
      closeIcon={<CloseOutlined className="text-[#8c8c8c]" />}
      data-cy="unreported-users-modal"
    >
      <div
        className="flex flex-col gap-6 min-w-0 max-w-full"
        data-cy="unreported-users-modal-content"
      >
        {/* Header with Icon */}
        <div
          className="flex items-center gap-3"
          data-cy="unreported-users-modal-header"
        >
          <CloseCircleFilled
            className="text-[#ff4d4f] text-[24px]"
            data-cy="unreported-users-modal-icon"
          />
          <h3
            className="text-[20px] font-bold text-[rgba(0,0,0,0.7)] m-0 leading-none"
            data-cy="unreported-users-modal-title"
          >
            {title}
          </h3>
        </div>

        {/* Three sections: top / middle (link) / bottom — 16px between */}
        <div
          className="flex flex-col gap-4 text-center"
          data-cy="unreported-users-modal-content-section"
        >
          <p
            className="text-[18px] font-bold text-[rgba(0,0,0,0.7)] leading-tight m-0"
            data-cy="unreported-users-modal-warning-text"
          >
            Please make sure that all users have properly reported their tasks
          </p>

          <div
            className="flex flex-col gap-0"
            data-cy="unreported-users-modal-link-section"
          >
            <p
              className="text-[16px] text-[rgba(0,0,0,0.7)] m-0"
              data-cy="unreported-users-modal-link-description"
            >
              Click the below link to view users that have not reported their
              tasks:
            </p>
            <span
              onClick={handleViewList}
              className="text-[#1890ff] text-[16px] hover:underline cursor-pointer font-medium break-all inline-block max-w-full"
              data-cy="unreported-users-modal-link"
            >
              https://selamnew.be/h9uAqr3N7WA?feature=shared
            </span>
          </div>

          <p
            className="text-[18px] font-bold text-[rgba(0,0,0,0.7)] m-0"
            data-cy="unreported-users-modal-restriction-text"
          >
            You can not change OKR types unless all employees have reported
          </p>
        </div>

        {/* Action Buttons — 24px from body via parent gap-6 */}
        <div
          className="flex justify-end gap-3 min-w-0"
          data-cy="unreported-users-modal-actions"
        >
          <Button
            type="default"
            onClick={onClose}
            className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
            id="unreported-users-cancel-button"
            data-cy="unreported-users-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={true}
            className="h-10 px-8 rounded-lg bg-[#f5f5f5] text-[#bfbfbf] border-[#d9d9d9] cursor-not-allowed font-medium flex items-center justify-center"
            id="unreported-users-change-button"
            data-cy="unreported-users-change-button"
          >
            Change
          </Button>
        </div>
      </div>

      <style jsx global data-cy="unreported-users-modal-styles">{`
        .okr-settings-modal-responsive-wrap .ant-modal {
          max-width: calc(100vw - 32px) !important;
          padding: 0 !important;
        }
        .ant-modal-content {
          border-radius: 8px !important;
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

export default UnreportedUsersModal;
