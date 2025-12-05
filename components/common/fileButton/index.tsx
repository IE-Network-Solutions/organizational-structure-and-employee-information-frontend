import React, { FC } from 'react';
import { TbFileDownload } from 'react-icons/tb';
import { classNames } from '@/utils/classNames';
import { IoClose } from 'react-icons/io5';
interface FileButtonProps {
  isPreview?: boolean;
  fileName: string;
  link?: string;
  className?: string;
  onRemove?: (e: any) => void;
}

const FileButton: FC<FileButtonProps> = ({
  isPreview = false,
  fileName,
  link,
  className = '',
  onRemove,
}) => {
  return isPreview ? (
    <button
      id="tnaFileButtonId"
      className={classNames(
        'flex items-center rounded-lg border border-gray-200 py-2 px-6 w-max gap-1 text-gray-900',
        undefined,
        [className],
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
      data-cy="file-button-preview"
    >
      <TbFileDownload size={16} data-cy="file-button-download-icon-preview" />
      <span className="text-xs" data-cy="file-button-name-preview">
        {fileName}
      </span>
      {onRemove && (
        <IoClose
          size={16}
          className="text-gray-600 hover:cursor-pointer hover:text-gray-900"
          onClick={onRemove}
          data-cy="file-button-remove-icon"
        />
      )}
    </button>
  ) : (
    <a
      href={link}
      target="_blank"
      id="fileOpenLinkId"
      className={classNames(
        'flex items-center rounded-lg border border-gray-200 py-2 px-6 w-max gap-1 text-gray-900',
        undefined,
        [className],
      )}
      data-cy="file-button-link"
    >
      <TbFileDownload size={16} data-cy="file-button-download-icon-link" />
      <span className="text-xs" data-cy="file-button-name-link">
        {fileName}
      </span>
    </a>
  );
};

export default FileButton;
