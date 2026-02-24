'use client';
import React from 'react';
import { Button } from 'antd';
import { IoIosArrowForward } from 'react-icons/io';

interface TransferButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  hasItemsInBuckets: boolean;
}

const TransferButton: React.FC<TransferButtonProps> = ({
  disabled,
  loading,
  onClick,
  hasItemsInBuckets,
}) => {
  const borderColorClass = hasItemsInBuckets
    ? 'border-primary'
    : 'border-gray-400';
  const bgColorClass = hasItemsInBuckets ? 'bg-primary' : 'bg-gray-400';
  const textColorClass = hasItemsInBuckets ? 'text-primary' : 'text-gray-900';

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center relative z-20"
      id="transfer-action-container"
      data-cy="transfer-action-container"
    >
      {/* Connecting line - Vertical on mobile, horizontal on desktop */}
      {/* Vertical line for mobile (when boxes are stacked) */}
      <div
        className={`absolute left-1/2 w-0.5 transform -translate-x-1/2 z-0 ${bgColorClass} lg:hidden`}
        style={{
          top: '-1rem',
          bottom: '-1rem',
        }}
      />
      {/* Horizontal line for desktop (when boxes are side-by-side) */}
      <div
        className={`hidden lg:block absolute top-1/2 h-0.5 transform -translate-y-1/2 z-0 ${bgColorClass}`}
        style={{
          left: '-2rem',
          right: '-2rem',
        }}
      />
      {/* Button on top of line */}
      <div className="relative z-10 bg-white "
      id="transfer-action-container-button-div"
      data-cy="transfer-action-container-button-div"
      >
        <Button
          type="default"
          onClick={onClick}
          disabled={disabled}
          loading={loading}
          className={`px-4 h-9 flex items-center gap-2 ${borderColorClass} ${textColorClass}`}
          data-cy="org-settings-transfer-submit-btn"
          id="org-settings-transfer-submit-btn"
        >
          <span className={textColorClass}>Transfer</span>
          <IoIosArrowForward
           className={textColorClass}
           data-cy="transfer-action-container-button-icon"
           />
        </Button>
      </div>
    </div>
  );
};

export default TransferButton;
