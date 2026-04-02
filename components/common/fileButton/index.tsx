import React, { FC } from 'react';
import dayjs from 'dayjs';
import { TbFileDownload } from 'react-icons/tb';
import { classNames } from '@/utils/classNames';
import { IoClose } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
interface FileButtonProps {
  isPreview?: boolean;
  fileName: string;
  link?: string;
  className?: string;
  createdAt?: string;
  onRemove?: (e: any) => void;
}

const FileButton: FC<FileButtonProps> = ({
  isPreview = false,
  fileName,
  link,
  className = '',
  createdAt,
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
      <TbFileDownload size={16} />
      <span
        data-cy="components-common-filebutton-index-tsx-index-span-34"
        className="text-xs"
      >
        {fileName}
      </span>
      {onRemove && (
        <IoClose
          size={16}
          className="text-gray-600 hover:cursor-pointer hover:text-gray-900"
          onClick={onRemove}
        />
      )}
    </button>
  ) : (
    <div
      id="fileOpenLinkId"
      data-cy="components-common-filebutton-index-tsx-index-a-49"
      className={classNames(
        'flex items-center justify-between rounded-lg border border-gray-200 py-2 px-4 w-full h-[60px]',
        undefined,
        [className],
      )}
    >
      <div data-cy="file-button-content" className="font-normal">
        <div data-cy="file-button-content-name" className="text-sm">
          {fileName}
        </div>
        {createdAt && (
          <div
            data-cy="file-button-content-date"
            className="text-xs text-gray-600"
          >
            {dayjs(createdAt).isValid()
              ? dayjs(createdAt).format('D MMM YYYY')
              : createdAt}
          </div>
        )}
      </div>

      <a
        target="_blank"
        href={link}
        className="border border-[#D9D9D9] rounded-lg h-8 w-8 flex items-center justify-center"
      >
        <MdOutlineFileDownload
          className="w-3 h-3"
          data-cy="file-button-download-icon"
        />
      </a>
    </div>
  );
};

export default FileButton;
