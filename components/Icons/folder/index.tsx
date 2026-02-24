import React from 'react';

const FolderIcon = ({ 'data-cy': dataCy }: { 'data-cy'?: string }) => {
  return (
    <svg
      width="80"
      height="58"
      viewBox="0 0 80 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-cy={dataCy || 'folder-icon'}
    >
      <rect
        x="8"
        width="64"
        height="13"
        rx="3"
        fill="#D1D5DB"
        data-cy={dataCy ? `${dataCy}-tab` : 'folder-icon-tab'}
      />
      <rect
        x="0.5"
        y="4.5"
        width="79"
        height="53"
        rx="7.5"
        fill="white"
        data-cy={dataCy ? `${dataCy}-body` : 'folder-icon-body'}
      />
      <rect
        x="0.5"
        y="4.5"
        width="79"
        height="53"
        rx="7.5"
        stroke="#E5E7EB"
        data-cy={dataCy ? `${dataCy}-border` : 'folder-icon-border'}
      />
    </svg>
  );
};

export default FolderIcon;
