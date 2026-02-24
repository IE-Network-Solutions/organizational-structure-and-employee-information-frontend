import React from 'react';

const FolderIcon = () => {
  return (
    <svg
    data-cy="folder-icon"
      width="80"
      height="58"
      viewBox="0 0 80 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" width="64" height="13" rx="3" fill="#D1D5DB"
      data-cy="folder-icon-rect-1"
      />
      <rect x="0.5" y="4.5" width="79" height="53" rx="7.5" fill="white"
      data-cy="folder-icon-rect-2"
      />
      <rect x="0.5" y="4.5" width="79" height="53" rx="7.5" stroke="#E5E7EB"
      data-cy="folder-icon-rect-3"
      />
    </svg>
  );
};

export default FolderIcon;
