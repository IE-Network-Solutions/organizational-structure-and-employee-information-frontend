'use client';

import React, { useEffect } from 'react';
import { Popover, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface CameraAttendanceConfirmationPopoverProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

const CameraAttendanceConfirmationPopover: React.FC<
  CameraAttendanceConfirmationPopoverProps
> = ({ open, onConfirm, onCancel, children }) => {
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

  return (
    <Popover
      open={open}
      onOpenChange={(visible) => {
        if (!visible) {
          onCancel();
        }
      }}
      trigger="click"
      placement="bottomRight"
      align={{ offset: [0, 6] }}
      arrow={false}
      overlayClassName="camera-attendance-confirmation-popover"
      content={
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
      }
      data-cy="camera-attendance-confirmation-popover"
    >
      <span
        className="inline-flex"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </span>
    </Popover>
  );
};

export default CameraAttendanceConfirmationPopover;
