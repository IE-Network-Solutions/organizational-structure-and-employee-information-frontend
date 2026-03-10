'use client';

import React from 'react';
import { Modal } from 'antd';
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';

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
      width={650}
      closable={true}
      closeIcon={<CloseOutlined className="text-[#8c8c8c]" />}
      data-cy="unreported-users-modal"
    >
      <div className="py-2" data-cy="unreported-users-modal-content">
        {/* Header with Icon */}
        <div
          className="flex items-center gap-3 mb-8"
          data-cy="unreported-users-modal-header"
        >
          <CloseCircleFilled
            className="text-[#ff4d4f] text-[24px]"
            data-cy="unreported-users-modal-icon"
          />
          <h3
            className="text-[20px] font-bold text-[#262626] m-0 leading-none"
            data-cy="unreported-users-modal-title"
          >
            {title}
          </h3>
        </div>

        {/* Content Section */}
        <div
          className="space-y-8 mb-10 text-center"
          data-cy="unreported-users-modal-content-section"
        >
          <p
            className="text-[18px] font-bold text-[#262626] leading-tight"
            data-cy="unreported-users-modal-warning-text"
          >
            Please make sure that all users have properly reported their tasks
          </p>

          <div className="py-2" data-cy="unreported-users-modal-link-section">
            <p
              className="text-[16px] text-[#595959] mb-3"
              data-cy="unreported-users-modal-link-description"
            >
              Click the below link to view users that have not reported their
              tasks:
            </p>
            <span
              onClick={handleViewList}
              className="text-[#1890ff] text-[16px] hover:underline cursor-pointer font-medium"
              data-cy="unreported-users-modal-link"
            >
              https://selamnew.be/h9uAqr3N7WA?feature=shared
            </span>
          </div>

          <p
            className="text-[18px] font-bold text-[#262626]"
            data-cy="unreported-users-modal-restriction-text"
          >
            You can not change OKR types unless all employees have reported
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className="flex justify-end gap-3"
          data-cy="unreported-users-modal-actions"
        >
          <CustomButton
            type="default"
            title="Cancel"
            onClick={onClose}
            className="h-11 px-8 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626]"
            id="unreported-users-cancel-button"
            data-cy="unreported-users-cancel-button"
          />
          <CustomButton
            type="primary"
            title="Change"
            disabled={true}
            className="h-11 px-8 rounded-lg bg-[#f5f5f5] text-[#bfbfbf] border-[#d9d9d9] cursor-not-allowed"
            id="unreported-users-change-button"
            data-cy="unreported-users-change-button"
          />
        </div>
      </div>

      <style jsx global data-cy="unreported-users-modal-styles">{`
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

export default UnreportedUsersModal;
