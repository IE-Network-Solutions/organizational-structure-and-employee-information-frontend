'use client';

import React, { useEffect } from 'react';
import { Popover, Button } from 'antd';

interface DeleteConfirmationPopoverProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  loading?: boolean;
  id?: string;
  'data-cy'?: string;
  children: React.ReactNode;
}

const DeleteConfirmationPopover: React.FC<DeleteConfirmationPopoverProps> = ({
  open,
  onConfirm,
  onCancel,
  message = 'Are you sure you want to permanently delete this record?',
  loading,
  id,
  'data-cy': dataCy,
  children,
}) => {
  useEffect(() => {
    const styleId = 'delete-confirmation-popover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .delete-confirmation-popover .ant-popover-inner {
          padding: 16px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          min-width: 250px !important;
          max-width: 280px !important;
        }
        .delete-confirmation-popover .ant-popover-inner-content {
          padding: 0 !important;
        }
        .delete-confirmation-popover .ant-popover-arrow {
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
      overlayClassName="delete-confirmation-popover"
      content={
        <div
          id={id}
          data-cy={dataCy}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p
            className="text-sm text-black opacity-70 font-normal"
            data-cy="components-common-deleteconfirmationpopover-index-tsx-index-p-69"
          >
            {message}
          </p>
          <div
            data-cy="components-common-deleteconfirmationpopover-index-tsx-index-div-80"
            className="flex justify-end gap-2"
          >
            <Button
              type="default"
              className="h-8 font-normal border border-[#D9D9D9]"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              id={`${id}-cancel-button`}
              data-cy={`${dataCy}-cancel-button`}
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              className="h-8 font-normal"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }}
              loading={loading}
              id={`${id}-delete-button`}
              data-cy={`${dataCy}-delete-button`}
              size="small"
            >
              Delete
            </Button>
          </div>
        </div>
      }
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

export default DeleteConfirmationPopover;
