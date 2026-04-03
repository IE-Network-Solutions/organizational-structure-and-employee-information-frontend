'use client';

import type { ReactNode } from 'react';
import { CloseOutlined } from '@ant-design/icons';

export type SettingsModalHeaderProps = {
  title: ReactNode;
  onClose: () => void;
  'data-cy'?: string;
  id?: string;
  titleDataCy?: string;
  closeDataCy?: string;
  closeId?: string;
};

export function SettingsModalHeader({
  title,
  onClose,
  'data-cy': dataCy = 'settings-modal-header',
  id,
  titleDataCy,
  closeDataCy = 'settings-modal-header-close-button',
  closeId,
}: SettingsModalHeaderProps) {
  return (
    <div
      className="flex w-full items-center justify-between gap-4"
      id={id}
      data-cy={dataCy}
    >
      <span
        className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-[#000000]"
        data-cy={titleDataCy ?? 'settings-modal-header-title'}
      >
        {title}
      </span>
      <button
        type="button"
        data-cy={closeDataCy}
        id={closeId}
        onClick={onClose}
        aria-label="Close"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 "
      >
        <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
      </button>
    </div>
  );
}
