'use client';
import React from 'react';
import { Button } from 'antd';

interface MergeButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  hasItemsInBuckets: boolean;
  borderColorClass: string;
  textColorClass: string;
  isMobile?: boolean;
  buttonRef?: React.RefObject<HTMLDivElement>;
}

const MergeButton: React.FC<MergeButtonProps> = ({
  disabled,
  loading,
  onClick,
  hasItemsInBuckets,
  borderColorClass,
  textColorClass,
  isMobile = false,
  buttonRef,
}) => {
  return (
    <div
      ref={buttonRef}
      className={`flex items-center justify-center relative z-20 border border-gray-200 rounded-lg py-4 px-8 ${hasItemsInBuckets ? 'border-primary' : 'border-gray-400'}`}
      data-cy={
        isMobile ? 'merge-action-container-mobile' : 'merge-action-container'
      }
    >
      <Button
        type="default"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        className={`px-4 h-9 flex items-center gap-2 ${hasItemsInBuckets ? 'bg-primary border-primary text-white hover:bg-primary/90' : `${borderColorClass} ${textColorClass}`}`}
        data-cy={
          isMobile
            ? 'org-settings-merge-submit-btn-mobile'
            : 'org-settings-merge-submit-btn'
        }
        id={
          isMobile
            ? 'org-settings-merge-submit-btn-mobile'
            : 'org-settings-merge-submit-btn'
        }
      >
        <span className={hasItemsInBuckets ? 'text-white' : textColorClass}>
          Merge
        </span>
      </Button>
    </div>
  );
};

export default MergeButton;
