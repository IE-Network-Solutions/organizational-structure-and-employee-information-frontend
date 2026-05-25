'use client';

import React, { useEffect } from 'react';
import { Popover, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ConfirmAnchorRect } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CameraAttendanceConfirmationModalProps {
  open: boolean;
  anchorRect: ConfirmAnchorRect | null;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmationContentProps {
  onConfirm: () => void;
  onCancel: () => void;
  stackedActions?: boolean;
}

const ConfirmationContent: React.FC<ConfirmationContentProps> = ({
  onConfirm,
  onCancel,
  stackedActions = false,
}) => (
  <div
    onClick={(e) => e.stopPropagation()}
    onMouseDown={(e) => e.stopPropagation()}
    data-cy="camera-attendance-confirmation-popover-content"
  >
    <div
      className="flex items-center gap-3 mb-3"
      data-cy="camera-attendance-confirmation-popover-header"
    >
      <ExclamationCircleOutlined
        className="text-[#FAAD14] text-xl shrink-0"
        data-cy="camera-attendance-confirmation-popover-icon"
      />
      <span
        className="text-base font-semibold text-gray-900"
        data-cy="camera-attendance-confirmation-popover-title"
      >
        Camera
      </span>
    </div>

    <p
      className="text-gray-700 text-sm leading-relaxed mb-4"
      data-cy="camera-attendance-confirmation-popover-message"
    >
      You are about to get your image taken for attendance purposes. If you
      decline, your data will not be saved. Do you wish to continue?
    </p>

    <div
      className={
        stackedActions
          ? 'flex flex-col-reverse gap-2'
          : 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3'
      }
      data-cy="camera-attendance-confirmation-popover-actions"
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        className="font-normal w-full sm:w-auto"
        block={stackedActions}
        data-cy="camera-attendance-confirmation-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}
        className="font-normal w-full sm:w-auto"
        block={stackedActions}
        data-cy="camera-attendance-confirmation-ok"
      >
        OK
      </Button>
    </div>
  </div>
);

const CameraAttendanceConfirmationModal: React.FC<
  CameraAttendanceConfirmationModalProps
> = ({ open, anchorRect, onConfirm, onCancel }) => {
  const { isMobile, isTablet } = useIsMobile();
  const useCenteredLayout = isMobile || isTablet;

  useEffect(() => {
    const styleId = 'camera-attendance-confirmation-popover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .camera-attendance-confirmation-popover .ant-popover-inner {
          padding: 16px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          width: min(420px, calc(100vw - 32px)) !important;
          max-width: calc(100vw - 32px) !important;
        }
        .camera-attendance-confirmation-popover .ant-popover-inner-content {
          padding: 0 !important;
        }
        .camera-attendance-confirmation-popover .ant-popover-arrow {
          display: none !important;
        }
        .camera-attendance-confirmation-modal .ant-modal-content {
          border-radius: 8px;
        }
        @media (max-width: 640px) {
          .camera-attendance-confirmation-popover .ant-popover-inner {
            padding: 14px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (useCenteredLayout) {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        closable
        centered
        destroyOnClose
        maskClosable
        width="min(420px, calc(100vw - 32px))"
        className="camera-attendance-confirmation-modal"
        data-cy="camera-attendance-confirmation-modal"
        styles={{
          body: { padding: '16px 20px 20px' },
        }}
      >
        <ConfirmationContent
          onConfirm={onConfirm}
          onCancel={onCancel}
          stackedActions
        />
      </Modal>
    );
  }

  if (!anchorRect) {
    return null;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          onCancel();
        }
      }}
      trigger={[]}
      placement="bottomRight"
      align={{ offset: [0, 6] }}
      arrow={false}
      autoAdjustOverflow
      overlayClassName="camera-attendance-confirmation-popover"
      content={
        <ConfirmationContent onConfirm={onConfirm} onCancel={onCancel} />
      }
      getPopupContainer={() => document.body}
      data-cy="camera-attendance-confirmation-popover"
    >
      <span
        aria-hidden
        className="pointer-events-none inline-block"
        style={{
          position: 'fixed',
          top: anchorRect.top,
          left: anchorRect.left,
          width: anchorRect.width,
          height: anchorRect.height,
          zIndex: 1,
        }}
        data-cy="camera-attendance-confirmation-popover-anchor"
      />
    </Popover>
  );
};

export default CameraAttendanceConfirmationModal;
