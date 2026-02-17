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
          className="py-2"
          style={{ width: '100%' }}
        >
          <p
            className="text-base text-gray-900 mb-4 text-center"
            data-cy="components-common-deleteconfirmationpopover-index-tsx-index-p-69"
            style={{
              lineHeight: '1.4',
              wordBreak: 'break-word',
              maxWidth: '240px',
              margin: '0 auto 16px auto',
            }}
          >
            {message}
          </p>
          <div
            data-cy="components-common-deleteconfirmationpopover-index-tsx-index-div-80"
            className="flex justify-center gap-4"
          >
            <Button
              className="px-6 py-2 text-sm font-bold border border-gray-300 bg-white hover:bg-gray-50"
              onClick={onCancel}
              id={`${id}-cancel-button`}
              data-cy={`${dataCy}-cancel-button`}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              className="px-6 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 border-none"
              onClick={onConfirm}
              loading={loading}
              id={`${id}-delete-button`}
              data-cy={`${dataCy}-delete-button`}
            >
              Delete
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default DeleteConfirmationPopover;
