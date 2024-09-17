import React, { FC } from 'react';
import { TbFileDownload } from 'react-icons/tb';
import { classNames } from '@/utils/classNames';
interface FileButtonProps {
  fileName: string;
  link: string;
  className?: string;
}

const FileButton: FC<FileButtonProps> = ({
  fileName,
  link,
  className = '',
}) => {
  return (
    <a
      href={link}
      target="_blank"
      className={classNames(
        'flex items-center rounded-lg border border-gray-200 py-2 px-6 w-max gap-1 text-gray-900',
        undefined,
        [className],
      )}
    >
      <TbFileDownload size={16} />
      <span className="text-xs">{fileName}</span>
    </a>
  );
};

export default FileButton;
