'use client';

import type { ReactNode } from 'react';
import { Button } from 'antd';
import { IoClose } from 'react-icons/io5';

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
      className="flex items-center justify-between p-4 text-xl font-extrabold text-gray-800"
      data-cy={dataCy}
      id={id}
    >
      <div
        className="min-w-0 flex-1 pr-2"
        data-cy={titleDataCy ?? 'settings-modal-header-title'}
      >
        {title}
      </div>
      <Button
        onClick={onClose}
        data-cy={closeDataCy}
        id={closeId}
        className="text-black hover:!text-primary border-none shrink-0"
        aria-label="Close"
      >
        <IoClose className="text-xl" />
      </Button>
    </div>
  );
}
