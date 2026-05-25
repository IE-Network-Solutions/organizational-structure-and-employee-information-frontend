'use client';

import React, { useEffect } from 'react';
import { Popover, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ConfirmAnchorRect } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';

interface CameraAttendanceConfirmationModalProps {
  open: boolean;
  anchorRect: ConfirmAnchorRect | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const CameraAttendanceConfirmationModal: React.FC<
  CameraAttendanceConfirmationModalProps
> = ({ open, anchorRect, onConfirm, onCancel }) => {
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
          width: 420px !important;
          max-width: calc(100vw - 32px) !important;
        }
        .camera-attendance-confirmation-popover .ant-popover-inner-content {
          padding: 0 !important;
        }
        .camera-attendance-confirmation-popover .ant-popover-arrow {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!anchorRect) {
    return null;
  }

  const popoverContent = (
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
        className="text-gray-700 text-sm mb-4"
        data-cy="camera-attendance-confirmation-popover-message"
      >
        You are about to get your image taken for attendance purposes if you
        decline your data will not be saved do you wish to continue ?
      </p>

      <div
        className="flex justify-end gap-3"
        data-cy="camera-attendance-confirmation-popover-actions"
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="font-normal"
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
          className="font-normal"
          data-cy="camera-attendance-confirmation-ok"
        >
          OK
        </Button>
      </div>
    </div>
  );

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
      overlayClassName="camera-attendance-confirmation-popover"
      content={popoverContent}
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
