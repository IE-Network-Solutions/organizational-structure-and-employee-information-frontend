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
  padding = '',
}) => {
  return (
    <div
      className={classNames(
        `${padding ? padding : 'p-3 bg-[#fafafa]'}`,
        className,
      )}
      style={{ borderRadius: 11 }}
    >
      {children}
    </div>
  );
};

export default BlockWrapper;
