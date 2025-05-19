'use client';
import React from 'react';
import { classNames } from '@/utils/classNames';
import { Tooltip } from 'antd';
import { useIsMobile } from '../hooks/useIsMobile';
interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium';
  toolTip?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  size = 'medium',
  children,
  toolTip,
}) => {
  const { isMobile } = useIsMobile();
  return (
    <div className="flex justify-between flex-wrap items-center p-2">
      <div className="flex-1">
        {isMobile ? (
          <Tooltip title={toolTip} placement="top">
            <h2
              className={classNames('text-gray-900 mt-10', {
                'text-xl': size === 'medium',
                'text-lg': size === 'small',
              })}
            >
              {title}
            </h2>
          </Tooltip>
        ) : (
          <Tooltip title={toolTip} placement="top">
            <h2
              className={classNames('text-gray-900 mt-5', {
                'text-2xl': size === 'medium',
                'text-xl': size === 'small',
              })}
            >
              {title}
            </h2>
          </Tooltip>
        )}

        {description && (
          <div className="m-1 sm:mt-2 text-sm text-gray-600 font-medium">
            {description}
          </div>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
};

export default PageHeader;
