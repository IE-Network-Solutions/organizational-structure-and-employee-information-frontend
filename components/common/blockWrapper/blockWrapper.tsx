'use client';
import React from 'react';
import { theme } from 'antd';
import { classNames } from '@/utils/classNames';

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
      className={classNames('p-6', undefined, [className])}
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      {children}
    </div>
  );
};

export default BlockWrapper;
