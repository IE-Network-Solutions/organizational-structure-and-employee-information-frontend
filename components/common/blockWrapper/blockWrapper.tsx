'use client';
import React from 'react';
import classNames from 'classnames';

interface BlockWrapperProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  className = '',
  padding = '!p-2 bg-gray-100',
}) => {
  return (
    <div
      className={classNames(
        `${padding ? padding : 'p-6 bg-gray-100'}`,
        className,
      )}
      style={{ borderRadius: 11 }}
    >
      {children}
    </div>
  );
};

export default BlockWrapper;
