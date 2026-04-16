'use client';
import React from 'react';
import classNames from 'classnames';

interface BlockWrapperProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  withBackground?: boolean;
  id?: string;
  /** Cypress hook; defaults to `block-wrapper` when omitted */
  'data-cy'?: string;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  className = '',
  padding = '',
  withBackground = true,
  id,
  'data-cy': dataCy,
}) => {
  return (
    <div
      id={id}
      className={classNames(
        padding,
        withBackground ? 'bg-gray-100' : '',
        className,
      )}
      style={{ borderRadius: 11 }}
      data-cy={dataCy ?? 'block-wrapper'}
    >
      {children}
    </div>
  );
};

export default BlockWrapper;
