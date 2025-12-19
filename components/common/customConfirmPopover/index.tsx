'use client';

import React, { useEffect, useRef } from 'react';
import { Popover, Button } from 'antd';
import { useCustomConfirmPopoverStore } from '@/store/uistate/features/common/customConfirmPopover';

interface CustomConfirmPopoverProps {
  title: string;
  onConfirm: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  placement?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  id?: string;
  'data-cy'?: string;
  children: React.ReactNode;
}

const CustomConfirmPopover: React.FC<CustomConfirmPopoverProps> = ({
  title,
  onConfirm,
  onCancel,
  okText = 'Confirm',
  cancelText = 'Cancel',
  placement = 'top',
  id,
  'data-cy': dataCy,
  children,
}) => {
  const popoverId = id || `popover-${Math.random().toString(36).substr(2, 9)}`;
  const { getPopoverState, setPopoverOpen, setPopoverWidth } = useCustomConfirmPopoverStore();
  const { open, popoverWidth } = getPopoverState(popoverId);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const styleId = 'custom-confirm-popover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .custom-confirm-popover .ant-popover-inner {
          padding: 16px !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          background: white !important;
        }
        .custom-confirm-popover .ant-popover-inner-content {
          padding: 0 !important;
        }
        .custom-confirm-popover .ant-popover-arrow {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (open && wrapperRef.current) {
      const width = wrapperRef.current.offsetWidth;
      setPopoverWidth(popoverId, width);
    }
  }, [open, popoverId, setPopoverWidth]);

  const handleConfirm = () => {
    setPopoverOpen(popoverId, false);
    onConfirm();
  };

  const handleCancel = () => {
    setPopoverOpen(popoverId, false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      <Popover
        open={open}
        onOpenChange={(visible) => setPopoverOpen(popoverId, visible)}
        trigger="click"
        placement={placement}
        overlayClassName="custom-confirm-popover"
        overlayStyle={popoverWidth ? { width: `${popoverWidth}px` } : undefined}
        content={
        <div id={id} data-cy={dataCy} style={{ width: '100%' }}>
          <p
            className="text-sm text-gray-900 mb-4 text-left"
            style={{
              lineHeight: '1.5',
              wordBreak: 'break-word',
              margin: '0 0 16px 0',
              padding: '0',
              color: '#1F2937',
              fontWeight: 400,
            }}
          >
            {title}
          </p>
          <div className="flex justify-center gap-2">
            <Button
              className="px-4 py-1 text-xs font-medium border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 h-7 min-w-[70px] rounded"
              onClick={handleCancel}
              id={`${id}-cancel-button`}
              data-cy={`${dataCy}-cancel-button`}
            >
              {cancelText}
            </Button>
            <Button
              type="primary"
              danger
              className="px-4 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 border-none text-white h-7 min-w-[70px] rounded"
              onClick={handleConfirm}
              id={`${id}-confirm-button`}
              data-cy={`${dataCy}-confirm-button`}
            >
              {okText}
            </Button>
          </div>
        </div>
      }
      >
        {children}
      </Popover>
    </div>
  );
};

export default CustomConfirmPopover;
