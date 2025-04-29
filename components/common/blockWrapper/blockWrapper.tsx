'use client';
import React from 'react';
import { theme } from 'antd';
import classNames from 'classnames';

interface BlockWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  className = '',
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <div
      className={classNames('p-6 bg-gray-100', className)}
      style={{ borderRadius: 11 }}
    >
      {children}
    </div>
  );
};

export default BlockWrapper;
